import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useGestureTracker } from "./useGestureTracker";
import { useAnalytics } from "./useAnalytics";
import { evaluateGestureMatch, isMotionSign } from "../utils/gestureMath";
import { API } from "../api";

// ── Tuning Constants ────────────────────────────────────────
const CONSECUTIVE_FRAMES_REQUIRED = 6; // 600ms sustained hold at 100ms interval
const SCORE_PER_CONFIRMATION = 20;     // 5 confirmed holds = 100% (not 10 lucky twitches)
const FAILURE_THRESHOLD = 30;          // ~3 seconds of consistent failure before intervention

/**
 * Detection states exposed to the UI for contextual feedback.
 * WAITING      — models loading or paused
 * NO_HAND      — no hand in frame
 * WRONG_SIGN   — hand detected, doesn't match
 * HOLDING      — matching, building confirmation buffer
 * MATCHED      — confirmed match, scoring
 * MOTION_SIGN  — sign requires motion, manual completion only
 */
export const DETECTION_STATES = {
  WAITING: 'WAITING',
  NO_HAND: 'NO_HAND',
  WRONG_SIGN: 'WRONG_SIGN',
  HOLDING: 'HOLDING',
  MATCHED: 'MATCHED',
  MOTION_SIGN: 'MOTION_SIGN',
};

export function usePracticeSession() {
  const location = useLocation();
  const { trackEvent } = useAnalytics();
  const { model, poseModel, loading: modelLoading, error: modelError } = useGestureTracker();

  // Build flat curriculum from route state
  const flatCurriculum = useMemo(() => {
    const raw = location.state?.curriculum;
    if (!raw || !raw.length) return [{ module: 'Demo Lesson', sign: 'Thumbs Up Demo' }];
    
    if (typeof raw[0] === 'string') {
       return raw.map(sign => ({ module: 'General Practice', sign }));
    }

    const flattened = [];
    raw.forEach(mod => {
      (mod.signs || []).forEach(sign => {
         flattened.push({ 
           module: mod.module, 
           introVideoUrl: mod.introVideoUrl,
           name: sign.name || sign,
           demoUrl: sign.demoUrl,
           correctionUrl: sign.correctionUrl
         });
      });
    });
    return flattened.length > 0 ? flattened : [{ module: 'Demo Lesson', sign: 'Thumbs Up Demo' }];
  }, [location.state]);

  // Core state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gestureStatus, setGestureStatus] = useState('Waiting for action...');
  const [detectionState, setDetectionState] = useState(DETECTION_STATES.WAITING);
  const [currentErrorCode, setCurrentErrorCode] = useState(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(null);

  // Tutorial state
  const [showIntro, setShowIntro] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);
  const failureCountRef = useRef(0);
  const temporalBufferRef = useRef(0);
  const interventionShownForSignRef = useRef(null); // Cooldown: once per sign

  // Derived values
  const targetItem = flatCurriculum[currentIndex] || flatCurriculum[0];
  const targetSign = targetItem.name || targetItem.sign;
  const targetModule = targetItem.module;
  const targetIsMotionSign = isMotionSign(targetSign);

  // ── 1.5: Verify enrollment/membership on mount ───────────
  useEffect(() => {
    const courseId = location.state?.courseId;
    if (courseId) {
      API.get(`/courses/${courseId}/verify-access`)
        .then(res => {
          if (!res.data.access) {
            setAccessDenied(res.data.reason || "Access denied");
          }
        })
        .catch(() => {
          // Endpoint may not exist yet during rollout — fail open
        });
    }
  }, [location.state?.courseId]);

  // Track Session Start
  useEffect(() => {
    if (targetModule) {
      trackEvent('session_start', { module: targetModule });
    }
  }, [targetModule, trackEvent]);

  // Initialize Module Intro check
  useEffect(() => {
    const cacheKey = `signsync_intro_seen_${targetModule.replace(/\s+/g, '_')}`;
    const hasSeen = localStorage.getItem(cacheKey);
    if (!hasSeen && targetItem.introVideoUrl) {
      setShowIntro(true);
    }
  }, [targetModule, targetItem.introVideoUrl]);

  // Reset intervention cooldown when advancing to a new sign
  useEffect(() => {
    interventionShownForSignRef.current = null;
    failureCountRef.current = 0;
    temporalBufferRef.current = 0;
    
    if (targetIsMotionSign) {
      setDetectionState(DETECTION_STATES.MOTION_SIGN);
      setGestureStatus(`Motion sign — watch the demo and practice`);
    } else {
      setDetectionState(DETECTION_STATES.WAITING);
    }
  }, [currentIndex, targetIsMotionSign]);

  const handleIntroComplete = useCallback(() => {
    const cacheKey = `signsync_intro_seen_${targetModule.replace(/\s+/g, '_')}`;
    localStorage.setItem(cacheKey, 'true');
    setShowIntro(false);
  }, [targetModule]);

  const handleResumeFromIntervention = useCallback(() => {
    setShowIntervention(false);
    failureCountRef.current = 0;
  }, []);

  // ── 1.3: Manual completion for motion signs ───────────────
  const handleMotionSignComplete = useCallback(() => {
    setScore(100);
  }, []);

  // ── 1.4: Save progress for a specific module ─────────────
  const saveProgress = useCallback((moduleName) => {
    const courseId = location.state?.courseId;
    if (courseId) {
      API.post(`/courses/${courseId}/progress`, { module_name: moduleName })
        .catch(err => console.error("Failed to save course progress", err));
    }
  }, [location.state?.courseId]);

  // Progression logic — triggers on score reaching 100
  useEffect(() => {
    if (score >= 100 && !completed && !isAdvancing) {
      setIsAdvancing(true);
      failureCountRef.current = 0;
      temporalBufferRef.current = 0;
      
      const currentModule = flatCurriculum[currentIndex].module;
      
      // ── 1.4: Save progress immediately on every sign completion ──
      saveProgress(currentModule);
      
      if (currentIndex < flatCurriculum.length - 1) {
        const nextModule = flatCurriculum[currentIndex + 1].module;
        
        // Track analytics on module boundary
        if (currentModule !== nextModule) {
           trackEvent('module_complete', { module: currentModule });
        }

        setGestureStatus(`✓ Loading ${flatCurriculum[currentIndex + 1].name || flatCurriculum[currentIndex + 1].sign}...`);
        setDetectionState(DETECTION_STATES.MATCHED);
        setTimeout(() => {
          setScore(0);
          setCurrentIndex(c => c + 1);
          setIsAdvancing(false);
        }, 1200);
      } else {
        setCompleted(true);
        setGestureStatus("COURSE COMPLETE");
        setDetectionState(DETECTION_STATES.MATCHED);
        trackEvent('module_complete', { module: currentModule });
      }
    }
  }, [score, completed, isAdvancing, currentIndex, flatCurriculum, trackEvent, saveProgress]);

  // ── Detection callback ────────────────────────────────────
  const detect = useCallback(async (webcamRef, canvasRef, drawMesh) => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      model && 
      poseModel &&
      !showIntro && 
      !showIntervention &&
      !targetIsMotionSign // Skip detection for motion signs
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const [hand, poses] = await Promise.all([
        model.estimateHands(video),
        poseModel.estimatePoses(video)
      ]);

      const validHandDetected = hand.length > 0 && (hand[0].score >= 0.5 || hand[0].score === undefined);

      if (validHandDetected || poses.length > 0) {
        let matchState = 'NO_HAND';

        if (validHandDetected && !completed && !isAdvancing) {
          const result = evaluateGestureMatch(hand[0].landmarks, targetSign);
          matchState = result.state;

          if (result.state === 'MATCH') {
            // ── 1.1: Multi-frame confirmation ──
            temporalBufferRef.current += 1;
            if (temporalBufferRef.current >= CONSECUTIVE_FRAMES_REQUIRED) {
              setGestureStatus(`MATCHED: '${targetSign}'`);
              setDetectionState(DETECTION_STATES.MATCHED);
              setCurrentErrorCode(null);
              setScore(prev => Math.min(prev + SCORE_PER_CONFIRMATION, 100));
              failureCountRef.current = Math.max(0, failureCountRef.current - 1);
              temporalBufferRef.current = 0; // Require full re-hold for next points
            } else {
              setGestureStatus(`Hold steady... (${temporalBufferRef.current}/${CONSECUTIVE_FRAMES_REQUIRED})`);
              setDetectionState(DETECTION_STATES.HOLDING);
              setCurrentErrorCode(null);
            }
          } else if (result.state === 'WRONG_SIGN') {
            // ── 1.2: Wrong sign — decay buffer, track failures ──
            temporalBufferRef.current = Math.max(0, temporalBufferRef.current - 1);
            setGestureStatus(`Adjust your sign: '${targetSign}'`);
            setDetectionState(DETECTION_STATES.WRONG_SIGN);
            setCurrentErrorCode(result.errorCode);
            failureCountRef.current += 1;
            
            // ── 2.1: Intervention cooldown — once per sign ──
            if (
              failureCountRef.current > FAILURE_THRESHOLD && 
              targetItem.correctionUrl &&
              interventionShownForSignRef.current !== targetSign
            ) {
              setShowIntervention(true);
              interventionShownForSignRef.current = targetSign;
              trackEvent('ai_failure', { sign: targetSign, module: targetModule });
              failureCountRef.current = 0; // Reset after showing
            }
          }
        } else if (!validHandDetected) {
          // ── 1.2: No hand — reset buffer, don't count as failure ──
          temporalBufferRef.current = 0;
          setDetectionState(DETECTION_STATES.NO_HAND);
          setGestureStatus('Show your hand to the camera');
          setCurrentErrorCode(null);
        }

        const handToDraw = validHandDetected ? hand : [];
        drawMesh(handToDraw, poses, canvasRef.current.getContext("2d"), matchState === 'MATCH');
      } else {
        // No hand, no pose — clear everything
        temporalBufferRef.current = 0;
        if (!isAdvancing) {
          setDetectionState(DETECTION_STATES.NO_HAND);
          setGestureStatus('Show your hand to the camera');
          setCurrentErrorCode(null);
        }
        drawMesh([], [], canvasRef.current.getContext("2d"), false);
      }
    }
  }, [model, poseModel, completed, isAdvancing, targetSign, showIntro, showIntervention, targetItem.correctionUrl, trackEvent, targetModule, targetIsMotionSign]);

  return {
    // Curriculum
    flatCurriculum,
    currentIndex,
    targetItem,
    targetSign,
    targetModule,
    targetIsMotionSign,
    // State
    gestureStatus,
    detectionState,
    currentErrorCode,
    score,
    completed,
    modelLoading,
    modelError,
    model,
    poseModel,
    accessDenied,
    // Tutorial
    showIntro,
    showIntervention,
    handleIntroComplete,
    handleResumeFromIntervention,
    // Motion signs
    handleMotionSignComplete,
    // Detection
    detect,
    // Constants (for UI)
    CONSECUTIVE_FRAMES_REQUIRED,
  };
}

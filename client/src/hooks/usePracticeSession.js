import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useGestureTracker } from "./useGestureTracker";
import { useAnalytics } from "./useAnalytics";
import { evaluateGestureMatch } from "../utils/gestureMath";
import { API } from "../api";

export function usePracticeSession() {
  const location = useLocation();
  const { trackEvent } = useAnalytics();
  const { model, poseModel, loading: modelLoading } = useGestureTracker();

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
  const [gestureStatus, setGestureStatus] = useState(`Waiting for action...`);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Tutorial state
  const [showIntro, setShowIntro] = useState(false);
  const [showIntervention, setShowIntervention] = useState(false);
  const failureCountRef = useRef(0);

  // Derived values
  const targetItem = flatCurriculum[currentIndex] || flatCurriculum[0];
  const targetSign = targetItem.name || targetItem.sign;
  const targetModule = targetItem.module;

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

  const handleIntroComplete = useCallback(() => {
    const cacheKey = `signsync_intro_seen_${targetModule.replace(/\s+/g, '_')}`;
    localStorage.setItem(cacheKey, 'true');
    setShowIntro(false);
  }, [targetModule]);

  const handleResumeFromIntervention = useCallback(() => {
    setShowIntervention(false);
    failureCountRef.current = 0;
  }, []);

  // Progression logic
  useEffect(() => {
    if (score >= 100 && !completed && !isAdvancing) {
      setIsAdvancing(true);
      failureCountRef.current = 0;
      
      const currentModule = flatCurriculum[currentIndex].module;
      
      if (currentIndex < flatCurriculum.length - 1) {
        const nextModule = flatCurriculum[currentIndex + 1].module;
        
        if (currentModule !== nextModule) {
           trackEvent('module_complete', { module: currentModule });
           const courseId = location.state?.courseId;
           if (courseId) {
             API.post(`/courses/${courseId}/progress`, { module_name: currentModule })
               .catch(err => console.error("Failed to save course progress", err));
           }
        }

        setGestureStatus(`Detected! Loading ${flatCurriculum[currentIndex + 1].name || flatCurriculum[currentIndex + 1].sign}...`);
        setTimeout(() => {
          setScore(0);
          setCurrentIndex(c => c + 1);
          setIsAdvancing(false);
        }, 1200);
      } else {
        setCompleted(true);
        setGestureStatus("COURSE COMPLETE");
        trackEvent('module_complete', { module: currentModule });
        
        const courseId = location.state?.courseId;
        if (courseId) {
          API.post(`/courses/${courseId}/progress`, { module_name: currentModule })
            .catch(err => console.error("Failed to save course progress", err));
        }
      }
    }
  }, [score, completed, isAdvancing, currentIndex, flatCurriculum, trackEvent, location.state]);

  // Detection callback
  const detect = useCallback(async (webcamRef, canvasRef, drawMesh) => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      model && 
      poseModel &&
      !showIntro && 
      !showIntervention
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

      if (hand.length > 0 || poses.length > 0) {
        drawMesh(hand, poses, canvasRef.current.getContext("2d"));
        if (hand.length > 0 && !completed && !isAdvancing) {
          const isMatch = evaluateGestureMatch(hand[0].landmarks, targetSign);
          if (isMatch) {
            setGestureStatus(`MATCHED: '${targetSign}'`);
            setScore(prev => Math.min(prev + 10, 100));
            failureCountRef.current = Math.max(0, failureCountRef.current - 0.5);
          } else {
             setGestureStatus(`Tracking active... Make sign: '${targetSign}'`);
             failureCountRef.current += 1;
             
             if (failureCountRef.current > 30 && targetItem.correctionUrl) {
               setShowIntervention(true);
               trackEvent('ai_failure', { sign: targetSign, module: targetModule });
               failureCountRef.current = -50;
             }
          }
        }
      } else {
        if (!isAdvancing) setGestureStatus(`Tracking active... Make sign: '${targetSign}'`);
      }
    }
  }, [model, poseModel, completed, isAdvancing, targetSign, showIntro, showIntervention, targetItem.correctionUrl, trackEvent, targetModule]);

  return {
    // Curriculum
    flatCurriculum,
    currentIndex,
    targetItem,
    targetSign,
    targetModule,
    // State
    gestureStatus,
    score,
    completed,
    modelLoading,
    model,
    poseModel,
    // Tutorial
    showIntro,
    showIntervention,
    handleIntroComplete,
    handleResumeFromIntervention,
    // Detection
    detect
  };
}

/**
 * Gesture evaluation — public API consumed by usePracticeSession.js
 *
 * Delegates to the custom ASL classifier (aslClassifier.js) which uses
 * normalised geometric features instead of raw pixel thresholds.
 */

import { classifySign } from './aslClassifier';

// Signs that require motion arcs and cannot be detected via static landmarks
export const MOTION_SIGNS = ['J', 'Z'];
export const isMotionSign = (signName) => MOTION_SIGNS.includes(signName);

/**
 * Evaluates whether hand landmarks match a target ASL sign.
 * Returns { state, errorCode, confidence } where state is one of:
 *   'MATCH'       — landmarks match the target sign
 *   'WRONG_SIGN'  — hand detected but does not match
 *   'NO_HAND'     — no valid landmarks provided
 *   'MOTION_SIGN' — sign requires motion, cannot be evaluated statically
 */
export const evaluateGestureMatch = (landmarks, targetSign) => {
  // No hand detected
  if (!landmarks || !Array.isArray(landmarks) || landmarks.length < 21) {
    return { state: 'NO_HAND', errorCode: null, confidence: 0 };
  }

  // Motion-based signs cannot be evaluated by static analysis
  if (isMotionSign(targetSign)) {
    return { state: 'MOTION_SIGN', errorCode: null, confidence: 0 };
  }

  // Run the feature-based classifier
  const result = classifySign(landmarks, targetSign);

  if (result.match) {
    return { state: 'MATCH', errorCode: null, confidence: result.confidence };
  }

  return {
    state: 'WRONG_SIGN',
    errorCode: result.errorCode || 'ERROR_UNKNOWN_SIGN',
    confidence: result.confidence,
  };
};

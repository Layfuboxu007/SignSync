/**
 * ASL Alphabet Custom Classifier
 *
 * Scale-invariant, rotation-aware feature extraction from MediaPipe
 * hand landmarks (21 points) → per-sign scoring → classification.
 *
 * Replaces the old pixel-threshold approach in gestureMath.js with
 * normalised geometric features (angles, distance ratios) that work
 * regardless of hand size or distance from camera.
 */

// ── Landmark indices ────────────────────────────────────────
const WRIST = 0;
const THUMB = { cmc: 1, mcp: 2, ip: 3, tip: 4 };
const INDEX = { mcp: 5, pip: 6, dip: 7, tip: 8 };
const MIDDLE = { mcp: 9, pip: 10, dip: 11, tip: 12 };
const RING = { mcp: 13, pip: 14, dip: 15, tip: 16 };
const PINKY = { mcp: 17, pip: 18, dip: 19, tip: 20 };

// ── Geometry helpers ────────────────────────────────────────

function dist(a, b) {
  const dx = a[0] - b[0], dy = a[1] - b[1], dz = (a[2] || 0) - (b[2] || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Angle (radians) at vertex b in triangle a-b-c.  π = straight. */
function angleAt(a, b, c) {
  const ba = [a[0] - b[0], a[1] - b[1], (a[2] || 0) - (b[2] || 0)];
  const bc = [c[0] - b[0], c[1] - b[1], (c[2] || 0) - (b[2] || 0)];
  const dot = ba[0] * bc[0] + ba[1] * bc[1] + ba[2] * bc[2];
  const mag = Math.sqrt(ba[0] ** 2 + ba[1] ** 2 + ba[2] ** 2)
            * Math.sqrt(bc[0] ** 2 + bc[1] ** 2 + bc[2] ** 2);
  if (mag < 1e-6) return Math.PI;
  return Math.acos(Math.max(-1, Math.min(1, dot / mag)));
}

// ── Feature extraction ──────────────────────────────────────

/**
 * @param {number[][]} lm  21-point landmark array, each [x, y, z].
 * @returns {object|null}  Normalised feature set or null on bad input.
 */
export function extractFeatures(lm) {
  if (!lm || lm.length < 21) return null;

  const palmSize = dist(lm[WRIST], lm[MIDDLE.mcp]);
  if (palmSize < 1) return null;

  // ── Curl: PIP angle (π = straight, small = curled) ───────
  const thumbCurl  = angleAt(lm[THUMB.cmc], lm[THUMB.ip],  lm[THUMB.tip]);
  const indexCurl  = angleAt(lm[INDEX.mcp], lm[INDEX.pip],  lm[INDEX.tip]);
  const middleCurl = angleAt(lm[MIDDLE.mcp], lm[MIDDLE.pip], lm[MIDDLE.tip]);
  const ringCurl   = angleAt(lm[RING.mcp],  lm[RING.pip],   lm[RING.tip]);
  const pinkyCurl  = angleAt(lm[PINKY.mcp], lm[PINKY.pip],  lm[PINKY.tip]);

  // ── DIP curl (for hook / partial bend detection) ─────────
  const indexDipCurl  = angleAt(lm[INDEX.pip], lm[INDEX.dip],  lm[INDEX.tip]);
  const middleDipCurl = angleAt(lm[MIDDLE.pip], lm[MIDDLE.dip], lm[MIDDLE.tip]);

  // ── Extension: wrist→tip / wrist→pip ratio (>1 = extended) ──
  const thumbExt  = dist(lm[WRIST], lm[THUMB.tip])  / (dist(lm[WRIST], lm[THUMB.ip])  || 1);
  const indexExt  = dist(lm[WRIST], lm[INDEX.tip])  / (dist(lm[WRIST], lm[INDEX.pip])  || 1);
  const middleExt = dist(lm[WRIST], lm[MIDDLE.tip]) / (dist(lm[WRIST], lm[MIDDLE.pip]) || 1);
  const ringExt   = dist(lm[WRIST], lm[RING.tip])   / (dist(lm[WRIST], lm[RING.pip])   || 1);
  const pinkyExt  = dist(lm[WRIST], lm[PINKY.tip])  / (dist(lm[WRIST], lm[PINKY.pip])  || 1);

  // ── Inter-finger tip distances (normalised by palmSize) ──
  const spreadIM = dist(lm[INDEX.tip], lm[MIDDLE.tip]) / palmSize;
  const spreadMR = dist(lm[MIDDLE.tip], lm[RING.tip])  / palmSize;
  const spreadRP = dist(lm[RING.tip], lm[PINKY.tip])   / palmSize;
  const spreadTI = dist(lm[THUMB.tip], lm[INDEX.tip])   / palmSize;

  // ── Thumb-to-fingertip distances ─────────────────────────
  const thumbToIndex  = dist(lm[THUMB.tip], lm[INDEX.tip])  / palmSize;
  const thumbToMiddle = dist(lm[THUMB.tip], lm[MIDDLE.tip]) / palmSize;
  const thumbToRing   = dist(lm[THUMB.tip], lm[RING.tip])   / palmSize;
  const thumbToPinky  = dist(lm[THUMB.tip], lm[PINKY.tip])  / palmSize;

  // ── Thumb-to-finger-MCP distances (for tucked detection) ─
  const thumbToIndexMcp  = dist(lm[THUMB.tip], lm[INDEX.mcp])  / palmSize;
  const thumbToMiddleMcp = dist(lm[THUMB.tip], lm[MIDDLE.mcp]) / palmSize;

  // ── Palm orientation ─────────────────────────────────────
  // Angle of middle-mcp from wrist (≈ -π/2 upright, ≈ 0 sideways)
  const wristAngle = Math.atan2(
    lm[MIDDLE.mcp][1] - lm[WRIST][1],
    lm[MIDDLE.mcp][0] - lm[WRIST][0]
  );

  // "Pointing up" when fingers are above wrist
  const indexAboveWrist  = lm[INDEX.tip][1] < lm[WRIST][1];
  const middleAboveWrist = lm[MIDDLE.tip][1] < lm[WRIST][1];

  return {
    palmSize,
    // Curl (radians, π=straight, <1.2=curled)
    thumbCurl, indexCurl, middleCurl, ringCurl, pinkyCurl,
    indexDipCurl, middleDipCurl,
    // Extension ratios
    thumbExt, indexExt, middleExt, ringExt, pinkyExt,
    // Spreads
    spreadIM, spreadMR, spreadRP, spreadTI,
    // Thumb proximity
    thumbToIndex, thumbToMiddle, thumbToRing, thumbToPinky,
    thumbToIndexMcp, thumbToMiddleMcp,
    // Orientation
    wristAngle, indexAboveWrist, middleAboveWrist,
  };
}

// ── Threshold helpers ───────────────────────────────────────

function isStraight(curl) { return curl > 2.3; }
function isCurled(curl)   { return curl < 1.5; }
function isBent(curl)     { return curl >= 1.2 && curl <= 2.3; }
function isExtended(ext)  { return ext > 1.12; }
function isRetracted(ext) { return ext < 1.08; }
function isClose(d)       { return d < 0.55; }
function isFar(d)         { return d > 0.9; }
function isSpread(d)      { return d > 0.45; }
function isTogether(d)    { return d < 0.35; }

// ── Per-sign scoring functions ──────────────────────────────
// Each returns a 0-1 score. Higher = better match.

function avg(...vals) {
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function bool(cond) { return cond ? 1 : 0; }

const SIGN_SCORERS = {
  'A': (f) => avg(
    bool(isCurled(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.thumbToIndexMcp < 0.7),
    bool(!isCurled(f.thumbCurl))
  ),

  'B': (f) => avg(
    bool(isStraight(f.indexCurl)),
    bool(isStraight(f.middleCurl)),
    bool(isStraight(f.ringCurl)),
    bool(isStraight(f.pinkyCurl)),
    bool(f.thumbToIndex < 0.8),
    bool(isTogether(f.spreadIM))
  ),

  'C': (f) => avg(
    bool(isBent(f.indexCurl)),
    bool(isBent(f.middleCurl)),
    bool(isBent(f.ringCurl)),
    bool(isBent(f.pinkyCurl)),
    bool(f.thumbToIndex > 0.5 && f.thumbToIndex < 1.5),
    bool(!isStraight(f.indexCurl) && !isCurled(f.indexCurl))
  ),

  'D': (f) => avg(
    bool(isStraight(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(isExtended(f.indexExt)),
    bool(f.thumbToMiddle < 0.7)
  ),

  'E': (f) => avg(
    bool(isCurled(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.thumbToIndex < 0.5),
    bool(isRetracted(f.indexExt))
  ),

  'F': (f) => avg(
    bool(f.thumbToIndex < 0.45),
    bool(isStraight(f.middleCurl)),
    bool(isStraight(f.ringCurl)),
    bool(isStraight(f.pinkyCurl)),
    bool(!isStraight(f.indexCurl)),
    bool(isExtended(f.middleExt))
  ),

  'G': (f) => avg(
    bool(isExtended(f.indexExt)),
    bool(!isExtended(f.middleExt)),
    bool(!isExtended(f.ringExt)),
    bool(!isExtended(f.pinkyExt)),
    bool(!f.indexAboveWrist),
    bool(Math.abs(f.wristAngle) < 1.2)
  ),

  'H': (f) => avg(
    bool(isExtended(f.indexExt)),
    bool(isExtended(f.middleExt)),
    bool(!isExtended(f.ringExt)),
    bool(!isExtended(f.pinkyExt)),
    bool(!f.indexAboveWrist),
    bool(isTogether(f.spreadIM))
  ),

  'I': (f) => avg(
    bool(isCurled(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isStraight(f.pinkyCurl)),
    bool(isExtended(f.pinkyExt)),
    bool(isRetracted(f.indexExt))
  ),

  'K': (f) => avg(
    bool(isStraight(f.indexCurl)),
    bool(isStraight(f.middleCurl)),
    bool(isSpread(f.spreadIM)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.thumbToIndexMcp < 0.8)
  ),

  'L': (f) => avg(
    bool(isStraight(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(isExtended(f.indexExt)),
    bool(f.thumbToIndex > 0.8)
  ),

  'M': (f) => avg(
    bool(isCurled(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.thumbToRing < 0.6),
    bool(isRetracted(f.indexExt))
  ),

  'N': (f) => avg(
    bool(isCurled(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.thumbToMiddle < 0.6),
    bool(f.thumbToRing > 0.5)
  ),

  'O': (f) => avg(
    bool(f.thumbToIndex < 0.45),
    bool(!isStraight(f.indexCurl)),
    bool(!isStraight(f.middleCurl)),
    bool(!isStraight(f.ringCurl)),
    bool(!isStraight(f.pinkyCurl)),
    bool(f.thumbToMiddle < 0.7)
  ),

  'P': (f) => avg(
    bool(isExtended(f.indexExt)),
    bool(isExtended(f.middleExt)),
    bool(!isExtended(f.ringExt)),
    bool(!isExtended(f.pinkyExt)),
    bool(isSpread(f.spreadIM)),
    bool(!f.indexAboveWrist)
  ),

  'Q': (f) => avg(
    bool(isExtended(f.indexExt)),
    bool(!isExtended(f.middleExt)),
    bool(!isExtended(f.ringExt)),
    bool(!isExtended(f.pinkyExt)),
    bool(!f.indexAboveWrist),
    bool(f.thumbToIndex < 0.8)
  ),

  'R': (f) => avg(
    bool(isStraight(f.indexCurl)),
    bool(isStraight(f.middleCurl)),
    bool(isTogether(f.spreadIM)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.indexAboveWrist)
  ),

  'S': (f) => avg(
    bool(isCurled(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.thumbToIndexMcp < 0.8),
    bool(f.thumbCurl > 1.5)
  ),

  'T': (f) => avg(
    bool(isCurled(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.thumbToIndex < 0.6),
    bool(f.thumbToMiddle < 0.65)
  ),

  'U': (f) => avg(
    bool(isStraight(f.indexCurl)),
    bool(isStraight(f.middleCurl)),
    bool(isTogether(f.spreadIM)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.indexAboveWrist)
  ),

  'V': (f) => avg(
    bool(isStraight(f.indexCurl)),
    bool(isStraight(f.middleCurl)),
    bool(isSpread(f.spreadIM)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(isExtended(f.indexExt))
  ),

  'W': (f) => avg(
    bool(isStraight(f.indexCurl)),
    bool(isStraight(f.middleCurl)),
    bool(isStraight(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(isExtended(f.indexExt)),
    bool(isExtended(f.middleExt))
  ),

  'X': (f) => avg(
    bool(isBent(f.indexCurl) || (!isStraight(f.indexCurl) && !isCurled(f.indexCurl))),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(f.indexDipCurl < 2.0),
    bool(isRetracted(f.middleExt))
  ),

  'Y': (f) => avg(
    bool(isCurled(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isStraight(f.pinkyCurl)),
    bool(f.thumbToIndex > 0.8),
    bool(isExtended(f.pinkyExt))
  ),

  'Thumbs Up Demo': (f) => avg(
    bool(!isCurled(f.thumbCurl)),
    bool(isCurled(f.indexCurl)),
    bool(isCurled(f.middleCurl)),
    bool(isCurled(f.ringCurl)),
    bool(isCurled(f.pinkyCurl)),
    bool(isExtended(f.thumbExt))
  ),
};

// ── Error code generation ───────────────────────────────────

const ERROR_HINTS = {
  'A': (f) => !isCurled(f.indexCurl) ? 'ERROR_FINGERS_NOT_CURLED' : 'ERROR_THUMB_POSITION',
  'B': (f) => !isStraight(f.indexCurl) ? 'ERROR_FINGERS_NOT_STRAIGHT' : 'ERROR_THUMB_NOT_TUCKED',
  'C': (f) => 'ERROR_FINGERS_SHOULD_CURVE_LIKE_C',
  'D': (f) => !isStraight(f.indexCurl) ? 'ERROR_INDEX_NOT_STRAIGHT' : 'ERROR_OTHER_FINGERS_NOT_CURLED',
  'E': (f) => 'ERROR_FINGERS_NOT_TIGHTLY_CURLED',
  'F': (f) => !isStraight(f.middleCurl) ? 'ERROR_THREE_FINGERS_NOT_STRAIGHT' : 'ERROR_INDEX_THUMB_NOT_TOUCHING',
  'G': (f) => 'ERROR_INDEX_SHOULD_POINT_SIDEWAYS',
  'H': (f) => 'ERROR_INDEX_MIDDLE_SHOULD_POINT_SIDEWAYS',
  'I': (f) => !isStraight(f.pinkyCurl) ? 'ERROR_PINKY_NOT_STRAIGHT' : 'ERROR_OTHER_FINGERS_NOT_CURLED',
  'K': (f) => !isSpread(f.spreadIM) ? 'ERROR_INDEX_MIDDLE_NOT_SEPARATED' : 'ERROR_THUMB_NOT_UP',
  'L': (f) => f.thumbToIndex < 0.8 ? 'ERROR_THUMB_NOT_OUT' : 'ERROR_INDEX_NOT_STRAIGHT',
  'M': (f) => 'ERROR_THUMB_SHOULD_BE_UNDER_THREE_FINGERS',
  'N': (f) => 'ERROR_THUMB_SHOULD_BE_UNDER_TWO_FINGERS',
  'O': (f) => 'ERROR_FINGERS_SHOULD_FORM_O_SHAPE',
  'P': (f) => 'ERROR_WRIST_SHOULD_POINT_DOWN',
  'Q': (f) => 'ERROR_INDEX_THUMB_SHOULD_POINT_DOWN',
  'R': (f) => 'ERROR_INDEX_MIDDLE_SHOULD_CROSS',
  'S': (f) => 'ERROR_THUMB_SHOULD_BE_OVER_FINGERS',
  'T': (f) => 'ERROR_THUMB_SHOULD_BE_UNDER_INDEX',
  'U': (f) => isSpread(f.spreadIM) ? 'ERROR_INDEX_MIDDLE_SHOULD_TOUCH' : 'ERROR_INDEX_MIDDLE_NOT_STRAIGHT',
  'V': (f) => !isSpread(f.spreadIM) ? 'ERROR_INDEX_MIDDLE_NOT_SEPARATED' : 'ERROR_INDEX_MIDDLE_NOT_STRAIGHT',
  'W': (f) => 'ERROR_THREE_FINGERS_NOT_STRAIGHT',
  'X': (f) => 'ERROR_INDEX_SHOULD_BE_HOOKED',
  'Y': (f) => f.thumbToIndex < 0.8 ? 'ERROR_THUMB_PINKY_NOT_OUT' : 'ERROR_MIDDLE_FINGERS_NOT_CURLED',
  'Thumbs Up Demo': (f) => !isExtended(f.thumbExt) ? 'ERROR_THUMB_NOT_UP' : 'ERROR_OTHER_FINGERS_NOT_CURLED',
};

// ── Public API ──────────────────────────────────────────────

/** Match threshold — sign must score above this to be considered a match. */
const MATCH_THRESHOLD = 0.72;

/**
 * Classify a hand pose against a specific target ASL sign.
 *
 * @param {number[][]} landmarks  21-point [x,y,z] array from MediaPipe Hands.
 * @param {string} targetSign     The sign letter to check against.
 * @returns {{ match: boolean, confidence: number, errorCode: string|null }}
 */
export function classifySign(landmarks, targetSign) {
  const features = extractFeatures(landmarks);
  if (!features) {
    return { match: false, confidence: 0, errorCode: null };
  }

  const scorer = SIGN_SCORERS[targetSign];
  if (!scorer) {
    return { match: false, confidence: 0, errorCode: 'ERROR_UNKNOWN_SIGN' };
  }

  const confidence = scorer(features);
  const match = confidence >= MATCH_THRESHOLD;

  let errorCode = null;
  if (!match && ERROR_HINTS[targetSign]) {
    errorCode = ERROR_HINTS[targetSign](features);
  }

  return { match, confidence, errorCode };
}

/**
 * Rank all known signs against the current hand pose.
 * Useful for debugging or showing "closest sign" feedback.
 *
 * @param {number[][]} landmarks
 * @returns {{ sign: string, confidence: number }[]}  Sorted descending.
 */
export function rankAllSigns(landmarks) {
  const features = extractFeatures(landmarks);
  if (!features) return [];

  return Object.entries(SIGN_SCORERS)
    .map(([sign, scorer]) => ({ sign, confidence: scorer(features) }))
    .sort((a, b) => b.confidence - a.confidence);
}

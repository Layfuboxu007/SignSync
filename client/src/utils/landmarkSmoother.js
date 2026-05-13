/**
 * Landmark Smoother — Exponential Moving Average (EMA) filter
 *
 * Reduces jitter in MediaPipe hand landmarks by blending each new
 * frame's positions with the previous smoothed positions.
 *
 * Also provides lerp-based interpolation helpers so the canvas can
 * render at 60 fps even when detection runs at ~10 fps.
 */

// ── EMA Smoother (per-hand) ─────────────────────────────────

export class LandmarkSmoother {
  /**
   * @param {number} alpha  Smoothing factor 0-1.
   *   Lower = smoother but laggier. Higher = more responsive but jittery.
   *   0.35 is a good balance for sign-language tracking.
   */
  constructor(alpha = 0.35) {
    this.alpha = alpha;
    this.prev = null;        // Previous smoothed landmarks (single hand)
    this.prevMulti = null;   // Previous smoothed multi-hand array
  }

  /**
   * Smooth a single hand's landmarks.
   * @param {number[][]} landmarks  Array of 21 [x, y, z] points.
   * @returns {number[][]} Smoothed landmarks.
   */
  smoothSingle(landmarks) {
    if (!landmarks || landmarks.length < 21) {
      this.prev = null;
      return landmarks;
    }

    if (!this.prev || this.prev.length !== landmarks.length) {
      // First frame or hand count changed — no history to blend
      this.prev = landmarks.map(pt => [...pt]);
      return landmarks;
    }

    const smoothed = landmarks.map((pt, i) =>
      pt.map((val, j) => this.prev[i][j] + this.alpha * (val - this.prev[i][j]))
    );

    this.prev = smoothed.map(pt => [...pt]);
    return smoothed;
  }

  /**
   * Smooth full estimateHands output (array of { landmarks, score }).
   * Handles appearing/disappearing hands gracefully.
   * @param {{ landmarks: number[][], score?: number }[]} hands
   * @returns {{ landmarks: number[][], score?: number }[]}
   */
  smoothMulti(hands) {
    if (!hands || hands.length === 0) {
      this.prevMulti = null;
      return hands;
    }

    if (!this.prevMulti || this.prevMulti.length !== hands.length) {
      // Hand count changed — snapshot without blending
      this.prevMulti = hands.map(h => ({
        landmarks: h.landmarks.map(pt => [...pt]),
        score: h.score
      }));
      return hands;
    }

    const smoothed = hands.map((hand, hIdx) => {
      const prevHand = this.prevMulti[hIdx];
      const sLm = hand.landmarks.map((pt, i) =>
        pt.map((val, j) => prevHand.landmarks[i][j] + this.alpha * (val - prevHand.landmarks[i][j]))
      );
      return { landmarks: sLm, score: hand.score };
    });

    this.prevMulti = smoothed.map(h => ({
      landmarks: h.landmarks.map(pt => [...pt]),
      score: h.score
    }));

    return smoothed;
  }

  reset() {
    this.prev = null;
    this.prevMulti = null;
  }
}


// ── Frame Interpolation Helper ──────────────────────────────

/**
 * Linearly interpolate between two sets of landmarks.
 * Used by the canvas renderer to animate between detection frames.
 *
 * @param {number[][]} from  Previous landmarks
 * @param {number[][]} to    Target landmarks
 * @param {number} t         Interpolation factor 0-1
 * @returns {number[][]}
 */
export function lerpLandmarks(from, to, t) {
  if (!from || !to || from.length !== to.length) return to || from;
  const clamped = Math.max(0, Math.min(1, t));
  return to.map((pt, i) =>
    pt.map((val, j) => from[i][j] + clamped * (val - from[i][j]))
  );
}

/**
 * Interpolate full hand predictions array.
 * @param {{ landmarks: number[][], score?: number }[]} from
 * @param {{ landmarks: number[][], score?: number }[]} to
 * @param {number} t  0-1
 * @returns {{ landmarks: number[][], score?: number }[]}
 */
export function lerpHandPredictions(from, to, t) {
  if (!from || !to) return to || from || [];
  const count = Math.min(from.length, to.length);
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push({
      landmarks: lerpLandmarks(from[i].landmarks, to[i].landmarks, t),
      score: to[i].score
    });
  }
  // If `to` has more hands, append them directly
  for (let i = count; i < to.length; i++) {
    result.push(to[i]);
  }
  return result;
}

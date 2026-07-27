/** Brand title world position — grid warp + graffiti trail */
export const brandPos = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  ready: false,
};

export type TrailPoint = {
  x: number;
  y: number;
  /** birth time (performance.now) */
  t: number;
  /** crayon thickness */
  w: number;
};

/** Shared crayon trail left by the brand mark */
export const brandTrail: TrailPoint[] = [];

/** Stay fully visible, then fade out */
export const TRAIL_HOLD = 2000;
export const TRAIL_FADE = 1200;
export const TRAIL_LIFE = TRAIL_HOLD + TRAIL_FADE;

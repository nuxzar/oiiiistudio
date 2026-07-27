export const EASE = {
  /** Soft exhibition open */
  expoOut: [0.16, 1, 0.3, 1] as const,
  /** Soft settle */
  quintOut: [0.22, 1, 0.36, 1] as const,
  /** Snappy hover */
  backOut: [0.34, 1.56, 0.64, 1] as const,
  /** Expand into case */
  expand: [0.65, 0.05, 0.36, 1] as const,
};

/** Frame-rate independent exponential decay */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function wrap(value: number, width: number) {
  if (width <= 0) return value;
  let next = value % width;
  if (next > 0) next -= width;
  return next;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function map(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

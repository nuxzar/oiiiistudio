/** Shared logo world position — grid, cards, brand chase */
export const logoPos = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  /** Half of logo box size — brand tail hooks at bottom-right */
  half: 210,
  /** sneak = dwelling; dash = relocating */
  phase: "sneak" as "sneak" | "dash",
  ready: false,
};

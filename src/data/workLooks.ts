/** 方卡颜色 — key 必须与 works.ts 里的 id 一致 */
export const workColors: Record<string, string> = {
  "han-geng": "#2C241C",
  iqiyi: "#8B6B4A",
  "liang-haiyuan": "#D8C9B0",
  hulan: "#53483C",
  "wang-zuozhongyou": "#E6D9C6",
  "paul-frank": "#6E4A35",
  "qq-matnut": "#9A7B63",
  "roar-matnut": "#B8956A",
  "more-cases": "#3A322A",
};

function luminance(hex: string) {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function lookFor(slug: string) {
  const color = workColors[slug] ?? "#53483C";
  const surface = luminance(color) > 0.62 ? ("light" as const) : ("dark" as const);
  const accent = surface === "light" ? "#3D2B1F" : "#C4A574";
  return { color, accent, surface };
}

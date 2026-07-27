"use client";

import { useEffect, useRef } from "react";
import { logoPos } from "@/lib/logoPos";
import {
  brandPos,
  brandTrail,
  TRAIL_FADE,
  TRAIL_HOLD,
  TRAIL_LIFE,
} from "@/lib/brandPos";

const CELL = 50;
const INFLUENCE = 230;
const STRENGTH = 44;
const DOT_GAP = 6;

type Influencer = { x: number; y: number; ready: boolean };

/**
 * Dotted cross grid — warps around logo + brand mark.
 * Also paints the brand’s graffiti trail.
 */
export function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(window.innerWidth, 1);
      h = Math.max(window.innerHeight, 1);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const proximity = (x: number, y: number) => {
      let max = 0;
      const sources: Influencer[] = [logoPos, brandPos];
      for (const src of sources) {
        if (!src.ready) continue;
        const dist = Math.hypot(x - src.x, y - src.y);
        if (dist >= INFLUENCE || dist < 0.001) continue;
        const t = 1 - dist / INFLUENCE;
        const falloff = t * t * (3 - 2 * t);
        if (falloff > max) max = falloff;
      }
      return max;
    };

    const applyWarp = (x: number, y: number, src: Influencer) => {
      if (!src.ready) return { x, y };
      const dx = x - src.x;
      const dy = y - src.y;
      const dist = Math.hypot(dx, dy);
      if (dist > INFLUENCE || dist < 0.001) return { x, y };

      const t = 1 - dist / INFLUENCE;
      const falloff = t * t * (3 - 2 * t);
      const push = falloff * STRENGTH;
      return {
        x: x + (dx / dist) * push,
        y: y + (dy / dist) * push,
      };
    };

    const warp = (x: number, y: number) => {
      let p = applyWarp(x, y, logoPos);
      p = applyWarp(p.x, p.y, brandPos);
      return p;
    };

    const drawDotsAlong = (
      origins: { x: number; y: number }[],
      points: { x: number; y: number }[],
    ) => {
      if (points.length < 2) return;
      let carry = 0;
      for (let i = 1; i < points.length; i += 1) {
        const a = points[i - 1];
        const b = points[i];
        const oa = origins[i - 1];
        const ob = origins[i];
        const seg = Math.hypot(b.x - a.x, b.y - a.y);
        if (seg < 0.001) continue;
        const nx = (b.x - a.x) / seg;
        const ny = (b.y - a.y) / seg;
        let d = carry;
        while (d <= seg) {
          const t = d / seg;
          const px = a.x + nx * d;
          const py = a.y + ny * d;
          const ox = oa.x + (ob.x - oa.x) * t;
          const oy = oa.y + (ob.y - oa.y) * t;
          const g = proximity(ox, oy);
          // Uniform light dots; slight deepen only where grid warps
          const v = Math.round(221 - g * 40);
          ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
          const s = 1.5 + g * 0.35;
          ctx.fillRect(px - s / 2, py - s / 2, s, s);
          d += DOT_GAP;
        }
        carry = d - seg;
      }
    };

    const drawTrail = (now: number) => {
      while (brandTrail.length && now - brandTrail[0].t > TRAIL_LIFE) {
        brandTrail.shift();
      }
      if (brandTrail.length < 2) return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (let i = 1; i < brandTrail.length; i += 1) {
        const a = brandTrail[i - 1];
        const b = brandTrail[i];
        const age = now - b.t;
        if (age > TRAIL_LIFE) continue;

        let alpha = 1;
        if (age > TRAIL_HOLD) {
          const fadeT = (age - TRAIL_HOLD) / TRAIL_FADE;
          alpha = Math.max(0, 1 - fadeT * fadeT);
        }
        if (alpha <= 0.01) continue;

        const baseW = (a.w + b.w) * 0.55;
        const jx = Math.sin(b.t * 0.13 + i * 1.7) * 1.8;
        const jy = Math.cos(b.t * 0.11 + i * 2.1) * 1.8;
        const mx = (a.x + b.x) * 0.5 + jx;
        const my = (a.y + b.y) * 0.5 + jy;

        const layers = [
          { ox: 0, oy: 0, w: baseW * 1.15, a: 0.38 * alpha },
          { ox: 1.1, oy: -0.9, w: baseW * 0.7, a: 0.28 * alpha },
          { ox: -1.2, oy: 0.8, w: baseW * 0.55, a: 0.22 * alpha },
          { ox: 0.4, oy: 1.3, w: baseW * 0.4, a: 0.16 * alpha },
        ];

        for (const layer of layers) {
          ctx.beginPath();
          ctx.moveTo(a.x + layer.ox, a.y + layer.oy);
          ctx.quadraticCurveTo(
            mx + layer.ox * 0.6,
            my + layer.oy * 0.6,
            b.x + layer.ox,
            b.y + layer.oy,
          );
          ctx.strokeStyle = `rgba(220, 48, 42, ${layer.a.toFixed(3)})`;
          ctx.lineWidth = Math.max(1.2, layer.w);
          ctx.stroke();
        }

        const steps = 3;
        for (let s = 0; s < steps; s += 1) {
          const t = (s + 1) / (steps + 1);
          const px =
            a.x + (b.x - a.x) * t + Math.sin(b.t * 0.2 + i + s * 3) * 2.2;
          const py =
            a.y + (b.y - a.y) * t + Math.cos(b.t * 0.17 + i + s * 2) * 2.2;
          ctx.fillStyle = `rgba(220, 48, 42, ${(0.2 * alpha).toFixed(3)})`;
          const r = 0.7 + (s % 2) * 0.6;
          ctx.fillRect(px - r, py - r, r * 2, r * 2);
        }
      }
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / CELL) + 2;
      const rows = Math.ceil(h / CELL) + 2;

      // Warped dotted grid
      for (let c = 0; c <= cols; c += 1) {
        const x0 = c * CELL;
        const origins = [];
        const points = [];
        for (let r = 0; r <= rows; r += 1) {
          const y0 = r * CELL;
          origins.push({ x: x0, y: y0 });
          points.push(warp(x0, y0));
        }
        drawDotsAlong(origins, points);
      }

      for (let r = 0; r <= rows; r += 1) {
        const y0 = r * CELL;
        const origins = [];
        const points = [];
        for (let c = 0; c <= cols; c += 1) {
          const x0 = c * CELL;
          origins.push({ x: x0, y: y0 });
          points.push(warp(x0, y0));
        }
        drawDotsAlong(origins, points);
      }

      drawTrail(now);

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden
    />
  );
}

"use client";

import { useEffect, useRef } from "react";
import { logoPos } from "@/lib/logoPos";
import { damp } from "@/lib/motion";

type Phase = "sneak" | "dash";
type PathKind = "line" | "curve" | "circle" | "ellipse" | "square";

/** Irregular dwell — sometimes short, sometimes long */
const sneakDuration = () => 3000 + Math.random() * 5000; // 3–8s

const PATH_KINDS: PathKind[] = [
  "line",
  "curve",
  "circle",
  "ellipse",
  "square",
];

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

type DashPath = {
  kind: PathKind;
  start: number;
  duration: number;
  endX: number;
  endY: number;
  sample: (u: number) => { x: number; y: number };
};

const cubic = (
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number,
) => {
  const o = 1 - t;
  return {
    x:
      o * o * o * p0.x +
      3 * o * o * t * p1.x +
      3 * o * t * t * p2.x +
      t * t * t * p3.x,
    y:
      o * o * o * p0.y +
      3 * o * o * t * p1.y +
      3 * o * t * t * p2.y +
      t * t * t * p3.y,
  };
};

/**
 * Sneaky logo: jittery idle, then relocates on a random path
 * (line / curve / circle / ellipse / square).
 */
export function FloatingLogo() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let phase: Phase = "sneak";
    let phaseUntil = performance.now() + sneakDuration();
    // Phones: sit a bit left so the brand S-tail has room on the right
    const startX =
      window.innerWidth < 640
        ? window.innerWidth * 0.38
        : window.innerWidth * 0.5;
    let cx = startX;
    let cy = window.innerHeight * 0.5;
    let tx = cx;
    let ty = cy;
    let vx = 0;
    let vy = 0;
    let wobbleT = 0;
    let last = performance.now();
    let raf = 0;
    let dash: DashPath | null = null;
    let prevX = cx;
    let prevY = cy;

    const size = () => {
      const w = Math.max(window.innerWidth, 1);
      const h = Math.max(window.innerHeight, 1);
      return Math.min(w * 0.42, h * 0.42, 420);
    };

    const clampPos = (x: number, y: number) => {
      const pad = size() * 0.5;
      // Extra right pad on mobile — leave gutter for "Oiiii studio" tail
      const rightGutter =
        window.innerWidth < 640 ? Math.min(window.innerWidth * 0.28, 120) : 0;
      const maxX = Math.max(window.innerWidth - pad - rightGutter, pad);
      const maxY = Math.max(window.innerHeight - pad, pad);
      return {
        x: Math.min(Math.max(x, pad), maxX),
        y: Math.min(Math.max(y, pad), maxY),
      };
    };

    const randomPoint = () => {
      const pad = size() * 0.5;
      const rightGutter =
        window.innerWidth < 640 ? Math.min(window.innerWidth * 0.28, 120) : 0;
      const spanX = Math.max(window.innerWidth - pad * 2 - rightGutter, 0);
      const spanY = Math.max(window.innerHeight - pad * 2, 0);
      return {
        x: pad + Math.random() * spanX,
        y: pad + Math.random() * spanY,
      };
    };

    const beginSneak = (now: number, atX = cx, atY = cy) => {
      phase = "sneak";
      dash = null;
      vx = 0;
      vy = 0;
      cx = atX;
      cy = atY;
      tx = atX;
      ty = atY;
      phaseUntil = now + sneakDuration();
    };

    const beginDash = (now: number) => {
      phase = "dash";
      const kind =
        PATH_KINDS[Math.floor(Math.random() * PATH_KINDS.length)]!;
      const startX = cx;
      const startY = cy;

      if (kind === "line" || kind === "curve") {
        const end = randomPoint();
        const duration = 420 + Math.random() * 580;

        if (kind === "line") {
          dash = {
            kind,
            start: now,
            duration,
            endX: end.x,
            endY: end.y,
            sample: (u) => {
              const e = easeInOut(u);
              return {
                x: startX + (end.x - startX) * e,
                y: startY + (end.y - startY) * e,
              };
            },
          };
        } else {
          const dx = end.x - startX;
          const dy = end.y - startY;
          const len = Math.hypot(dx, dy) || 1;
          const side = Math.random() < 0.5 ? 1 : -1;
          const bend = (90 + Math.random() * 200) * side;
          const c1 = clampPos(
            (startX + end.x) * 0.5 + (-dy / len) * bend,
            (startY + end.y) * 0.5 + (dx / len) * bend,
          );
          const c2 = clampPos(
            (startX + end.x) * 0.5 + (dy / len) * bend * 0.35,
            (startY + end.y) * 0.5 + (-dx / len) * bend * 0.35,
          );
          const cubicPath = Math.random() < 0.55;

          dash = {
            kind,
            start: now,
            duration: duration + 120,
            endX: end.x,
            endY: end.y,
            sample: (u) => {
              const e = easeInOut(u);
              if (cubicPath) {
                const p = cubic(
                  { x: startX, y: startY },
                  c1,
                  c2,
                  end,
                  e,
                );
                return clampPos(p.x, p.y);
              }
              const o = 1 - e;
              return clampPos(
                o * o * startX + 2 * o * e * c1.x + e * e * end.x,
                o * o * startY + 2 * o * e * c1.y + e * e * end.y,
              );
            },
          };
        }
        return;
      }

      if (kind === "circle" || kind === "ellipse") {
        const maxR = Math.min(window.innerWidth, window.innerHeight) * 0.22;
        const rx = 70 + Math.random() * Math.max(40, maxR);
        const ry =
          kind === "circle"
            ? rx
            : 55 + Math.random() * Math.max(35, maxR * 0.85);
        const a0 =
          Math.atan2(
            startY - window.innerHeight * 0.5,
            startX - window.innerWidth * 0.5,
          ) +
          (Math.random() - 0.5) * 0.8;
        let centerX = startX - Math.cos(a0) * rx;
        let centerY = startY - Math.sin(a0) * ry;
        const c = clampPos(centerX, centerY);
        centerX = c.x;
        centerY = c.y;
        const startAng = Math.atan2(startY - centerY, startX - centerX);
        const sweeps = 0.55 + Math.random() * 1.55;
        const dir = Math.random() < 0.5 ? 1 : -1;
        const duration = 750 + Math.random() * 1100;

        const sample = (u: number) => {
          const e = easeInOut(u);
          const ang = startAng + dir * sweeps * Math.PI * 2 * e;
          return clampPos(
            centerX + Math.cos(ang) * rx,
            centerY + Math.sin(ang) * ry,
          );
        };
        const end = sample(1);
        dash = {
          kind,
          start: now,
          duration,
          endX: end.x,
          endY: end.y,
          sample,
        };
        return;
      }

      const side = 90 + Math.random() * 160;
      const dir = Math.random() < 0.5 ? 1 : -1;
      const verticalFirst = Math.random() < 0.5;
      const laps = Math.random() < 0.35 ? 2 : 1;
      const duration = 800 + Math.random() * 1000;

      const corners = verticalFirst
        ? [
            { x: startX, y: startY },
            { x: startX, y: startY + side * dir },
            { x: startX + side, y: startY + side * dir },
            { x: startX + side, y: startY },
            { x: startX, y: startY },
          ]
        : [
            { x: startX, y: startY },
            { x: startX + side * dir, y: startY },
            { x: startX + side * dir, y: startY + side },
            { x: startX, y: startY + side },
            { x: startX, y: startY },
          ];

      const sample = (u: number) => {
        const e = easeInOut(u);
        const t = e * laps * 4;
        const seg = Math.min(Math.floor(t), laps * 4 - 0.0001);
        const f = t - Math.floor(t);
        const i = Math.floor(seg) % 4;
        const a = corners[i]!;
        const b = corners[i + 1]!;
        return clampPos(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
      };
      const end = sample(1);
      dash = {
        kind: "square",
        start: now,
        duration,
        endX: end.x,
        endY: end.y,
        sample,
      };
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      wobbleT += dt;
      prevX = cx;
      prevY = cy;

      if (phase === "sneak" && now > phaseUntil) {
        beginDash(now);
      }

      if (phase === "dash" && dash) {
        const u = Math.min(1, (now - dash.start) / dash.duration);
        const p = dash.sample(u);
        cx = p.x;
        cy = p.y;
        vx = (cx - prevX) / Math.max(dt, 0.001);
        vy = (cy - prevY) / Math.max(dt, 0.001);

        if (u >= 1) {
          beginSneak(now, dash.endX, dash.endY);
        }
      } else {
        const wx =
          Math.sin(wobbleT * 42) * 7.2 +
          Math.sin(wobbleT * 61 + 1.1) * 4.4 +
          Math.sin(wobbleT * 27) * 3.1;
        const wy =
          Math.cos(wobbleT * 48) * 6.4 +
          Math.sin(wobbleT * 55 + 0.6) * 4.6 +
          Math.cos(wobbleT * 29.2) * 2.8;
        cx = damp(cx, tx + wx, 34, dt);
        cy = damp(cy, ty + wy, 34, dt);
        vx = wx * 18;
        vy = wy * 18;
      }

      logoPos.x = cx;
      logoPos.y = cy;
      logoPos.vx = vx;
      logoPos.vy = vy;
      logoPos.half = size() * 0.5;
      logoPos.phase = phase;
      logoPos.ready = true;

      root.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;

      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const p = clampPos(cx, cy);
      cx = p.x;
      cy = p.y;
      tx = cx;
      ty = cy;
    };

    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      logoPos.ready = false;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute top-0 left-0 will-change-transform"
      style={{
        transform: "translate3d(50vw, 50vh, 0) translate(-50%, -50%)",
      }}
      aria-hidden
    >
      <div
        className="relative bg-transparent"
        style={{
          width: "min(42vw, 42vh, 420px)",
          height: "min(42vw, 42vh, 420px)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.png`}
          alt=""
          className="h-full w-full bg-transparent object-contain"
          draggable={false}
        />
      </div>
    </div>
  );
}

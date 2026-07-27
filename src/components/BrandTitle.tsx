"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { logoPos } from "@/lib/logoPos";
import { brandPos, brandTrail, TRAIL_LIFE } from "@/lib/brandPos";

const LABEL = "Oiiii studio";

/** S-curve path in local SVG space — flicking tail */
const TAIL_D =
  "M 0 36 C 48 -6, 86 -2, 118 48 C 148 96, 186 128, 248 88";

/**
 * Hand-drawn graffiti strokes (no typeface).
 * Paths are centered near (0,0), roughly 20×26 units.
 */
const LETTER_STROKES: Record<string, string[]> = {
  O: [
    "M -7,-2 C -7,-11 7,-11 7,-2 C 7,8 -7,8 -7,-2",
    "M -5.5,-1.5 C -5.5,-8.5 5.5,-8.5 5.5,-1.5 C 5.5,5.5 -5.5,5.5 -5.5,-1.5",
  ],
  i: [
    "M 0,-4 L 0.6,9",
    "M -0.8,-4.2 L 1.2,-3.6",
    "M 0.2,-11 L 1,-9.2",
  ],
  " ": [],
  o: [
    "M -6,-1 C -6,-9 6,-9 6,-1 C 6,7 -6,7 -6,-1",
    "M -4.5,-0.8 C -4.5,-6.8 4.5,-6.8 4.5,-0.8 C 4.5,4.8 -4.5,4.8 -4.5,-0.8",
  ],
  s: [
    "M 6,-8 C 6,-12 -7,-12 -7,-7 C -7,-2 7,-3 7,3 C 7,9 -7,10 -6,6",
    "M 4.5,-7.5 C 3,-10.5 -5,-10 -5,-6.5 C -4,-2.5 5,-3 5,2.5 C 5,7 -4,8 -4.5,5",
  ],
  t: [
    "M -1,-11 L 0.4,9",
    "M -7,-5 L 7.5,-4.2",
    "M -6.5,-3.5 L 6.5,-4.8",
  ],
  u: [
    "M -6.5,-9 L -5.5,2 C -5,9 6,9 6.5,1 L 7,-9",
    "M -5,-8 L -4,1.5 C -3.5,6.5 4.5,6.5 5,1 L 5.5,-8",
  ],
  d: [
    "M 6,-12 L 6.5,9",
    "M 6,-1 C 6,-8 -7,-8 -7,1 C -7,8 6,8 6,2",
    "M 5,0 C 4.5,-5.5 -5,-5.5 -5,1 C -5,6 5,6 5,1.5",
  ],
  // fallback scribble
  "?": ["M -4,-8 L 4,-6 L -3,0 L 5,8"],
};

const strokeFor = (ch: string) =>
  LETTER_STROKES[ch] ?? LETTER_STROKES[ch.toLowerCase()] ?? LETTER_STROKES["?"];

/** Crayon layers for a single letter glyph */
function CrayonLetter({
  ch,
  index,
}: {
  ch: string;
  index: number;
}) {
  const strokes = strokeFor(ch);
  if (strokes.length === 0) {
    return <g data-tail-letter transform="translate(0,0)" />;
  }

  const layers = [
    { ox: 0, oy: 0, w: 2.6, a: 0.82 },
    { ox: 0.55, oy: -0.45, w: 1.7, a: 0.45 },
    { ox: -0.6, oy: 0.5, w: 1.35, a: 0.35 },
  ];

  return (
    <g data-tail-letter data-letter-index={index}>
      {layers.map((layer, li) =>
        strokes.map((d, si) => (
          <path
            key={`${li}-${si}`}
            d={d}
            fill="none"
            stroke={`rgba(0, 0, 0, ${layer.a})`}
            strokeWidth={layer.w}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={`translate(${layer.ox}, ${layer.oy})`}
          />
        )),
      )}
    </g>
  );
}

/**
 * Graffiti-stroke brand tail — trail draws from the last letter tip.
 */
export function BrandTitle() {
  const ref = useRef<HTMLAnchorElement>(null);
  const layerRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const chars = useMemo(() => [...LABEL], []);

  useEffect(() => {
    const el = ref.current;
    const layer = layerRef.current;
    const path = pathRef.current;
    if (!el || !layer || !path) return;

    const letters = [
      ...layer.querySelectorAll<SVGGElement>("[data-tail-letter]"),
    ];

    const layoutLetters = () => {
      const len = path.getTotalLength();
      const count = Math.max(letters.length - 1, 1);
      const start = len * 0.02;
      const usable = len * 0.96;

      const letterScale = window.innerWidth < 640 ? 0.92 : 1.05;
      for (let i = 0; i < letters.length; i += 1) {
        const t = start + (usable * i) / count;
        const p = path.getPointAtLength(t);
        const p2 = path.getPointAtLength(Math.min(t + 1.5, len));
        const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
        letters[i].setAttribute(
          "transform",
          `translate(${p.x}, ${p.y}) rotate(${angle}) scale(${letterScale})`,
        );
      }

      // Tip marker at the very end of the glyph run (last letter)
      const tipT = start + usable;
      const tip = path.getPointAtLength(tipT);
      const tip2 = path.getPointAtLength(Math.min(tipT + 1.5, len));
      const tipAngle =
        (Math.atan2(tip2.y - tip.y, tip2.x - tip.x) * 180) / Math.PI;
      // Offset to the trailing edge of the last letter (~ right of glyph)
      if (tipRef.current) {
        tipRef.current.setAttribute(
          "transform",
          `translate(${tip.x}, ${tip.y}) rotate(${tipAngle}) translate(9, 2)`,
        );
      }
    };

    layoutLetters();

    const brandBox = () => {
      const w = el.offsetWidth || Math.min(window.innerWidth * 0.78, 270);
      const h = el.offsetHeight || Math.min(window.innerWidth * 0.3, 140);
      return { w, h };
    };

    /** Keep the S-curve graffiti fully inside the viewport (esp. mobile). */
    const fitAnchor = (ax: number, ay: number) => {
      const { w, h } = brandBox();
      const padX = 10;
      const padTop = 56;
      const padBottom = 16;
      // Path spills past the svg box a bit when rotated/skewed
      const spillX = w * 0.08;
      const spillY = h * 0.18;
      const maxX = Math.max(padX, window.innerWidth - w - padX - spillX);
      const maxY = Math.max(
        padTop,
        window.innerHeight - h - padBottom - spillY,
      );
      return {
        x: Math.min(Math.max(ax, padX), maxX),
        y: Math.min(Math.max(ay, padTop), maxY),
      };
    };

    const chaseTarget = () => {
      if (!logoPos.ready) {
        return fitAnchor(window.innerWidth * 0.12, window.innerHeight * 0.42);
      }
      const narrow = window.innerWidth < 640;
      const { w } = brandBox();
      // On phones, hang from logo's lower-left so the rightward tail stays on-screen
      const rawX = narrow
        ? logoPos.x - w * 0.42
        : logoPos.x + logoPos.half * 0.38;
      const rawY = narrow
        ? logoPos.y + logoPos.half * 0.12
        : logoPos.y + logoPos.half * 0.34;
      return fitAnchor(rawX, rawY);
    };

    const start = chaseTarget();
    let x = start.x;
    let y = start.y;
    let vx = 0;
    let vy = 0;
    let tx = x;
    let ty = y;
    let lastTrailX = x;
    let lastTrailY = y;
    let raf = 0;
    let last = performance.now();

    const tipScreen = () => {
      const tip = tipRef.current;
      if (tip) {
        const rect = tip.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
      // Fallback: last letter bbox
      const lastLetter = letters[letters.length - 1];
      if (lastLetter) {
        const rect = lastLetter.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
      return { x, y };
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const target = chaseTarget();
      tx = target.x;
      ty = target.y;

      const spring = logoPos.phase === "dash" ? 32 : 18;
      const ax = (tx - x) * spring;
      const ay = (ty - y) * spring;
      vx += ax * dt;
      vy += ay * dt;
      vx *= Math.exp(-3.2 * dt);
      vy *= Math.exp(-3.2 * dt);
      x += vx * dt;
      y += vy * dt;
      // Hard clamp after integration so dash/skew never clips the tail
      const fitted = fitAnchor(x, y);
      x = fitted.x;
      y = fitted.y;

      const speed = Math.hypot(vx, vy);
      const skewX = Math.max(-18, Math.min(18, -vx * 0.012));
      const skewY = Math.max(-14, Math.min(14, -vy * 0.01));
      const stretchX = 1 + Math.min(Math.abs(vx) / 900, 0.28);
      const stretchY = 1 + Math.min(Math.abs(vy) / 900, 0.28);
      const squash = 1 - Math.min(speed / 1600, 0.12);
      const restTilt = 6;
      const lean = Math.max(-10, Math.min(10, vx * 0.008 - vy * 0.004));

      el.style.transform = [
        `translate3d(${x}px, ${y}px, 0)`,
        `rotate(${(restTilt + lean).toFixed(2)}deg)`,
        `skew(${skewX.toFixed(2)}deg, ${skewY.toFixed(2)}deg)`,
        `scale(${(stretchX * squash).toFixed(4)}, ${(stretchY * squash).toFixed(4)})`,
      ].join(" ");

      // Trail + grid warp from the last letter tip
      const tip = tipScreen();
      brandPos.x = tip.x;
      brandPos.y = tip.y;
      brandPos.vx = vx;
      brandPos.vy = vy;
      brandPos.ready = true;

      const step = Math.hypot(tip.x - lastTrailX, tip.y - lastTrailY);
      if (step >= 5 || brandTrail.length === 0) {
        const markerW =
          3.4 + Math.min(speed / 350, 4.2) + Math.random() * 2.2;
        brandTrail.push({
          x: tip.x + (Math.random() - 0.5) * 2.4,
          y: tip.y + (Math.random() - 0.5) * 2.4,
          t: now,
          w: markerW,
        });
        lastTrailX = tip.x;
        lastTrailY = tip.y;

        while (
          brandTrail.length > 0 &&
          (brandTrail.length > 280 || now - brandTrail[0].t > TRAIL_LIFE)
        ) {
          brandTrail.shift();
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", layoutLetters);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layoutLetters);
      brandPos.ready = false;
      brandTrail.length = 0;
    };
  }, []);

  return (
    <Link
      ref={ref}
      href="/"
      className="pointer-events-auto absolute top-0 left-0 origin-top-left will-change-transform"
      style={{
        // Mobile-safe default: left of center so the rightward S-tail fits
        transform:
          "translate3d(12vw, 42vh, 0) rotate(6deg)",
      }}
      aria-label="Oiiii studio"
    >
      <svg
        viewBox="-8 -16 270 160"
        className="h-[min(30vw,120px)] w-[min(78vw,270px)] overflow-visible sm:h-[min(32vw,160px)] sm:w-[min(56vw,270px)]"
        aria-hidden
      >
        <path ref={pathRef} d={TAIL_D} fill="none" stroke="none" />
        <g ref={layerRef}>
          {chars.map((ch, i) => (
            <CrayonLetter key={`${ch}-${i}`} ch={ch} index={i} />
          ))}
        </g>
        {/* Invisible tip at the last letter — trail origin */}
        <circle
          ref={tipRef}
          r="1"
          fill="transparent"
          pointerEvents="none"
        />
      </svg>
    </Link>
  );
}

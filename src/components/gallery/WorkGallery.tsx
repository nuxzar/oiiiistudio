"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { works } from "@/data/works";
import { BrandTitle } from "@/components/BrandTitle";
import { SiteFooter } from "@/components/SiteFooter";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { FloatingLogo } from "@/components/gallery/FloatingLogo";
import { GridBackground } from "@/components/gallery/GridBackground";
import { logoPos } from "@/lib/logoPos";
import { panVel } from "@/lib/panVel";
import { aboutKnock } from "@/lib/aboutKnock";

const CARD = 270;

/**
 * Irregular scatter seeds (medium density — not a grid, not piled).
 * Index i in works.ts → SCATTER[i]. Reorder drafts = reorder who sits where.
 * 0–3 form a loose pocket for the first viewport (esp. mobile).
 */
const SCATTER: { x: number; y: number }[] = [
  { x: 40, y: 30 },
  { x: 520, y: -50 },
  { x: 140, y: 460 },
  { x: 560, y: 400 },
  { x: -30, y: 880 },
  { x: 420, y: 820 },
  { x: 980, y: 120 },
  { x: 1100, y: 560 },
  { x: 200, y: 1320 },
  { x: 720, y: 1240 },
  { x: 1280, y: 980 },
  { x: 860, y: 1680 },
  { x: 40, y: 1780 },
  { x: 1180, y: 1480 },
  { x: 1480, y: 280 },
  { x: 1520, y: 1180 },
];

function buildLayout(count: number) {
  const points = Array.from({ length: count }, (_, i) => {
    const base = SCATTER[i % SCATTER.length];
    const ring = Math.floor(i / SCATTER.length);
    return {
      x: base.x + ring * 380,
      y: base.y + ring * 360,
    };
  });

  const maxX = Math.max(...points.map((p) => p.x), 0) + CARD + 180;
  const maxY = Math.max(...points.map((p) => p.y), 0) + CARD + 180;

  return {
    points,
    cellW: Math.max(maxX, 2800),
    cellH: Math.max(maxY, 2200),
  };
}

const { points: LAYOUT, cellW: CELL_W, cellH: CELL_H } = buildLayout(
  works.length,
);

const layoutScaleFor = (vw: number) => {
  if (vw < 640) return 0.7;
  if (vw < 1024) return 0.88;
  return 1;
};

/** Leading works.ts indices in the first viewport */
const firstViewCount = (vw: number) => (vw < 640 ? 4 : 5);

const frameCluster = (
  indices: number[],
  vw: number,
  vh: number,
  s: number,
  biasX = 0,
  biasY = 0,
) => {
  const boxes = indices
    .map((i) => LAYOUT[i])
    .filter(Boolean)
    .map((p) => ({
      x: p.x * s,
      y: p.y * s,
      w: CARD * s,
      h: CARD * s,
    }));
  if (boxes.length === 0) return { worldX: 0, worldY: 0 };

  const minX = Math.min(...boxes.map((b) => b.x));
  const maxX = Math.max(...boxes.map((b) => b.x + b.w));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxY = Math.max(...boxes.map((b) => b.y + b.h));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return {
    worldX: vw * 0.5 - cx + biasX,
    worldY: vh * 0.5 - cy + biasY,
  };
};

/**
 * PC + mobile: always frame works.ts indices 0…N-1 in order.
 * Mobile shows first 4; PC shows first 5. Drag to see the rest.
 */
const initialWorld = (vw: number, vh: number) => {
  const s = layoutScaleFor(vw);
  if (LAYOUT.length === 0) return { worldX: 0, worldY: 0 };

  const n = Math.min(firstViewCount(vw), LAYOUT.length);
  const indices = Array.from({ length: n }, (_, i) => i);
  return frameCluster(indices, vw, vh, s, 8, -8);
};

type Sample = { x: number; y: number; t: number };

/**
 * 1:1 Bettering-style interaction:
 * works scattered across a boundless 2D field.
 * Drag freely in every direction with inertia — no edges.
 */
export function WorkGallery() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // 3×3 cell copies keep the plane full while you roam
  const items = useMemo(() => {
    const list: {
      key: string;
      work: (typeof works)[number];
      lx: number;
      ly: number;
      ox: number;
      oy: number;
      floatAmp: number;
      floatFreq: number;
      phase: number;
    }[] = [];

    for (let oy = -1; oy <= 1; oy += 1) {
      for (let ox = -1; ox <= 1; ox += 1) {
        works.forEach((work, index) => {
          const layout = LAYOUT[index % LAYOUT.length];
          list.push({
            key: `${ox}:${oy}:${work.slug}`,
            work,
            lx: layout.x,
            ly: layout.y,
            ox,
            oy,
            floatAmp: 8 + (index % 3) * 4,
            floatFreq: 0.3 + (index % 4) * 0.06,
            phase: index * 1.15 + ox * 0.5 + oy * 0.35,
          });
        });
      }
    }
    return list;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const cards = [
      ...stage.querySelectorAll<HTMLElement>("[data-gallery-card]"),
    ];

    let worldX = 0;
    let worldY = 0;
    let velX = 0;
    let velY = 0;
    let dragging = false;
    let tracking = false;
    let activePointer = -1;
    let lastPX = 0;
    let lastPY = 0;
    let startPX = 0;
    let startPY = 0;
    let lastT = performance.now();
    let originCellX = 0;
    let originCellY = 0;
    const samples: Sample[] = [];
    let raf = 0;
    const DRAG_THRESHOLD = 5;

    const bumps = new Map<HTMLElement, number>();
    const nearFlags = new Map<HTMLElement, boolean>();
    const knockOx = new Map<HTMLElement, number>();
    const knockOy = new Map<HTMLElement, number>();
    const knockVx = new Map<HTMLElement, number>();
    const knockVy = new Map<HTMLElement, number>();
    const knockHit = new Set<HTMLElement>();
    let smoothVelX = 0;
    let smoothVelY = 0;
    let dragVelX = 0;
    let dragVelY = 0;
    let lastMoveT = performance.now();

    gsap.set(
      cards.map((c) => c.querySelector("[data-card-visual]")),
      {
        scale: 0.55,
        opacity: 0,
        rotate: () => gsap.utils.random(-8, 8),
      },
    );

    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro.to(
      cards.map((c) => c.querySelector("[data-card-visual]")),
      {
        scale: 1,
        opacity: 1,
        rotate: 0,
        duration: 1.1,
        stagger: { each: 0.03, from: "random" },
      },
      0.1,
    );

    const place = (time: number, dt: number) => {
      const vw = window.innerWidth;
      const vh = root.clientHeight || window.innerHeight;
      const margin = CARD * 1.5;
      const layoutScale = layoutScaleFor(vw);

      const camCellX = Math.floor(-worldX / CELL_W);
      const camCellY = Math.floor(-worldY / CELL_H);
      originCellX = camCellX;
      originCellY = camCellY;

      // Inertia stretch — squares feel yanked by motion
      const targetVelX = dragging ? dragVelX : velX;
      const targetVelY = dragging ? dragVelY : velY;
      panVel.x = targetVelX;
      panVel.y = targetVelY;
      smoothVelX += (targetVelX - smoothVelX) * Math.min(1, dt * 18);
      smoothVelY += (targetVelY - smoothVelY) * Math.min(1, dt * 18);
      const skewX = Math.max(-18, Math.min(18, -smoothVelX * 0.32));
      const skewY = Math.max(-18, Math.min(18, -smoothVelY * 0.32));
      const speed = Math.hypot(smoothVelX, smoothVelY);
      const stretchX = 1 + Math.min(Math.abs(smoothVelX) / 95, 0.16);
      const stretchY = 1 + Math.min(Math.abs(smoothVelY) / 95, 0.16);
      const squash = 1 - Math.min(speed / 220, 0.08);

      for (const card of cards) {
        const lx = Number(card.dataset.lx ?? 0) * layoutScale;
        const ly = Number(card.dataset.ly ?? 0) * layoutScale;
        const ox = Number(card.dataset.ox ?? 0);
        const oy = Number(card.dataset.oy ?? 0);
        const floatAmp = Number(card.dataset.floatAmp ?? 8);
        const floatFreq = Number(card.dataset.floatFreq ?? 0.35);
        const phase = Number(card.dataset.phase ?? 0);

        const cellX = originCellX + ox;
        const cellY = originCellY + oy;

        const floatX =
          Math.sin(time * floatFreq * 0.6 + phase) * floatAmp * 0.3;
        const floatY =
          Math.cos(time * floatFreq + phase * 1.2) * floatAmp * 0.45;

        const x = lx + cellX * CELL_W + worldX + floatX;
        const y = ly + cellY * CELL_H + worldY + floatY;

        const visible =
          x > -margin &&
          x < vw + margin &&
          y > -margin &&
          y < vh + margin;

        card.style.visibility = visible ? "visible" : "hidden";
        if (!visible) continue;

        const cx = x + CARD / 2;
        const cy = y + CARD / 2;
        const dx = cx - vw / 2;
        const dy = cy - vh / 2;
        const depth = 1 - Math.min(Math.hypot(dx, dy) / (Math.max(vw, vh) * 0.95), 1);

        // ABOUT expand — knock squares away when the circle hits them
        let kox = knockOx.get(card) ?? 0;
        let koy = knockOy.get(card) ?? 0;
        let kvx = knockVx.get(card) ?? 0;
        let kvy = knockVy.get(card) ?? 0;

        if (aboutKnock.active) {
          const elapsed =
            (performance.now() - aboutKnock.startedAt) / 1000;
          const progress = Math.min(1, elapsed / aboutKnock.duration);
          const radius = Math.hypot(vw, vh) * 1.15 * progress;

          const kdx = cx + kox - aboutKnock.originX;
          const kdy = cy + koy - aboutKnock.originY;
          const kd = Math.hypot(kdx, kdy) || 1;

          if (kd < radius && !knockHit.has(card)) {
            knockHit.add(card);
            const force = 900 + Math.random() * 700;
            kvx += (kdx / kd) * force;
            kvy += (kdy / kd) * force;
          }
        } else if (knockHit.size) {
          knockHit.clear();
        }

        kvx *= Math.exp(-2.8 * dt);
        kvy *= Math.exp(-2.8 * dt);
        kox += kvx * dt;
        koy += kvy * dt;
        kox *= Math.exp(-0.35 * dt);
        koy *= Math.exp(-0.35 * dt);
        if (Math.hypot(kvx, kvy) < 2 && Math.hypot(kox, koy) < 2) {
          kvx = 0;
          kvy = 0;
          kox = 0;
          koy = 0;
        }
        knockOx.set(card, kox);
        knockOy.set(card, koy);
        knockVx.set(card, kvx);
        knockVy.set(card, kvy);

        // Logo shove — card lifts then settles
        let bump = bumps.get(card) ?? 0;
        if (logoPos.ready) {
          const ldx = cx + kox - logoPos.x;
          const ldy = cy + koy - logoPos.y;
          const ld = Math.hypot(ldx, ldy);
          const near = ld < 230;
          const wasNear = nearFlags.get(card) ?? false;
          if (near && !wasNear) {
            const impact =
              0.75 + Math.min(Math.hypot(logoPos.vx, logoPos.vy) / 1800, 0.55);
            bump = Math.max(bump, impact);
          }
          nearFlags.set(card, near);
        }
        bump *= Math.exp(-4.2 * dt);
        bumps.set(card, bump);

        const lift = -bump * 38;
        const tipZ =
          bump *
            7 *
            (logoPos.vx !== 0 ? Math.sign(logoPos.vx) : 1) +
          kox * 0.02;
        const tipX = bump * 16;
        const depthScale = 0.94 + depth * 0.06;
        const spin = Math.max(-28, Math.min(28, (kvx + kvy) * 0.01));

        card.style.transform = [
          `translate3d(${x + kox}px, ${y + lift + koy}px, 0)`,
          `rotateX(${tipX.toFixed(2)}deg)`,
          `rotateZ(${(tipZ + spin).toFixed(2)}deg)`,
          `skew(${skewX.toFixed(2)}deg, ${skewY.toFixed(2)}deg)`,
          `scale3d(${(depthScale * stretchX * squash).toFixed(4)}, ${(depthScale * stretchY * squash * (1 + bump * 0.05)).toFixed(4)}, 1)`,
        ].join(" ");
        card.style.zIndex = String(10 + Math.round(depth * 20 + bump * 18));
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastT) / 1000, 0.048);
      lastT = now;

      if (!dragging) {
        velX *= Math.exp(-2.6 * dt);
        velY *= Math.exp(-2.6 * dt);
        if (Math.hypot(velX, velY) < 0.025) {
          velX = 0;
          velY = 0;
        }
        worldX += velX;
        worldY += velY;
        dragVelX = 0;
        dragVelY = 0;
      }

      place(now / 1000, dt);
      raf = requestAnimationFrame(tick);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      tracking = true;
      dragging = false;
      activePointer = event.pointerId;
      velX = 0;
      velY = 0;
      startPX = event.clientX;
      startPY = event.clientY;
      lastPX = event.clientX;
      lastPY = event.clientY;
      lastMoveT = performance.now();
      samples.length = 0;
      samples.push({
        x: event.clientX,
        y: event.clientY,
        t: performance.now(),
      });
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!tracking || event.pointerId !== activePointer) return;
      const tdx = event.clientX - startPX;
      const tdy = event.clientY - startPY;

      if (!dragging && Math.hypot(tdx, tdy) >= DRAG_THRESHOLD) {
        dragging = true;
        root.setPointerCapture(event.pointerId);
        lastPX = event.clientX;
        lastPY = event.clientY;
      }

      if (!dragging) return;

      const now = performance.now();
      const dx = event.clientX - lastPX;
      const dy = event.clientY - lastPY;
      const span = Math.max(now - lastMoveT, 1);
      dragVelX = (dx / span) * 16.5;
      dragVelY = (dy / span) * 16.5;
      worldX += dx;
      worldY += dy;
      lastPX = event.clientX;
      lastPY = event.clientY;
      lastMoveT = now;
      samples.push({
        x: event.clientX,
        y: event.clientY,
        t: now,
      });
      while (samples.length > 7) samples.shift();
    };

    const endDrag = (event: PointerEvent) => {
      if (!tracking || event.pointerId !== activePointer) return;
      tracking = false;
      activePointer = -1;

      if (dragging) {
        try {
          root.releasePointerCapture(event.pointerId);
        } catch {
          /* noop */
        }

        if (samples.length >= 2) {
          const last = samples[samples.length - 1];
          const prev =
            samples.find((s) => last.t - s.t >= 16) ?? samples[0];
          const span = Math.max(last.t - prev.t, 16);
          velX = ((last.x - prev.x) / span) * 16.5;
          velY = ((last.y - prev.y) / span) * 16.5;
          const mag = Math.hypot(velX, velY);
          const max = 72;
          if (mag > max) {
            velX = (velX / mag) * max;
            velY = (velY / mag) * max;
          }
        }

        const block = (e: Event) => {
          e.preventDefault();
          e.stopPropagation();
          root.removeEventListener("click", block, true);
        };
        root.addEventListener("click", block, true);
      }

      dragging = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      worldX -= event.deltaX;
      worldY -= event.deltaY;
      velX -= event.deltaX * 0.035;
      velY -= event.deltaY * 0.035;
    };

    // Mobile: land on a 3-card cluster (squares may be clipped, but must peek)
    const start = initialWorld(
      window.innerWidth,
      root.clientHeight || window.innerHeight,
    );
    worldX = start.worldX;
    worldY = start.worldY;

    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", endDrag);
    root.addEventListener("pointercancel", endDrag);
    root.addEventListener("wheel", onWheel, { passive: false });

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      intro.kill();
      panVel.x = 0;
      panVel.y = 0;
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerup", endDrag);
      root.removeEventListener("pointercancel", endDrag);
      root.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      id="works"
      data-lenis-prevent
      className="fixed inset-0 z-10 h-[100dvh] w-full overflow-hidden bg-white touch-none select-none"
      aria-label="互动作品展厅"
    >
      <GridBackground />
      {/* Copyright behind logo & cards */}
      <SiteFooter />
      {/* Logo + brand tail */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        <FloatingLogo />
        <BrandTitle />
      </div>
      <h1 className="sr-only">Oiiii studio</h1>

      <div
        ref={stageRef}
        className="absolute inset-0 z-[3]"
        style={{ perspective: "1200px" }}
      >
        {items.map((item) => (
          <div
            key={item.key}
            data-gallery-card
            data-lx={item.lx}
            data-ly={item.ly}
            data-ox={item.ox}
            data-oy={item.oy}
            data-float-amp={item.floatAmp}
            data-float-freq={item.floatFreq}
            data-phase={item.phase}
            className="pointer-events-auto absolute top-0 left-0 will-change-transform [transform-style:preserve-3d]"
            style={{ transform: "translate3d(-9999px,-9999px,0)" }}
          >
            <GalleryCard work={item.work} />
          </div>
        ))}
      </div>
    </section>
  );
}

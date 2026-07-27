"use client";

import type { Work } from "@/data/works";
import { useGalleryTransition } from "@/context/GalleryTransition";
import { clamp } from "@/lib/motion";
import { useEffect, useRef } from "react";
import gsap from "gsap";

type GalleryCardProps = {
  work: Work;
};

/** Sharp square · fashion field · client name as brand signal */
export function GalleryCard({ work }: GalleryCardProps) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const { startExpand, setHoveringSlug } = useGalleryTransition();
  const hoverRef = useRef(false);
  const onLight = work.surface === "light";
  const fg = onLight ? "text-ink" : "text-white";
  const fgMuted = onLight ? "text-ink/45" : "text-white/50";
  const accentLine = work.accent;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onEnter = () => {
      hoverRef.current = true;
      setHoveringSlug(work.slug);
      gsap.to(visualRef.current, {
        scale: 1.04,
        duration: 0.7,
        ease: "power3.out",
      });
    };

    const onLeave = () => {
      hoverRef.current = false;
      setHoveringSlug(null);
      gsap.to(visualRef.current, {
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        x: 0,
        y: 0,
        duration: 0.85,
        ease: "power3.out",
      });
    };

    const onMove = (event: PointerEvent) => {
      if (!hoverRef.current || !visualRef.current) return;
      const rect = visualRef.current.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      gsap.to(visualRef.current, {
        rotateX: clamp(-py * 5, -5, 5),
        rotateY: clamp(px * 6, -6, 6),
        x: px * 5,
        y: py * 5,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointermove", onMove);
    };
  }, [setHoveringSlug, work.slug]);

  const onClick = () => {
    const el = visualRef.current;
    if (!el) return;
    startExpand({ work, rect: el.getBoundingClientRect() });
  };

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={onClick}
      className="relative block h-[270px] w-[270px] appearance-none border-0 bg-transparent p-0 text-left outline-none sm:h-[280px] sm:w-[280px]"
      style={{ perspective: "1000px" }}
      aria-label={`${work.client} · ${work.title}`}
    >
      <div
        ref={visualRef}
        data-card-visual
        className="relative flex h-full w-full flex-col justify-end overflow-hidden p-5 will-change-transform sm:p-6"
        style={{
          backgroundColor: work.color,
          borderRadius: 0,
          transformStyle: "preserve-3d",
          boxShadow: onLight
            ? "0 12px 40px rgba(20, 20, 20, 0.08)"
            : "0 16px 44px rgba(0, 0, 0, 0.28)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            background: onLight
              ? `linear-gradient(145deg, ${accentLine}33 0%, transparent 42%)`
              : `linear-gradient(160deg, ${accentLine}40 0%, transparent 50%)`,
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
          }}
          aria-hidden
        />

        <div className="relative">
          <span
            className="mb-3 block h-px w-8"
            style={{ backgroundColor: accentLine }}
            aria-hidden
          />
          <h3
            className={`font-display text-[1.85rem] leading-[1.05] font-bold tracking-tight sm:text-[2.1rem] ${fg}`}
          >
            {work.client}
          </h3>
          <p className={`mt-2 text-[12px] leading-snug tracking-wide ${fgMuted}`}>
            {work.title}
          </p>
        </div>
      </div>
    </button>
  );
}

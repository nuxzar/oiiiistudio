"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import type { Work } from "@/data/works";
import { useGalleryTransition } from "@/context/GalleryTransition";

/**
 * In-place unfold: square grows in place; fixed 4:3 photo header + scrollable copy.
 */
export function ExpandOverlay() {
  const { expand, clearExpand } = useGalleryTransition();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const running = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const originRef = useRef<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    if (!expand) {
      running.current = false;
      tlRef.current?.kill();
      tlRef.current = null;
      originRef.current = null;
      return;
    }
    if (running.current) return;
    running.current = true;

    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!overlay || !panel || !content) return;

    const { rect } = expand;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    originRef.current = {
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
    };

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Wider / taller so the fixed 4:3 header has room to breathe
    const targetW = Math.min(vw - 24, vw < 640 ? vw - 20 : 460);
    const targetH = Math.min(vh - 28, vw < 640 ? vh * 0.9 : 640);
    const targetX = Math.min(
      Math.max(cx - targetW / 2, 10),
      vw - targetW - 10,
    );
    const targetY = Math.min(
      Math.max(cy - targetH / 2, 10),
      vh - targetH - 10,
    );

    gsap.set(overlay, { autoAlpha: 1, pointerEvents: "auto" });
    gsap.set(panel, {
      autoAlpha: 1,
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
    gsap.set(content, { autoAlpha: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        running.current = false;
        scrollRef.current?.focus({ preventScroll: true });
      },
    });
    tlRef.current = tl;

    tl.to(
      overlay,
      {
        backgroundColor: "rgba(255, 255, 255, 0.42)",
        duration: 0.45,
        ease: "power2.out",
      },
      0,
    )
      .to(
        panel,
        {
          x: targetX,
          y: targetY,
          width: targetW,
          height: targetH,
          duration: 0.62,
          ease: "power3.out",
        },
        0,
      )
      .to(
        content,
        {
          autoAlpha: 1,
          duration: 0.4,
          ease: "power2.out",
        },
        0.28,
      );
  }, [expand]);

  useEffect(() => {
    if (!expand) return;
    const scroller = scrollRef.current;
    if (!scroller) return;

    const onWheel = (event: WheelEvent) => {
      event.stopPropagation();
      scroller.scrollTop += event.deltaY;
      event.preventDefault();
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => scroller.removeEventListener("wheel", onWheel);
  }, [expand]);

  // Horizontal wheel / trackpad over the photo strip
  useEffect(() => {
    if (!expand) return;
    const media = mediaRef.current;
    if (!media) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.stopPropagation();
      event.preventDefault();
      media.scrollLeft += event.deltaY;
    };

    media.addEventListener("wheel", onWheel, { passive: false });
    return () => media.removeEventListener("wheel", onWheel);
  }, [expand]);

  const close = () => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const content = contentRef.current;
    const origin = originRef.current;

    if (!overlay || !panel || !origin) {
      clearExpand();
      return;
    }

    tlRef.current?.kill();
    tlRef.current = null;
    running.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        clearExpand();
        running.current = false;
      },
    });
    tlRef.current = tl;

    tl.to(content, { autoAlpha: 0, duration: 0.18, ease: "power2.in" }, 0)
      .to(
        panel,
        {
          x: origin.x,
          y: origin.y,
          width: origin.w,
          height: origin.h,
          duration: 0.5,
          ease: "power3.inOut",
        },
        0.05,
      )
      .to(
        overlay,
        {
          backgroundColor: "rgba(255, 255, 255, 0)",
          autoAlpha: 0,
          duration: 0.35,
          ease: "power2.inOut",
        },
        0.15,
      );
  };

  if (!expand) return null;

  const { work } = expand;
  const onLight = work.surface === "light";
  const fg = onLight ? "text-ink" : "text-white";
  const muted = onLight ? "text-ink/55" : "text-white/55";
  const soft = onLight ? "text-ink/70" : "text-white/75";
  const rule = onLight ? "border-ink/15" : "border-white/15";
  const shots =
    work.photos.length > 0
      ? work.photos
      : [{ tone: work.color }, { tone: work.accent }, { tone: work.color }];

  return (
    <div
      ref={overlayRef}
      data-lenis-prevent
      className="fixed inset-0 z-[90] opacity-0"
      style={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
      role="dialog"
      aria-modal="true"
      aria-label={`${work.client} · ${work.title}`}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer"
        aria-label="关闭案例"
        onClick={close}
      />

      <div
        ref={panelRef}
        data-lenis-prevent
        className="pointer-events-auto absolute top-0 left-0 z-10 flex flex-col overflow-hidden opacity-0"
        style={{
          backgroundColor: work.color,
          boxShadow: "0 18px 50px rgba(30, 22, 16, 0.22)",
          willChange: "transform, width, height",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={contentRef}
          className="flex min-h-0 flex-1 flex-col opacity-0"
        >
          {/* Fixed 4:3 photo header — horizontal scroll for multiple frames */}
          <CasePhotoHeader
            work={work}
            shots={shots}
            mediaRef={mediaRef}
            onClose={close}
          />

          <div className="relative flex shrink-0 items-start justify-between gap-3 px-5 pt-4 pb-2 sm:px-6 sm:pt-5">
            <div className="min-w-0">
              <h2
                className={`font-display text-[1.65rem] leading-[1.05] font-bold tracking-tight sm:text-[1.9rem] ${fg}`}
              >
                {work.client}
              </h2>
              <p className={`mt-1 text-sm font-medium ${soft}`}>{work.title}</p>
            </div>
          </div>

          <div
            className="mx-5 h-px sm:mx-6"
            style={{ backgroundColor: work.accent, opacity: 0.55 }}
            aria-hidden
          />

          <div
            ref={scrollRef}
            data-lenis-prevent
            tabIndex={0}
            className="case-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 outline-none sm:px-6 sm:py-5"
          >
            <p className={`text-[14px] leading-[1.75] ${soft}`}>
              {work.intro}
            </p>
            <p className={`mt-4 text-[14px] leading-[1.75] ${soft}`}>
              {work.summary}
            </p>

            <div className={`mt-6 space-y-0 border-t ${rule}`}>
              <Field
                label="需求"
                body={work.need}
                muted={muted}
                soft={soft}
                rule={rule}
              />
              <Field
                label="创意"
                body={work.creative}
                muted={muted}
                soft={soft}
                rule={rule}
              />
              <Field
                label="成果"
                body={work.outcome}
                muted={muted}
                soft={soft}
                rule={rule}
              />
            </div>

            <div className="h-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CasePhotoHeader({
  work,
  shots,
  mediaRef,
  onClose,
}: {
  work: Work;
  shots: Work["photos"];
  mediaRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  return (
    <div className="relative w-full shrink-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/10">
        <div
          ref={mediaRef}
          data-lenis-prevent
          className="case-media-scroll flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {shots.map((shot, index) => (
            <figure
              key={`${shot.src ?? shot.tone}-${index}`}
              className="relative h-full w-full shrink-0 snap-center"
            >
              {shot.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shot.src}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div
                  className="relative h-full w-full"
                  style={{
                    background: `linear-gradient(145deg, ${shot.tone} 0%, ${work.color} 55%, ${work.accent}88 100%)`,
                  }}
                  aria-hidden
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.18]"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
                    }}
                  />
                </div>
              )}
            </figure>
          ))}
        </div>

        {shots.length > 1 && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {shots.map((shot, index) => (
              <span
                key={`dot-${index}`}
                className="h-1 w-1 rounded-full bg-white/70 shadow-sm"
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/45"
        aria-label="关闭"
      >
        <span className="relative block h-3.5 w-3.5" aria-hidden>
          <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 rotate-45 bg-white" />
          <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 -rotate-45 bg-white" />
        </span>
      </button>
    </div>
  );
}

function Field({
  label,
  body,
  muted,
  soft,
  rule,
}: {
  label: string;
  body: string;
  muted: string;
  soft: string;
  rule: string;
}) {
  return (
    <div
      className={`grid gap-1.5 border-b py-4 sm:grid-cols-[72px_1fr] sm:gap-5 ${rule}`}
    >
      <p
        className={`text-[10px] font-semibold tracking-[0.18em] uppercase ${muted}`}
      >
        {label}
      </p>
      <p className={`text-[14px] leading-[1.7] ${soft}`}>{body}</p>
    </div>
  );
}

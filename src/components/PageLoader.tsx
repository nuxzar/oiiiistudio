"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { works } from "@/data/works";

const LOGO_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.png`;
const MIN_MS = 900;
const FADE_MS = 520;

function collectAssets() {
  const urls = new Set<string>([LOGO_SRC]);
  for (const work of works) {
    for (const photo of work.photos) {
      if (photo.src) urls.add(photo.src);
    }
  }
  return [...urls];
}

function loadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

export function PageLoader({ children }: { children: ReactNode }) {
  const assets = useMemo(() => collectAssets(), []);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [progress, setProgress] = useState(0);
  const displayRef = useRef(0);
  const targetRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    let loaded = 0;
    const total = Math.max(assets.length, 1);

    const bump = () => {
      loaded += 1;
      const ratio = loaded / total;
      // Cap at 92% until fonts + min time settle
      targetRef.current = Math.min(0.92, ratio * 0.92);
    };

    const tick = () => {
      if (cancelled) return;
      const cur = displayRef.current;
      const next = cur + (targetRef.current - cur) * 0.08;
      displayRef.current = next;
      setProgress(Math.min(100, Math.round(next * 100)));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const run = async () => {
      await Promise.all(assets.map((src) => loadImage(src).then(bump)));

      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {
        /* ignore */
      }

      targetRef.current = 1;

      const elapsed = performance.now() - started;
      if (elapsed < MIN_MS) {
        await new Promise((r) => setTimeout(r, MIN_MS - elapsed));
      }

      // Let displayed progress catch 100
      await new Promise<void>((resolve) => {
        const finish = () => {
          if (displayRef.current >= 0.995) {
            displayRef.current = 1;
            setProgress(100);
            resolve();
            return;
          }
          requestAnimationFrame(finish);
        };
        finish();
      });

      if (cancelled) return;
      setReady(true);
      setLeaving(true);
      window.setTimeout(() => {
        if (!cancelled) setGone(true);
      }, FADE_MS);
    };

    void run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
    };
  }, [assets]);

  const tone = Math.round(210 * (1 - progress / 100)); // light gray → black

  return (
    <>
      {ready ? children : null}

      {!gone && (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-white"
          style={{
            opacity: leaving ? 0 : 1,
            transition: `opacity ${FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
          aria-busy={!ready}
          aria-live="polite"
          aria-label={`加载中 ${progress}%`}
        >
          <div className="flex min-h-0 flex-1 items-center justify-center px-8">
            <div
              className="h-[min(28vw,140px)] w-[min(28vw,140px)]"
              style={{
                backgroundColor: `rgb(${tone}, ${tone}, ${tone})`,
                WebkitMaskImage: `url(${LOGO_SRC})`,
                maskImage: `url(${LOGO_SRC})`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
              }}
              role="img"
              aria-label="Oiiii studio"
            />
          </div>

          <div className="shrink-0 px-6 pb-7 sm:px-10 sm:pb-9">
            <div className="mb-2 flex items-end justify-between gap-3">
              <span className="text-[11px] font-medium tracking-[0.22em] text-black/55 uppercase">
                Loading
              </span>
              <span className="font-display text-sm font-semibold tabular-nums text-black">
                {progress}%
              </span>
            </div>
            <div className="h-[2px] w-full overflow-hidden bg-black/10">
              <div
                className="h-full bg-black"
                style={{
                  width: `${progress}%`,
                  transition: "width 80ms linear",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

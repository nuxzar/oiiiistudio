"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { aboutKnock } from "@/lib/aboutKnock";

const ABOUT_TITLE = "上哪找 Oiiii 这么好的创意工作室去啊？";

const ABOUT_PARAS = [
  "首先，我们是美食、玩具、球鞋、造型、网球、徒步、文字、音乐、摄影、花钱的爱好者，我们热爱一会好一会坏的生活；其次，我们才是策略、创意、产品、营销的专家。",
  "在互联网、广告行业从业多年，为很多快消、美妆、时尚领域的朋友们提供解决方案，案例能拎出来一堆，直到有一天我们发现：消费者真的喜欢我们的创意吗？KPI 和赚钱是一回事吗？老板觉得好的东西真的在传播吗？我们真的有价值吗……",
  "除了在这个行当工作外，我们同样也是消费者，我们得做首先是让我们喜欢、分享的东西，而不是那些千篇一律、为了交差的行活，在新建文档那天，其实它就已经死了，更别提打动谁、创造商业价值了。于是，我们发起了这个工作室。",
  "我们更擅长彼此深度讨论后，提供为目标服务的解决方案，我们聚焦在艺人 IP 与粉丝周边体系的搭建 / 品牌年轻化改造 / 创意型整合营销 / IP & 产品商业化。我们相信，合作本身就是一次生活体验，有更多想法的话咱们微信聊聊：OiiiiCreation .",
  
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const openAbout = () => {
    const btn = btnRef.current;
    const rect = btn?.getBoundingClientRect();
    aboutKnock.active = true;
    aboutKnock.originX = rect
      ? rect.left + rect.width / 2
      : window.innerWidth - 48;
    aboutKnock.originY = rect ? rect.top + rect.height / 2 : 48;
    aboutKnock.startedAt = performance.now();
    aboutKnock.duration = 0.7;
    setOpen(true);
  };

  const closeAbout = () => {
    setOpen(false);
    window.setTimeout(() => {
      aboutKnock.active = false;
    }, 400);
  };

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-end p-4 sm:p-6">
        <div className="pointer-events-auto">
          {!open && (
            <button
              ref={btnRef}
              type="button"
              onClick={openAbout}
              className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              aria-label="打开 About"
            >
              ABOUT
              <span className="flex flex-col gap-1" aria-hidden>
                <span className="block h-[2px] w-4 bg-white" />
                <span className="block h-[2px] w-4 bg-white" />
              </span>
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-black text-white"
            initial={{ clipPath: "circle(0% at calc(100% - 3rem) 3rem)" }}
            animate={{ clipPath: "circle(160% at calc(100% - 3rem) 3rem)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 3rem) 3rem)" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              data-lenis-prevent
              className="about-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-8 pt-20 pb-6 sm:px-16 sm:pt-24 sm:pb-8 lg:px-24 lg:pt-28"
            >
              <AboutCopy key="about-copy" />
            </div>

            <div className="flex shrink-0 justify-center border-t border-white/10 bg-black px-6 pt-4 pb-8 sm:pb-10">
              <button
                type="button"
                onClick={closeAbout}
                className="flex h-12 min-w-[7.5rem] items-center justify-center rounded-[999px] border border-white/35 bg-white px-6 text-[15px] font-semibold tracking-wide text-black transition hover:bg-white/90 sm:h-14 sm:min-w-[9rem] sm:px-8 sm:text-base"
                aria-label="关闭"
              >
                👌 说得真好！
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const PARA_ROLL_MS = 1100;
const PARA_GAP_MS = 220;
const PARA_EASE = [0.16, 1, 0.3, 1] as const;

function AboutCopy() {
  const [typed, setTyped] = useState(0);
  /** How many paragraphs have started rolling in */
  const [visibleParas, setVisibleParas] = useState(0);
  const reducedRef = useRef(false);

  useEffect(() => {
    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reducedRef.current) {
      setTyped(ABOUT_TITLE.length);
      setVisibleParas(ABOUT_PARAS.length);
      return;
    }

    let cancelled = false;
    let timer = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    const run = async () => {
      await wait(380);

      for (let i = 1; i <= ABOUT_TITLE.length; i += 1) {
        if (cancelled) return;
        setTyped(i);
        await wait(48);
      }

      await wait(420);

      for (let p = 1; p <= ABOUT_PARAS.length; p += 1) {
        if (cancelled) return;
        setVisibleParas(p);
        await wait(PARA_ROLL_MS + PARA_GAP_MS);
      }
    };

    void run();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h2
        className="font-display text-xl leading-snug font-bold tracking-tight text-white sm:text-2xl md:text-[1.85rem] md:leading-[1.35]"
        aria-label={ABOUT_TITLE}
      >
        <span>{ABOUT_TITLE.slice(0, typed)}</span>
        <span className="about-caret ml-0.5 inline-block text-white" aria-hidden>
          _
        </span>
      </h2>

      <div className="mt-7 space-y-5 text-[15px] leading-[1.8] text-white/80 sm:mt-8 sm:space-y-6 sm:text-base sm:leading-[1.85]">
        {ABOUT_PARAS.slice(0, visibleParas).map((para) => (
          <div key={para.slice(0, 16)} className="overflow-hidden">
            <motion.p
              initial={reducedRef.current ? false : { y: "1.25em", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: PARA_ROLL_MS / 1000,
                ease: PARA_EASE,
              }}
            >
              {para}
            </motion.p>
          </div>
        ))}
      </div>
    </div>
  );
}

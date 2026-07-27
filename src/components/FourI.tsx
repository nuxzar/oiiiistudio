"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { fourIs } from "@/data/fourIs";

gsap.registerPlugin(ScrollTrigger);

export function FourI() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-i-card]");
      const letters = gsap.utils.toArray<HTMLElement>("[data-i-letter]");

      gsap.from(letters, {
        yPercent: 120,
        rotate: -8,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
        },
      });

      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 80, rotate: index % 2 === 0 ? -4 : 4, opacity: 0 },
          {
            y: 0,
            rotate: 0,
            opacity: 1,
            duration: 0.85,
            ease: "back.out(1.4)",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
            },
          },
        );

        card.addEventListener("pointerenter", () => {
          gsap.to(card, {
            y: -10,
            scale: 1.03,
            duration: 0.35,
            ease: "power2.out",
          });
        });
        card.addEventListener("pointerleave", () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.45,
            ease: "power2.out",
          });
        });
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="four-i"
      ref={sectionRef}
      className="relative overflow-hidden bg-butter px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col gap-4 sm:mb-20 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
              Brand System
            </p>
            <h2 className="font-display text-4xl font-extrabold text-ink sm:text-6xl">
              四个 I，一次完整创作闭环
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-ink/70">
            Oiiii 不是口号墙。四个 I 是我们每天一起玩、一起推、一起交付的工作方法。
          </p>
        </div>

        <div className="mb-10 flex justify-center gap-2 sm:mb-16 sm:gap-4" aria-hidden>
          {fourIs.map((item) => (
            <div key={item.key} className="overflow-hidden">
              <span
                data-i-letter
                className="inline-block font-display text-6xl font-black sm:text-8xl"
                style={{ color: item.color }}
              >
                I
              </span>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fourIs.map((item, index) => (
            <article
              key={item.key}
              data-i-card
              className="relative min-h-[240px] overflow-hidden rounded-[1.75rem] p-6 text-ink"
              style={{ backgroundColor: item.color }}
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-5xl font-black opacity-90">
                  {item.letter}
                </span>
                <span className="rounded-full bg-ink/10 px-3 py-1 text-xs font-semibold">
                  0{index + 1}
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold">{item.title}</h3>
              <p className="mt-1 text-sm font-semibold opacity-80">{item.zh}</p>
              <p className="mt-4 text-sm leading-relaxed text-ink/80">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

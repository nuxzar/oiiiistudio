"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Work } from "@/data/works";
import { EASE } from "@/lib/motion";

type CaseStudyProps = {
  work: Work;
  next: Work;
};

export function CaseStudy({ work, next }: CaseStudyProps) {
  const [fromExpand, setFromExpand] = useState(false);

  useEffect(() => {
    const flag = sessionStorage.getItem("oiiii-expand");
    if (flag === work.slug) {
      setFromExpand(true);
      sessionStorage.removeItem("oiiii-expand");
    }
  }, [work.slug]);

  const fields = [
    { label: "需求", body: work.need },
    { label: "创意", body: work.creative },
    { label: "成果", body: work.outcome },
  ];

  return (
    <article className="bg-paper text-ink">
      <section className="relative min-h-[100dvh] overflow-hidden px-6 pt-28 pb-16 sm:px-10">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(circle at 20% 20%, ${work.accent}55, transparent 45%), radial-gradient(circle at 80% 10%, ${work.color}66, transparent 40%), linear-gradient(160deg, #f7f3ea 0%, #efe7d8 100%)`,
          }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <motion.h1
              initial={fromExpand ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                ease: EASE.expoOut,
                delay: fromExpand ? 0.2 : 0.05,
              }}
              className="font-display text-5xl leading-[1.05] font-extrabold sm:text-7xl"
            >
              {work.client}
            </motion.h1>
            <motion.p
              initial={fromExpand ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.75,
                ease: EASE.expoOut,
                delay: fromExpand ? 0.28 : 0.12,
              }}
              className="mt-5 max-w-xl text-lg text-ink/70 sm:text-xl"
            >
              {work.title}
            </motion.p>
            <motion.p
              initial={fromExpand ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: fromExpand ? 0.35 : 0.2 }}
              className="mt-6 max-w-xl text-base leading-8 text-ink/65"
            >
              {work.intro}
            </motion.p>
          </div>

          <motion.div
            initial={
              fromExpand
                ? { opacity: 1, scale: 1, rotate: -2 }
                : { opacity: 0, scale: 0.94, rotate: 3 }
            }
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={
              fromExpand
                ? { duration: 0.01 }
                : { type: "spring", stiffness: 160, damping: 18 }
            }
            className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] shadow-[0_30px_80px_rgba(20,40,47,0.18)]"
            style={{ backgroundColor: work.color }}
            data-case-hero
          />
        </div>
      </section>

      <section className="border-y border-ink/8 bg-cream px-6 py-16 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-2xl leading-relaxed sm:text-3xl">
            {work.summary}
          </p>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-3xl space-y-12">
          {fields.map((field, index) => (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                <span className="mb-2 block text-xs font-semibold tracking-[0.2em] text-ink/40 uppercase">
                  0{index + 1}
                </span>
                {field.label}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-ink/75 sm:text-lg">
                {field.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 font-display text-3xl font-bold sm:text-4xl">
            图片展示
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {work.photos.map((item, index) => (
              <motion.figure
                key={`${item.src ?? item.tone}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="overflow-hidden rounded-[1.5rem]"
                style={{ backgroundColor: item.tone }}
              >
                {item.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt=""
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[4/5] w-full" />
                )}
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/8 px-6 py-16 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm tracking-[0.18em] text-ink/45 uppercase">
              Next Project
            </p>
            <Link
              href={`/work/${next.slug}`}
              className="mt-2 inline-block font-display text-3xl font-bold transition hover:translate-x-1 sm:text-5xl"
            >
              {next.client} →
            </Link>
          </div>
          <Link
            href="/#works"
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream"
          >
            返回作品墙
          </Link>
        </div>
      </section>
    </article>
  );
}

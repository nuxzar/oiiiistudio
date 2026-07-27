"use client";

import { motion } from "framer-motion";

export function StudioNote() {
  return (
    <section
      id="studio"
      className="relative overflow-hidden bg-mint px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-ink/55">
            Studio
          </p>
          <h2 className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-6xl">
            这里是创意实验室，
            <br />
            不是汇报 PPT 工厂。
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">
            Oiiii
            帮品牌把洞察做成可玩的体验：包装、空间、互动、内容与增长路径一起生长。我们更在意人们会不会停下来玩一会儿。
          </p>
        </div>

        <motion.a
          href="mailto:hello@oiiii.studio"
          className="inline-flex items-center justify-center rounded-[2rem] bg-ink px-8 py-10 text-center font-display text-2xl font-bold text-cream transition sm:text-3xl"
          whileHover={{ scale: 1.03, rotate: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          hello@oiiii.studio
          <span className="mt-2 block w-full text-sm font-sans font-medium text-cream/60">
            把你的项目丢过来
          </span>
        </motion.a>
      </div>
    </section>
  );
}

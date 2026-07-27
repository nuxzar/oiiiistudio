/** Copyright — sits on the rearmost UI layer (above grid, under logo/cards) */
export function SiteFooter() {
  return (
    <footer
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] flex justify-center px-4 pb-3 pt-2 sm:pb-4"
      aria-label="版权声明"
    >
      <p className="text-[11px] font-medium tracking-wide text-black/70 sm:text-xs">
        (c) Oiiii studio · 干点来劲的
      </p>
    </footer>
  );
}

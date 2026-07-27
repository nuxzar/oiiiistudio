import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { Header } from "@/components/Header";
import { PageLoader } from "@/components/PageLoader";
import { SmoothScroll } from "@/components/SmoothScroll";
import { InteractionLayer } from "@/components/gallery/InteractionLayer";
import { GalleryTransitionProvider } from "@/context/GalleryTransition";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Oiiii · 创意工作室",
  description:
    "Oiiii 创意工作室 — Insight / Imagination / Item / Income。可玩的作品展示空间。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        <PageLoader>
          <GalleryTransitionProvider>
            <SmoothScroll>
              <Header />
              <main>{children}</main>
              <InteractionLayer />
            </SmoothScroll>
          </GalleryTransitionProvider>
        </PageLoader>
      </body>
    </html>
  );
}

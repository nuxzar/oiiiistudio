"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Work } from "@/data/works";

export type ExpandPayload = {
  work: Work;
  rect: DOMRect;
};

type GalleryTransitionContextValue = {
  expand: ExpandPayload | null;
  startExpand: (payload: ExpandPayload) => void;
  clearExpand: () => void;
  hoveringSlug: string | null;
  setHoveringSlug: (slug: string | null) => void;
};

const GalleryTransitionContext =
  createContext<GalleryTransitionContextValue | null>(null);

export function GalleryTransitionProvider({ children }: { children: ReactNode }) {
  const [expand, setExpand] = useState<ExpandPayload | null>(null);
  const [hoveringSlug, setHoveringSlug] = useState<string | null>(null);

  const startExpand = useCallback((payload: ExpandPayload) => {
    setExpand(payload);
  }, []);

  const clearExpand = useCallback(() => {
    setExpand(null);
  }, []);

  const value = useMemo(
    () => ({
      expand,
      startExpand,
      clearExpand,
      hoveringSlug,
      setHoveringSlug,
    }),
    [expand, startExpand, clearExpand, hoveringSlug],
  );

  return (
    <GalleryTransitionContext.Provider value={value}>
      {children}
    </GalleryTransitionContext.Provider>
  );
}

export function useGalleryTransition() {
  const ctx = useContext(GalleryTransitionContext);
  if (!ctx) {
    throw new Error("useGalleryTransition must be used within provider");
  }
  return ctx;
}

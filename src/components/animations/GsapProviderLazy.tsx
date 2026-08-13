"use client";

import { GsapProvider } from "@/components/animations/GsapProvider";

interface GsapProviderLazyProps {
  children: React.ReactNode;
}

/**
 * Thin client boundary so the layout can wrap RSC children.
 * GSAP itself is imported inside GsapProvider effects / TransitionLink clicks.
 */
export function GsapProviderLazy({ children }: GsapProviderLazyProps) {
  return <GsapProvider>{children}</GsapProvider>;
}

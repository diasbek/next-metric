"use client";

import { GsapProvider } from "@/components/animations/GsapProvider";

interface GsapProviderLazyProps {
  children: React.ReactNode;
}

/** Client effects only — children (RSC) stay in the SSR HTML. */
export function GsapProviderLazy({ children }: GsapProviderLazyProps) {
  return <GsapProvider>{children}</GsapProvider>;
}

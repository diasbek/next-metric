"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

/**
 * SPA PageView for the Meta Pixel already inlined in the root <head>.
 * Skips `/admin` — public site only.
 */
export function FacebookPixel() {
  const pathname = usePathname();
  const skipNextHit = useRef(true);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (skipNextHit.current) {
      skipNextHit.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}

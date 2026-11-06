"use client";

import { useEffect, useRef } from "react";

/**
 * First-paint boot wipe (concept `#tr`). Overlay only — SSR page content
 * stays in the DOM underneath for SEO / pixel Event Manager.
 */
export function ProtoBootOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.remove();
      return;
    }
    // Brief cover, then fade out — never leave concept copy sitting on the page.
    const t = window.setTimeout(() => {
      el.classList.add("is-done");
      el.style.pointerEvents = "none";
      window.setTimeout(() => el.remove(), 500);
    }, 280);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="tr on proto-boot" id="tr" ref={ref} aria-hidden="true">
      <div className="proto-boot__wash" />
    </div>
  );
}

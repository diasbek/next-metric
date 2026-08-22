"use client";

import { useEffect } from "react";

/** Post-hydration safety net — clears stale GSAP hide gates if cached CSS returns. */
export function ContentVisibilityGuard() {
  useEffect(() => {
    const unlock = () => {
      const html = document.documentElement;
      html.classList.remove("gsap-pending");
      html.classList.add("content-visible", "gsap-ready", "gsap-force-show");

      document.querySelectorAll<HTMLElement>(".media-image").forEach((root) => {
        const img = root.querySelector("img");
        if (img && img.complete && img.naturalWidth > 0) {
          root.classList.add("is-loaded");
        }
      });
    };

    unlock();
    window.addEventListener("pageshow", unlock);
    return () => window.removeEventListener("pageshow", unlock);
  }, []);

  return null;
}

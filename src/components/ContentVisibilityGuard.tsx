"use client";

import { useEffect } from "react";

function removeStreamingShellDuplicates() {
  document.querySelectorAll<HTMLElement>('div[id^="S:"]').forEach((shell) => {
    if (shell.querySelector("#site-content")) {
      shell.remove();
    }
  });
}

/** Post-hydration: remove stale streaming shells and mark decoded images loaded. */
export function ContentVisibilityGuard() {
  useEffect(() => {
    const cleanup = () => {
      removeStreamingShellDuplicates();

      document.querySelectorAll<HTMLElement>(".media-image").forEach((root) => {
        const img = root.querySelector("img");
        if (img && img.complete && img.naturalWidth > 0) {
          root.classList.add("is-loaded");
        }
      });
    };

    cleanup();
    window.addEventListener("pageshow", cleanup);
    return () => window.removeEventListener("pageshow", cleanup);
  }, []);

  return null;
}

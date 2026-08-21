"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { settleScrollAfterNavigation } from "@/utils/scroll";

interface GsapProviderProps {
  children: React.ReactNode;
}

const HARD_READY_MS = 3000;

async function waitForPaint(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/** Yield the main thread before pulling in the heavy animation bundle. */
async function waitForIdle(timeoutMs = 400): Promise<void> {
  await new Promise<void>((resolve) => {
    const ric = (
      window as Window & {
        requestIdleCallback?: (
          cb: IdleRequestCallback,
          opts?: IdleRequestOptions,
        ) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      ric(() => resolve(), { timeout: timeoutMs });
    } else {
      setTimeout(resolve, 50);
    }
  });
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Best-effort GSAP reveal — never blocks markReady if the chunk fails. */
async function tryShowAllRevealTargets(
  options?: { preserveCaseSteps?: boolean },
): Promise<void> {
  try {
    const { showAllRevealTargets } = await import("@/animations/gsap");
    showAllRevealTargets(options);
  } catch {
    /* CSS force-show / pending removal still makes content readable */
  }
}

function settleIfHash(): void {
  if (typeof window === "undefined") return;
  if (!window.location.hash) return;
  settleScrollAfterNavigation();
}

export function GsapProvider({ children }: GsapProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    settleIfHash();

    const reduced = prefersReducedMotion();
    const html = document.documentElement;
    // Layout already paints with gsap-pending; keep it through Strict Mode
    // remounts so content never flashes visible → hidden → visible.
    // No delayed boot spinner: hero LCP is intentional during pending, and a
    // late overlay on top of it feels like a second loading pass.
    if (reduced) {
      html.classList.remove("gsap-pending", "gsap-force-show");
    } else {
      html.classList.add("gsap-pending");
      html.classList.remove("gsap-ready", "gsap-force-show");
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let hardReadyTimer: ReturnType<typeof setTimeout> | undefined;
    let ready = false;

    const clearTimers = () => {
      if (hardReadyTimer) {
        clearTimeout(hardReadyTimer);
        hardReadyTimer = undefined;
      }
    };

    const markReady = (opts: { forceShow?: boolean } = {}) => {
      if (ready || cancelled) return;
      ready = true;
      clearTimers();
      html.classList.remove("gsap-pending");
      if (opts.forceShow) {
        html.classList.add("gsap-force-show");
      }
      html.classList.add("gsap-ready");
      settleIfHash();
    };

    /** Absolute safety net — never leave the page blank, even mid-import. */
    const forceReadyCssOnly = () => {
      if (ready || cancelled) return;
      html.classList.add("gsap-force-show");
      markReady({ forceShow: true });
      void tryShowAllRevealTargets();
    };

    if (!reduced) {
      hardReadyTimer = setTimeout(forceReadyCssOnly, HARD_READY_MS);
    }

    const run = async () => {
      if (typeof window !== "undefined" && window.location.hash) {
        await tryShowAllRevealTargets({ preserveCaseSteps: true });
        if (cancelled) return;
      }

      if (reduced) {
        try {
          const { initAnimations } = await import("@/animations");
          if (cancelled) return;
          cleanup = initAnimations(pathname);
          markReady();
        } catch {
          markReady({ forceShow: true });
          void tryShowAllRevealTargets();
        }
        return;
      }

      try {
        const { playEnterTransition, resetPageTransition } = await import(
          "@/animations/page-transition"
        );
        await waitForPaint();
        if (cancelled) return;

        await playEnterTransition();
        if (cancelled) {
          resetPageTransition();
          return;
        }

        await waitForIdle(400);
        if (cancelled || ready) return;

        const { initAnimations } = await import("@/animations");
        await waitForPaint();
        if (cancelled || ready) return;

        cleanup = initAnimations(pathname);
        markReady();
        void import("@/animations/page-transition");
      } catch {
        if (cancelled || ready) return;
        try {
          const { resetPageTransition } = await import(
            "@/animations/page-transition"
          );
          resetPageTransition();
        } catch {
          /* ignore */
        }
        markReady({ forceShow: true });
        void tryShowAllRevealTargets();
      }
    };

    void run();

    return () => {
      cancelled = true;
      clearTimers();
      cleanup?.();
      // Keep pending across Strict Mode remount / soft nav so SSR-visible
      // content never pops back before the next effect re-hides it.
      html.classList.remove("gsap-ready", "gsap-force-show");
      if (!prefersReducedMotion()) {
        html.classList.add("gsap-pending");
      }
    };
  }, [pathname]);

  return <>{children}</>;
}

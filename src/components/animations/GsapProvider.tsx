"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { settleScrollAfterNavigation } from "@/utils/scroll";

interface GsapProviderProps {
  children: React.ReactNode;
}

/** Fail-open: never leave the page blank waiting on the animation chunk. */
const HARD_READY_MS = 1500;

/** Survives Soft nav / Strict Mode remounts within the same document session. */
let bootCompleted = false;

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

async function tryResetPageTransition(): Promise<void> {
  try {
    const { resetPageTransition } = await import("@/animations/page-transition");
    resetPageTransition();
  } catch {
    /* ignore */
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
    const softNav = bootCompleted;

    // Cold boot: keep SSR gsap-pending so reveals don't flash before init.
    // Soft nav / Strict remount: never re-hide — that was the white-screen bug.
    if (reduced) {
      html.classList.remove("gsap-pending", "gsap-force-show");
    } else if (softNav) {
      html.classList.remove("gsap-pending", "gsap-force-show");
      void tryShowAllRevealTargets({ preserveCaseSteps: true });
      void tryResetPageTransition();
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
      bootCompleted = true;
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
      html.classList.remove("gsap-pending");
      markReady({ forceShow: true });
      void tryShowAllRevealTargets();
      void tryResetPageTransition();
    };

    if (!reduced) {
      // Soft nav already shows content; still fail-open if init hangs.
      hardReadyTimer = setTimeout(
        forceReadyCssOnly,
        softNav ? HARD_READY_MS * 2 : HARD_READY_MS,
      );
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
        if (!softNav) {
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
        } else {
          await waitForPaint();
          if (cancelled || ready) return;
          await tryResetPageTransition();
        }

        const { initAnimations } = await import("@/animations");
        await waitForPaint();
        if (cancelled || ready) return;

        cleanup = initAnimations(pathname);
        markReady();
        void import("@/animations/page-transition");
      } catch {
        if (cancelled || ready) return;
        await tryResetPageTransition();
        markReady({ forceShow: true });
        void tryShowAllRevealTargets();
      }
    };

    void run();

    return () => {
      cancelled = true;
      clearTimers();
      cleanup?.();
      // Keep content readable across remount/nav. Re-adding gsap-pending here
      // blanked the page (white screen) until the next effect finished.
      html.classList.remove("gsap-ready");
      void tryShowAllRevealTargets();
      void tryResetPageTransition();
    };
  }, [pathname]);

  return <>{children}</>;
}

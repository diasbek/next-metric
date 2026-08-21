"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { settleScrollAfterNavigation } from "@/utils/scroll";

interface GsapProviderProps {
  children: React.ReactNode;
}

const HARD_READY_MS = 3000;
const SLOW_SPINNER_MS = 500;

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

export function GsapProvider({ children }: GsapProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    settleScrollAfterNavigation();

    const reduced = prefersReducedMotion();
    const html = document.documentElement;
    if (!reduced) {
      html.classList.add("gsap-pending");
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let hardReadyTimer: ReturnType<typeof setTimeout> | undefined;
    let slowSpinnerTimer: ReturnType<typeof setTimeout> | undefined;
    let ready = false;

    const clearTimers = () => {
      if (hardReadyTimer) {
        clearTimeout(hardReadyTimer);
        hardReadyTimer = undefined;
      }
      if (slowSpinnerTimer) {
        clearTimeout(slowSpinnerTimer);
        slowSpinnerTimer = undefined;
      }
    };

    const markReady = (opts: { forceShow?: boolean } = {}) => {
      if (ready || cancelled) return;
      ready = true;
      clearTimers();
      html.classList.remove("gsap-pending", "gsap-slow");
      if (opts.forceShow) {
        html.classList.add("gsap-force-show");
      }
      html.classList.add("gsap-ready");
      settleScrollAfterNavigation();
    };

    /** Absolute safety net — never leave the page blank, even mid-import. */
    const forceReadyCssOnly = () => {
      if (ready || cancelled) return;
      html.classList.add("gsap-force-show");
      markReady({ forceShow: true });
      void tryShowAllRevealTargets();
    };

    if (!reduced) {
      slowSpinnerTimer = setTimeout(() => {
        if (cancelled || ready) return;
        if (html.classList.contains("gsap-pending")) {
          html.classList.add("gsap-slow");
        }
      }, SLOW_SPINNER_MS);

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
      html.classList.remove(
        "gsap-pending",
        "gsap-ready",
        "gsap-slow",
        "gsap-force-show",
      );
      cleanup?.();
    };
  }, [pathname]);

  return (
    <>
      <div
        className="site-boot-overlay"
        aria-busy="true"
        aria-live="polite"
        aria-label="Loading"
      >
        <div className="site-boot-overlay__inner">
          {/* eslint-disable-next-line @next/next/no-img-element -- boot shell before next/image */}
          <img
            className="site-boot-overlay__logo"
            src="/images/metric/logo/metric-logo.svg"
            alt=""
            width={160}
            height={36}
          />
          <span className="site-boot-overlay__spinner" aria-hidden="true" />
        </div>
      </div>
      {children}
    </>
  );
}

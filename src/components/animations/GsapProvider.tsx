"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { settleScrollAfterNavigation } from "@/utils/scroll";

interface GsapProviderProps {
  children: React.ReactNode;
}

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

export function GsapProvider({ children }: GsapProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Preserve / repair in-page hash targets across route changes.
    settleScrollAfterNavigation();

    // Jumping straight to a mid-page anchor (nav click from another page,
    // or a hard reload on a `#section` URL) must never leave that section
    // sitting invisible for however long GSAP takes to boot. Force it (and
    // everything else) visible immediately; initAnimations() below skips
    // already-revealed elements, so this never causes a flash.
    if (typeof window !== "undefined" && window.location.hash) {
      void import("@/animations/gsap").then(({ showAllRevealTargets }) => {
        showAllRevealTargets();
      });
    }

    const reduced = prefersReducedMotion();
    if (!reduced) {
      document.documentElement.classList.add("gsap-pending");
    }

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
    let initStarted = false;

    const clearFallback = () => {
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = undefined;
      }
    };

    const markReady = () => {
      document.documentElement.classList.remove("gsap-pending");
      document.documentElement.classList.add("gsap-ready");
    };

    const run = async () => {
      if (reduced) {
        try {
          const { initAnimations } = await import("@/animations");
          if (cancelled) return;
          cleanup = initAnimations(pathname);
          markReady();
          settleScrollAfterNavigation();
        } catch {
          const { showAllRevealTargets } = await import("@/animations/gsap");
          if (cancelled) return;
          showAllRevealTargets();
          markReady();
          settleScrollAfterNavigation();
        }
        return;
      }

      // Force-show content if init stalls — do not leave the page blank.
      fallbackTimer = setTimeout(async () => {
        if (cancelled || initStarted) return;
        const { showAllRevealTargets } = await import("@/animations/gsap");
        if (cancelled || initStarted) return;
        showAllRevealTargets();
        markReady();
        settleScrollAfterNavigation();
      }, 2000);

      try {
        const { playEnterTransition, resetPageTransition } = await import(
          "@/animations/page-transition"
        );
        await waitForPaint();
        if (cancelled) {
          clearFallback();
          return;
        }

        await playEnterTransition();
        if (cancelled) {
          resetPageTransition();
          clearFallback();
          return;
        }

        await waitForIdle(400);
        if (cancelled) {
          clearFallback();
          return;
        }

        initStarted = true;
        clearFallback();

        const { initAnimations } = await import("@/animations");
        await waitForPaint();
        if (cancelled) {
          return;
        }

        cleanup = initAnimations(pathname);
        settleScrollAfterNavigation();
        markReady();
      } catch {
        clearFallback();
        if (cancelled) return;
        const [{ showAllRevealTargets }, { resetPageTransition }] =
          await Promise.all([
            import("@/animations/gsap"),
            import("@/animations/page-transition"),
          ]);
        if (cancelled) return;
        resetPageTransition();
        showAllRevealTargets();
        settleScrollAfterNavigation();
        markReady();
      }
    };

    void run();

    return () => {
      cancelled = true;
      clearFallback();
      document.documentElement.classList.remove("gsap-pending", "gsap-ready");
      // Do NOT reset page-transition state here: this cleanup runs on every
      // route change (that's the whole point of re-running this effect), but
      // the entering page's own playEnterTransition() call still needs the
      // pending Flip/fade/scroll-hash state stashed by navigateWithTransition.
      // Resetting it here always won (it resolves before the new effect's
      // first await), permanently skipping the enter animation. Real error
      // paths already call resetPageTransition() themselves.
      cleanup?.();
    };
  }, [pathname]);

  return <>{children}</>;
}

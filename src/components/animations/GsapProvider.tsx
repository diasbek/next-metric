"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { settleScrollAfterNavigation } from "@/utils/scroll";
import { shouldSkipHeavyMotion } from "@/utils/webview";

interface GsapProviderProps {
  children: React.ReactNode;
}

/** Survives soft navigations within the same document session. */
let bootCompleted = false;

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

async function tryShowAllRevealTargets(
  options?: { preserveCaseSteps?: boolean },
): Promise<void> {
  try {
    const { showAllRevealTargets } = await import("@/animations/gsap");
    showAllRevealTargets(options);
  } catch {
    /* head boot CSS already made content readable */
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

function ensureContentVisible(html: HTMLElement, forceAll = false): void {
  html.classList.remove("gsap-pending");
  html.classList.add("gsap-ready");
  if (forceAll || shouldSkipHeavyMotion()) {
    html.classList.add("gsap-force-show");
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

    const html = document.documentElement;
    const skipHeavy = shouldSkipHeavyMotion();
    ensureContentVisible(html, skipHeavy);
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    void tryShowAllRevealTargets({ preserveCaseSteps: true });
    void tryResetPageTransition();

    const finish = () => {
      if (cancelled) return;
      bootCompleted = true;
      ensureContentVisible(html, skipHeavy);
      settleIfHash();
    };

    const run = async () => {
      if (skipHeavy) {
        finish();
        return;
      }

      try {
        if (!bootCompleted) {
          await waitForIdle(400);
          if (cancelled) return;
        }

        const { initAnimations } = await import("@/animations");
        if (cancelled) return;

        cleanup = initAnimations(pathname);
        finish();
        void import("@/animations/page-transition");
      } catch {
        if (cancelled) return;
        finish();
        void tryShowAllRevealTargets();
      }
    };

    void run();

    return () => {
      cancelled = true;
      cleanup?.();
      ensureContentVisible(html, shouldSkipHeavyMotion());
      void tryShowAllRevealTargets();
      void tryResetPageTransition();
    };
  }, [pathname]);

  return <>{children}</>;
}

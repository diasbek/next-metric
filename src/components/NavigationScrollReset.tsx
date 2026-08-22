"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  scrollToHashAfterPaint,
  settleScrollAfterNavigation,
} from "@/utils/scroll";

/**
 * Keeps client navigations pinned to the top (or a hash target).
 * Runs only on pathname changes — not on first mount (browser handles initial scroll).
 */
export function NavigationScrollReset() {
  const pathname = usePathname();
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      const hash = window.location.hash.replace(/^#/, "").split("#")[0]?.trim();
      if (hash) {
        scrollToHashAfterPaint(hash);
      }
      return;
    }

    settleScrollAfterNavigation();
  }, [pathname]);

  return null;
}

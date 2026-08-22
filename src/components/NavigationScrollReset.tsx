"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { settleScrollAfterNavigation } from "@/utils/scroll";

/**
 * Keeps client navigations pinned to the top (or a hash target).
 * GSAP page transitions used to call settleScrollAfterNavigation; without
 * them we need an explicit pathname listener so Next.js / the browser cannot
 * restore the previous page's scroll offset.
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
      settleScrollAfterNavigation();
      return;
    }

    settleScrollAfterNavigation();
  }, [pathname]);

  return null;
}

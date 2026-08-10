"use client";

import { useEffect, useState } from "react";
import { ADMIN_MD_BREAKPOINT } from "@/components/admin/chrome/nav";

/** True when viewport is ≥ admin md breakpoint (768). */
export function useAdminDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${ADMIN_MD_BREAKPOINT}px)`);
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return isDesktop;
}

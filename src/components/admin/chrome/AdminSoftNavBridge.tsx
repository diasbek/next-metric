"use client";

import { useEffect, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { registerAdminSoftNav } from "@/components/admin/chrome/nav";

/** Registers soft App-router navigation for HardNavForm and chrome helpers. */
export function AdminSoftNavBridge({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    return registerAdminSoftNav((href) => {
      const next = new URL(href, window.location.origin);
      const cur = new URL(window.location.href);
      const target = `${next.pathname}${next.search}${next.hash}`;
      startTransition(() => {
        if (next.pathname === cur.pathname && next.search === cur.search) {
          router.refresh();
          return;
        }
        if (next.pathname === cur.pathname) {
          router.replace(target);
          return;
        }
        router.push(target);
      });
    });
  }, [router, startTransition]);

  return children;
}

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { registerAdminSoftNav } from "@/components/admin/chrome/nav";

/** Registers softApp-router navigation for HardNavForm and chrome helpers. */
export function AdminSoftNavBridge({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    return registerAdminSoftNav((href) => {
      router.push(href);
    });
  }, [router]);

  return children;
}

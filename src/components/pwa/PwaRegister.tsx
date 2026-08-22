"use client";

import { useEffect } from "react";
import { isDesktopInstallContext } from "@/utils/webview";

/** Registers the installability service worker (desktop Chrome / Edge only). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    if (!isDesktopInstallContext()) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        if (regs.length === 0) return;
        regs.forEach((reg) => {
          void reg.unregister();
        });
      });
      return;
    }

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          void registration.update();
        })
        .catch(() => {
          /* ignore */
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}

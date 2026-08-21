"use client";

import { useEffect } from "react";
import { isRestrictedWebView } from "@/utils/webview";

/** Registers the installability service worker (Chrome / Edge / Android). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    // Telegram / IG in-app browsers + SW = blank pages more often than not.
    if (isRestrictedWebView()) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
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
          /* ignore — install still works on desktop without SW in modern Chrome */
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}

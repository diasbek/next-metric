"use client";

import { useEffect } from "react";
import { isRestrictedWebView } from "@/utils/webview";

/** Registers the installability service worker (desktop Chrome / Edge / Android). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const ua = navigator.userAgent || "";

    // In-app browsers and phones never get a controlling SW — it blanked Telegram.
    if (isRestrictedWebView() || /Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => {
          void reg.unregister();
        });
      });
      if ("caches" in window) {
        void caches.keys().then((keys) => {
          keys.forEach((key) => {
            void caches.delete(key);
          });
        });
      }
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

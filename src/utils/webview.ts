/** Device / in-app browser helpers — keep boot script in sync with these checks. */

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    ua,
  );
}

export function isRestrictedWebView(): boolean {
  if (typeof window === "undefined") return false;

  const html = document.documentElement;
  if (html.classList.contains("restricted-webview")) return true;

  const ua = navigator.userAgent || "";
  if (/Telegram|TelegramBot/i.test(ua)) return true;
  if (/Instagram|FBAN|FBAV|FBIOS|Line\//i.test(ua)) return true;
  if (/; wv\)|\bWebView\b/i.test(ua)) return true;

  const ref = document.referrer || "";
  if (/t\.me|telegram\.(me|org|dog)/i.test(ref)) return true;

  const w = window as Window & {
    TelegramWebviewProxy?: unknown;
    Telegram?: { WebView?: unknown; WebApp?: unknown };
  };
  if (w.TelegramWebviewProxy || w.Telegram?.WebView || w.Telegram?.WebApp) {
    return true;
  }

  return false;
}

/** Desktop with fine pointer — only environment where we register the PWA SW. */
export function isDesktopInstallContext(): boolean {
  if (typeof window === "undefined") return false;
  if (isMobileDevice() || isRestrictedWebView()) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** No-op — kept so layout can omit critical CSS without a larger refactor. */
export const WEBVIEW_BOOT_CRITICAL_CSS = "";

/**
 * Runs synchronously in <head> before paint — self-contained, no imports.
 * Clears stale service workers on phones and in-app browsers.
 */
export const WEBVIEW_BOOT_SCRIPT = `
(function(){
  try {
    var ua = navigator.userAgent || "";
    var ref = document.referrer || "";
    var isMobile = /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var restricted =
      /Telegram|TelegramBot|Instagram|FBAN|FBAV|FBIOS|Line\\//i.test(ua) ||
      /; wv\\)|\\bWebView\\b/i.test(ua) ||
      /t\\.me|telegram\\.(me|org|dog)/i.test(ref) ||
      !!(window.TelegramWebviewProxy || (window.Telegram && (window.Telegram.WebView || window.Telegram.WebApp)));

    if (restricted) {
      document.documentElement.classList.add("restricted-webview");
    }

    if (isMobile || restricted || (navigator.serviceWorker && navigator.serviceWorker.controller)) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(regs) {
          regs.forEach(function(r) { r.unregister(); });
        }).catch(function(){});
      }
      if ("caches" in window) {
        caches.keys().then(function(keys) {
          keys.forEach(function(k) { caches.delete(k); });
        }).catch(function(){});
      }
    }
  } catch (e) {}
})();
`.trim();

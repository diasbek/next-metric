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

/**
 * Critical CSS — must win over any cached GSAP motion stylesheet that hid
 * `[data-reveal]` while waiting on JavaScript. Inlined in <head> before paint.
 */
export const WEBVIEW_BOOT_CRITICAL_CSS = `
html [data-reveal],
html [data-reveal-group] > *,
html [data-case-steps] > *,
html [data-split-title],
html [data-border-draw],
html [data-counter],
html .metric-hero__subtitle,
html .metric-hero__copy .metric-cta,
html .metric-hero__trust > *,
html [data-page-transition-root],
html.gsap-pending [data-reveal],
html.gsap-pending [data-reveal-group] > *,
html.gsap-pending [data-case-steps] > *,
html.gsap-pending [data-split-title],
html.gsap-pending [data-border-draw],
html.gsap-pending [data-counter],
html.gsap-pending .metric-hero__subtitle,
html.gsap-pending .metric-hero__copy .metric-cta,
html.gsap-pending .metric-hero__trust > *,
html.gsap-pending [data-page-transition-root] {
  visibility: visible !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}
`.trim();

/**
 * Runs synchronously in <head> before paint — self-contained, no imports.
 * Clears stale GSAP gates and service workers on phones / in-app browsers.
 */
export const WEBVIEW_BOOT_SCRIPT = `
(function(){
  try {
    var h = document.documentElement;
    h.classList.remove("gsap-pending");
    h.classList.add("content-visible");

    var ua = navigator.userAgent || "";
    var ref = document.referrer || "";
    var isMobile = /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var restricted =
      /Telegram|TelegramBot|Instagram|FBAN|FBAV|FBIOS|Line\\//i.test(ua) ||
      /; wv\\)|\\bWebView\\b/i.test(ua) ||
      /t\\.me|telegram\\.(me|org|dog)/i.test(ref) ||
      !!(window.TelegramWebviewProxy || (window.Telegram && (window.Telegram.WebView || window.Telegram.WebApp)));

    if (restricted) {
      h.classList.add("restricted-webview");
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

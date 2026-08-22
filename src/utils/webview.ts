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

/** Skip GSAP chunk + page transitions — phones and in-app browsers. */
export function shouldSkipHeavyMotion(): boolean {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  return isMobileDevice() || isRestrictedWebView();
}

/** Desktop with fine pointer — only environment where we register the PWA SW. */
export function isDesktopInstallContext(): boolean {
  if (typeof window === "undefined") return false;
  if (isMobileDevice() || isRestrictedWebView()) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Critical CSS — content must be visible before the main stylesheet loads. */
export const WEBVIEW_BOOT_CRITICAL_CSS = `
html.gsap-ready [data-page-transition-root],
html.gsap-ready .metric-hero__copy,
html.gsap-ready .metric-hero__visual,
html.gsap-ready .metric-hero__trust {
  visibility: visible;
  opacity: 1;
}
html.gsap-force-show [data-reveal],
html.gsap-force-show [data-reveal-group] > *,
html.gsap-force-show [data-case-steps] > *,
html.gsap-force-show [data-split-title],
html.gsap-force-show [data-border-draw],
html.gsap-force-show [data-counter],
html.gsap-force-show .metric-hero__copy,
html.gsap-force-show .metric-hero__visual,
html.gsap-force-show .metric-hero__trust,
html.gsap-force-show .metric-hero__subtitle,
html.gsap-force-show .metric-hero__copy .metric-cta,
html.gsap-force-show .metric-hero__trust > *,
html.gsap-force-show [data-page-transition-root],
html.restricted-webview [data-reveal],
html.restricted-webview [data-reveal-group] > *,
html.restricted-webview [data-case-steps] > *,
html.restricted-webview [data-split-title],
html.restricted-webview [data-border-draw],
html.restricted-webview [data-counter],
html.restricted-webview .metric-hero__copy,
html.restricted-webview .metric-hero__visual,
html.restricted-webview .metric-hero__trust,
html.restricted-webview .metric-hero__subtitle,
html.restricted-webview .metric-hero__copy .metric-cta,
html.restricted-webview .metric-hero__trust > *,
html.restricted-webview [data-page-transition-root] {
  visibility: visible !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}
`.trim();

/**
 * Runs synchronously in <head> before paint — self-contained, no imports.
 * Content is always readable; GSAP is progressive enhancement on desktop only.
 */
export const WEBVIEW_BOOT_SCRIPT = `
(function(){
  try {
    var h = document.documentElement;
    var ua = navigator.userAgent || "";
    var ref = document.referrer || "";
    var isMobile = /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    var restricted =
      /Telegram|TelegramBot|Instagram|FBAN|FBAV|FBIOS|Line\\//i.test(ua) ||
      /; wv\\)|\\bWebView\\b/i.test(ua) ||
      /t\\.me|telegram\\.(me|org|dog)/i.test(ref) ||
      !!(window.TelegramWebviewProxy || (window.Telegram && (window.Telegram.WebView || window.Telegram.WebApp)));

    h.classList.remove("gsap-pending");
    h.classList.add("gsap-ready");
    if (isMobile || restricted) {
      h.classList.add("gsap-force-show");
      if (restricted) h.classList.add("restricted-webview");
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

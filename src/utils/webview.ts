/** In-app browsers (Telegram etc.) often break SW + delayed GSAP gates. */

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua);
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

/** Critical CSS — must run before the main stylesheet for first paint in WebViews. */
export const WEBVIEW_BOOT_CRITICAL_CSS = `
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
html.gsap-ready [data-reveal],
html.gsap-ready [data-reveal-group] > *,
html.gsap-ready [data-case-steps] > *,
html.gsap-ready .metric-hero__subtitle,
html.gsap-ready .metric-hero__copy .metric-cta,
html.gsap-ready .metric-hero__trust > *,
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
html.restricted-webview [data-page-transition-root],
html.gsap-force-show [data-page-transition-root],
html.gsap-ready [data-page-transition-root] {
  visibility: visible !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}
`.trim();

/**
 * Runs synchronously in <head> before paint — must stay self-contained (no imports).
 * Keep in sync with isRestrictedWebView() / isIOS().
 */
export const WEBVIEW_BOOT_SCRIPT = `
(function(){
  try {
    var h = document.documentElement;
    var ua = navigator.userAgent || "";
    var ref = document.referrer || "";
    var isIOS = /iPhone|iPad|iPod/i.test(ua);
    var restricted =
      /Telegram|TelegramBot|Instagram|FBAN|FBAV|FBIOS|Line\\//i.test(ua) ||
      /; wv\\)|\\bWebView\\b/i.test(ua) ||
      /t\\.me|telegram\\.(me|org|dog)/i.test(ref) ||
      !!(window.TelegramWebviewProxy || (window.Telegram && (window.Telegram.WebView || window.Telegram.WebApp)));
    var reduced = false;
    try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

    function forceShow(markRestricted) {
      h.classList.remove("gsap-pending");
      h.classList.add("gsap-force-show", "gsap-ready");
      if (markRestricted) h.classList.add("restricted-webview");
    }

    function purgeSw() {
      if (!("serviceWorker" in navigator)) return;
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        regs.forEach(function(r) { r.unregister(); });
      }).catch(function() {});
    }

    function purgeCaches() {
      if (!("caches" in window)) return;
      caches.keys().then(function(keys) {
        keys.forEach(function(k) { caches.delete(k); });
      }).catch(function() {});
    }

    // iOS Telegram uses a Safari-identical UA — always show content on first paint.
    if (isIOS || restricted) {
      forceShow(restricted);
      purgeSw();
      purgeCaches();
      return;
    }

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      forceShow(false);
      purgeSw();
      purgeCaches();
      return;
    }

    if (reduced) {
      h.classList.remove("gsap-pending");
      return;
    }

    setTimeout(function() {
      if (h.classList.contains("gsap-ready") || h.classList.contains("gsap-force-show")) return;
      h.classList.add("gsap-force-show", "gsap-ready");
      h.classList.remove("gsap-pending");
    }, 400);
  } catch (e) {}
})();
`.trim();

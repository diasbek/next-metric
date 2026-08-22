/**
 * Critical CSS inlined in <head> before paint.
 * Must win over any cached GSAP motion.css that hid sections until JS ran.
 */
export const CONTENT_VISIBILITY_CRITICAL_CSS = `
html,
html body,
html #site-content,
html #main-content,
html [data-page-transition-root],
html .metric-hero,
html .metric-section,
html .metric-services,
html .metric-case-studies,
html .metric-case,
html .metric-works,
html .metric-faq,
html .metric-categories,
html .metric-workflow,
html [data-reveal],
html [data-reveal-group] > *,
html [data-case-steps] > *,
html [data-split-title],
html [data-border-draw],
html [data-counter],
html .metric-hero__subtitle,
html .metric-hero__copy,
html .metric-hero__visual,
html .metric-hero__copy .metric-cta,
html .metric-hero__trust,
html .metric-hero__trust > *,
html.gsap-pending,
html.gsap-pending body,
html.gsap-pending #site-content,
html.gsap-pending #main-content,
html.gsap-pending [data-page-transition-root],
html.gsap-pending [data-reveal],
html.gsap-pending [data-reveal-group] > *,
html.gsap-pending [data-case-steps] > *,
html.gsap-pending [data-split-title],
html.gsap-pending [data-border-draw],
html.gsap-pending [data-counter],
html.gsap-pending .metric-hero__subtitle,
html.gsap-pending .metric-hero__copy,
html.gsap-pending .metric-hero__visual,
html.gsap-pending .metric-hero__copy .metric-cta,
html.gsap-pending .metric-hero__trust,
html.gsap-pending .metric-hero__trust > * {
  visibility: visible !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}

html .media-image.is-loaded .media-image__skeleton {
  opacity: 0 !important;
  visibility: hidden !important;
}

html .mobile-menu-panel:not([data-open="true"]) {
  display: none !important;
}
`.trim();

/** Legacy export — keep name used by layout.tsx. */
export const WEBVIEW_BOOT_CRITICAL_CSS = CONTENT_VISIBILITY_CRITICAL_CSS;

/**
 * Runs synchronously in <head> before paint — self-contained, no imports.
 * Clears stale GSAP gates and service workers on phones / in-app browsers.
 */
export const WEBVIEW_BOOT_SCRIPT = `
(function(){
  function unlock() {
    var h = document.documentElement;
    h.classList.remove("gsap-pending");
    h.classList.add("content-visible", "gsap-ready", "gsap-force-show");
  }

  try {
    unlock();

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

    document.addEventListener("DOMContentLoaded", unlock, { once: true });
    window.addEventListener("pageshow", unlock);
  } catch (e) {}
})();
`.trim();

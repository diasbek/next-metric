/**
 * Critical CSS inlined in <head> before paint.
 * Fail-open for stale cached bundles that hid sections until JS ran.
 */
export const CONTENT_VISIBILITY_CRITICAL_CSS = `
html #site-content,
html #main-content,
html .metric-hero,
html .metric-section,
html .metric-services,
html .metric-case-studies,
html .metric-case,
html .metric-works,
html .metric-faq,
html .metric-categories,
html .metric-workflow {
  visibility: visible !important;
  opacity: 1 !important;
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
 * Tags restricted in-app browsers; no DOM surgery on streaming shells.
 */
export const WEBVIEW_BOOT_SCRIPT = `
(function(){
  try {
    var ua = navigator.userAgent || "";
    var ref = document.referrer || "";
    var restricted =
      /Telegram|TelegramBot|Instagram|FBAN|FBAV|FBIOS|Line\\\\//i.test(ua) ||
      /; wv\\\\)|\\\\bWebView\\\\b/i.test(ua) ||
      /t\\\\.me|telegram\\\\.(me|org|dog)/i.test(ref) ||
      !!(window.TelegramWebviewProxy || (window.Telegram && (window.Telegram.WebView || window.Telegram.WebApp)));

    if (restricted) {
      document.documentElement.classList.add("restricted-webview");
    }
  } catch (e) {}
})();
`.trim();

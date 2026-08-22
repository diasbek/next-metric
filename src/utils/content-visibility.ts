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

html div[id^="S:"]:has(#site-content) {
  display: none !important;
}
`.trim();

/** Legacy export — keep name used by layout.tsx. */
export const WEBVIEW_BOOT_CRITICAL_CSS = CONTENT_VISIBILITY_CRITICAL_CSS;

/**
 * Runs synchronously in <head> before paint — self-contained, no imports.
 * Removes React streaming shell duplicates that replay #site-content.
 */
export const WEBVIEW_BOOT_SCRIPT = `
(function(){
  function removeStreamingShellDuplicates() {
    var shells = document.querySelectorAll('div[id^="S:"]');
    for (var i = 0; i < shells.length; i++) {
      var shell = shells[i];
      if (shell.querySelector("#site-content")) {
        shell.remove();
      }
    }
  }

  try {
    removeStreamingShellDuplicates();

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

    document.addEventListener("DOMContentLoaded", removeStreamingShellDuplicates, { once: true });
    window.addEventListener("pageshow", removeStreamingShellDuplicates);
  } catch (e) {}
})();
`.trim();

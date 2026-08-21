/** In-app browsers (Telegram etc.) often break SW + delayed GSAP gates. */

export function isRestrictedWebView(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Telegram/i.test(ua)) return true;
  if (/Instagram|FBAN|FBAV|FBIOS|Line\//i.test(ua)) return true;
  const w = window as Window & {
    TelegramWebviewProxy?: unknown;
    Telegram?: { WebView?: unknown };
  };
  return Boolean(w.TelegramWebviewProxy || w.Telegram?.WebView);
}

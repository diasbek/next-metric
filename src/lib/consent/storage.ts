import type { ConsentDecision } from "./types";

/** Bump when consent categories or their meaning change materially. */
export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "metric_cookie_consent";
export const CONSENT_EVENT = "metric:consent-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Pass `raw` to parse an already-read value (e.g. from useSyncExternalStore)
 * instead of reading localStorage again. */
export function readConsent(raw?: string | null): ConsentDecision | null {
  const source = raw !== undefined ? raw : isBrowser() ? window.localStorage.getItem(CONSENT_STORAGE_KEY) : null;
  if (!source) return null;
  try {
    const parsed = JSON.parse(source) as Partial<ConsentDecision>;
    if (
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.version !== "number" ||
      typeof parsed.decidedAt !== "number"
    ) {
      return null;
    }
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed as ConsentDecision;
  } catch {
    return null;
  }
}

export function writeConsent(analytics: boolean): ConsentDecision {
  const decision: ConsentDecision = {
    analytics,
    version: CONSENT_VERSION,
    decidedAt: Date.now(),
  };
  if (isBrowser()) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(decision));
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: decision }));
    } catch {
      // localStorage unavailable (private mode / disabled) — consent simply
      // won't persist across reloads, analytics stays blocked by default.
    }
  }
  return decision;
}

export function clearConsent(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
  } catch {
    // ignore
  }
}

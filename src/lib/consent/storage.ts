import type { ConsentChoice, ConsentDecision } from "./types";

export const CONSENT_VERSION = 1;
export const CONSENT_STORAGE_KEY = "metric_cookie_consent";
export const CONSENT_EVENT = "metric:consent-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function parseChoice(value: unknown): ConsentChoice | null {
  if (value === "accepted" || value === "necessary") return value;
  if (value === true) return "accepted";
  if (value === false) return "necessary";
  return null;
}

/** Pass `raw` to parse an already-read value (e.g. from useSyncExternalStore). */
export function readConsent(raw?: string | null): ConsentDecision | null {
  const source =
    raw !== undefined
      ? raw
      : isBrowser()
        ? window.localStorage.getItem(CONSENT_STORAGE_KEY)
        : null;
  if (!source) return null;
  try {
    const parsed = JSON.parse(source) as Partial<ConsentDecision> & {
      analytics?: boolean;
    };
    const choice = parseChoice(parsed.choice ?? parsed.analytics);
    const decidedAt =
      typeof parsed.decidedAt === "number" ? parsed.decidedAt : Number.NaN;
    if (!choice || !Number.isFinite(decidedAt)) return null;
    return { choice, version: CONSENT_VERSION, decidedAt };
  } catch {
    return null;
  }
}

export function writeConsent(choice: ConsentChoice): ConsentDecision {
  const decision: ConsentDecision = {
    choice,
    version: CONSENT_VERSION,
    decidedAt: Date.now(),
  };
  if (isBrowser()) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(decision));
      window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: decision }));
    } catch {
      /* private mode — banner may reappear on reload */
    }
  }
  return decision;
}

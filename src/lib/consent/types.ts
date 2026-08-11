/**
 * Consent categories. "necessary" is implicit and always on (session/auth
 * cookies required for the site to function) — only opt-in categories are
 * modeled explicitly here.
 */
export type ConsentCategory = "analytics";

export type ConsentDecision = {
  analytics: boolean;
  /** Bumped when the categories/copy change materially, forcing re-consent. */
  version: number;
  /** Epoch ms when the choice was recorded. */
  decidedAt: number;
};

export type ConsentStatus = "pending" | "resolved";

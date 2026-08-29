"use client";

declare global {
  interface Window {
    lintrk?: (action: string, payload?: { conversion_id: number }) => void;
  }
}

/** Metric LinkedIn Insight conversion — lead / brief thank-you. */
export const LINKEDIN_LEAD_CONVERSION_ID = 30327393;

/**
 * Fire LinkedIn conversion only after a successful lead submit
 * (when the thank-you UI is shown) — never on raw Submit click.
 */
export function trackLinkedInLeadConversion(): void {
  if (typeof window === "undefined") return;
  try {
    window.lintrk?.("track", { conversion_id: LINKEDIN_LEAD_CONVERSION_ID });
  } catch {
    // Insight Tag may be blocked; never break the thank-you flow.
  }
}

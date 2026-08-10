/**
 * Webmaster / Search Console fields often get pasted as a full
 * `<meta name="…" content="TOKEN" />` snippet. Layout metadata expects
 * only the content token.
 */
export function parseSiteVerificationToken(raw: string | null | undefined): string {
  const input = String(raw ?? "").trim();
  if (!input) return "";

  const contentMatch = input.match(
    /content\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s/>]+))/i,
  );
  if (contentMatch) {
    return (contentMatch[1] || contentMatch[2] || contentMatch[3] || "").trim();
  }

  // Bare token (no HTML). Reject leftover markup.
  if (/[<>]/.test(input)) return "";
  return input.replace(/^["']|["']$/g, "").trim();
}

/** Digits-only Metrika counter id (strips pasted snippets / spaces). */
export function parseYandexMetrikaId(raw: string | null | undefined): string {
  const input = String(raw ?? "").trim();
  if (!input) return "";

  const fromYm = input.match(/ym\(\s*(\d{5,})/i);
  if (fromYm?.[1]) return fromYm[1];

  const fromIdParam = input.match(/[?&]id=(\d{5,})/i);
  if (fromIdParam?.[1]) return fromIdParam[1];

  const digits = input.match(/\d{5,}/);
  return digits?.[0] ?? "";
}

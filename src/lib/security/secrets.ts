import { timingSafeEqual } from "node:crypto";

/** Constant-time string compare (length-aware). */
export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    // Still do a compare to reduce timing skew on length leaks for short secrets
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

/**
 * For settings forms: keep the existing secret when the field is left blank
 * or left as the UI placeholder mask.
 */
export function resolveSecretUpdate(
  incoming: string,
  current: string | null | undefined,
  mask = "••••••••",
): string {
  const value = incoming.trim();
  if (!value || value === mask || /^\u2022+$/.test(value) || /^•+$/.test(value)) {
    return current ?? "";
  }
  return value;
}

export function secretIsConfigured(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

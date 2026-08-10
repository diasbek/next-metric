export function getPublicEnv(key: string, fallback = ""): string {
  const value = process.env[key];
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

/** First non-empty env value from the given keys. */
export function getEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = getPublicEnv(key);
    if (value) return value;
  }
  return "";
}

export function requireEnv(...keys: string[]): string {
  const value = getEnv(...keys);
  if (!value) {
    throw new Error(
      `Missing required environment variable. Set one of: ${keys.join(", ")}`,
    );
  }
  return value;
}

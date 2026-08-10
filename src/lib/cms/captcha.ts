import type { DbSiteSettings } from "@/lib/cms/types";

export async function verifyCaptcha(options: {
  settings: DbSiteSettings | null;
  token?: string | null;
  honeypot?: string | null;
  remoteIp?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const provider = options.settings?.captcha_provider ?? "none";

  if (provider === "none") {
    return { ok: true };
  }

  if (provider === "honeypot") {
    if (options.honeypot && options.honeypot.trim().length > 0) {
      return { ok: false, error: "Spam detected" };
    }
    return { ok: true };
  }

  const secret = options.settings?.captcha_secret_key?.trim() ?? "";
  const token = String(options.token ?? "").trim();
  if (!secret) {
    return { ok: false, error: "Captcha is misconfigured" };
  }
  if (!token) {
    return { ok: false, error: "Captcha token is required" };
  }

  if (provider === "turnstile") {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: options.remoteIp || undefined,
        }),
      },
    );
    const data = (await response.json()) as { success?: boolean };
    return data.success
      ? { ok: true }
      : { ok: false, error: "Captcha verification failed" };
  }

  if (provider === "hcaptcha") {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (options.remoteIp) body.set("remoteip", options.remoteIp);

    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await response.json()) as { success?: boolean };
    return data.success
      ? { ok: true }
      : { ok: false, error: "Captcha verification failed" };
  }

  return { ok: true };
}

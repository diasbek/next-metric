/**
 * Structured results for admin Server Actions.
 * Prefer returning these over throwing — clients toast + soft-navigate safely.
 */

export type AdminRedirect = {
  ok: true;
  redirectTo: string;
  message?: string;
};

export type AdminSuccess = {
  ok: true;
  message?: string;
  redirectTo?: undefined;
};

export type AdminFailure = {
  ok: false;
  error: string;
  fieldErrors?: Record<string, string>;
};

export type AdminActionResult = AdminRedirect | AdminSuccess | AdminFailure;

export function adminRedirect(
  path: string,
  message = "Сохранено",
): AdminRedirect {
  return { ok: true, redirectTo: path, message };
}

export function adminOk(message = "Готово"): AdminSuccess {
  return { ok: true, message };
}

export function adminFail(
  error: string,
  fieldErrors?: Record<string, string>,
): AdminFailure {
  return { ok: false, error, fieldErrors };
}

export function isAdminRedirect(value: unknown): value is AdminRedirect {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as AdminRedirect).ok === true &&
    typeof (value as AdminRedirect).redirectTo === "string" &&
    (value as AdminRedirect).redirectTo.startsWith("/")
  );
}

export function isAdminFailure(value: unknown): value is AdminFailure {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as AdminFailure).ok === false &&
    typeof (value as AdminFailure).error === "string"
  );
}

export function isAdminSuccess(value: unknown): value is AdminSuccess | AdminRedirect {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { ok?: unknown }).ok === true
  );
}

/** Wrap mutation body: never throw to the client (except Next.js redirects). */
export async function runAdminAction(
  fn: () => Promise<AdminActionResult>,
): Promise<AdminActionResult> {
  try {
    return await fn();
  } catch (err) {
    if (isNextRedirectError(err)) throw err;
    const message =
      err instanceof Error && err.message.trim()
        ? err.message
        : "Не удалось выполнить действие. Попробуйте ещё раз.";
    console.error("[admin action]", err);
    return adminFail(message);
  }
}

function isNextRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    String((err as { digest?: unknown }).digest).includes("NEXT_REDIRECT")
  );
}

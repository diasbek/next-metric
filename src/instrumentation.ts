import type { Instrumentation } from "next";

function describe(value: unknown): string {
  if (value instanceof Error) {
    const digest = "digest" in value ? ` digest=${String(value.digest)}` : "";
    return `${value.name}: ${value.message}${digest}`;
  }
  return String(value);
}

function chain(error: unknown): string[] {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    parts.push(describe(current));
    current = current instanceof Error ? current.cause : undefined;
  }
  return parts;
}

/**
 * Production masks Server Component errors, and the Hostinger log viewer keeps
 * only the first line of each entry — so flatten cause chain and stack into one.
 */
export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const stack =
    error instanceof Error && error.stack
      ? error.stack.split("\n").slice(0, 12).join(" | ")
      : "";

  console.error(
    `[request-error] ${request.method} ${request.path} ` +
      `route=${context.routePath} type=${context.routeType} ` +
      `source=${context.renderSource} :: ${chain(error).join(" <- ")} :: ${stack}`,
  );
};

import { describe, expect, it } from "vitest";
import { enAdmin } from "@/i18n/admin/messages/en";
import { deAdmin } from "@/i18n/admin/messages/de";

const REQUIRED = [
  "nav.overview",
  "nav.works",
  "nav.leads",
  "nav.users",
  "dashboard.title",
  "auth.loginTitle",
  "leads.title",
  "users.title",
] as const;

function get(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

describe("admin DE i18n", () => {
  it("translates required admin keys away from English duplicates", () => {
    for (const path of REQUIRED) {
      const enVal = get(enAdmin, path);
      const deVal = get(deAdmin, path);
      expect(typeof enVal, path).toBe("string");
      expect(typeof deVal, path).toBe("string");
      expect(deVal, path).not.toBe(enVal);
    }
  });
});

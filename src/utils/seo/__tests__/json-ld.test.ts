import { describe, expect, it } from "vitest";
import { getProjectListSchema } from "../json-ld";

describe("getProjectListSchema", () => {
  it("uses localized default list names without Russian fallback", () => {
    const en = getProjectListSchema([], "en");
    const de = getProjectListSchema([], "de");
    expect(en.name).toBe("METRIC projects");
    expect(de.name).toBe("METRIC Projekte");
    expect(String(en.name)).not.toMatch(/[А-Яа-яЁё]/);
  });
});

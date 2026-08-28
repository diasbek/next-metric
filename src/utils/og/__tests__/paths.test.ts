import { describe, expect, it } from "vitest";
import { isGeneratedOgUrl, OG_GENERATED_FILENAME } from "../paths";

describe("isGeneratedOgUrl", () => {
  it("detects generated OG storage paths", () => {
    expect(
      isGeneratedOgUrl(
        `https://cdn.example/metric-media/projects/x/og/${OG_GENERATED_FILENAME}`,
      ),
    ).toBe(true);
    expect(isGeneratedOgUrl("/images/cover.jpg")).toBe(false);
  });
});

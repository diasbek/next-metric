import { describe, expect, it } from "vitest";
import {
  getDefaultOgImagePath,
  getPageOgImagePath,
  getStaticPageOgImagePath,
  isGeneratedOgUrl,
  OG_GENERATED_FILENAME,
} from "../paths";

describe("og paths", () => {
  it("uses static PNGs for public page metadata", () => {
    expect(getPageOgImagePath("en", "home")).toBe("/images/og/en-home.png");
    expect(getStaticPageOgImagePath("de", "works")).toBe(
      "/images/og/de-works.png",
    );
    expect(getDefaultOgImagePath()).toBe("/images/og/default.png");
  });

  it("detects generated OG storage paths", () => {
    expect(
      isGeneratedOgUrl(
        `https://cdn.example/metric-media/projects/x/og/${OG_GENERATED_FILENAME}`,
      ),
    ).toBe(true);
    expect(isGeneratedOgUrl("/images/cover.jpg")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { getCanonicalRedirectUrl } from "../canonical-request";

describe("getCanonicalRedirectUrl", () => {
  it("keeps marketing pages redirected to homepage anchors", () => {
    expect(
      getCanonicalRedirectUrl({
        hostname: "metric.graphics",
        port: "",
        pathname: "/services/",
        search: "",
        protocol: "https",
      }),
    ).toBe("https://metric.graphics/#services");

    expect(
      getCanonicalRedirectUrl({
        hostname: "metric.graphics",
        port: "",
        pathname: "/agency/",
        search: "",
        protocol: "https",
      }),
    ).toBe("https://metric.graphics/#workflow");

    expect(
      getCanonicalRedirectUrl({
        hostname: "metric.graphics",
        port: "",
        pathname: "/contacts/",
        search: "",
        protocol: "https",
      }),
    ).toBe("https://metric.graphics/?brief=1");
  });

  it("does not redirect imprint", () => {
    expect(
      getCanonicalRedirectUrl({
        hostname: "metric.graphics",
        port: "",
        pathname: "/imprint/",
        search: "",
        protocol: "https",
      }),
    ).toBeNull();
  });
});

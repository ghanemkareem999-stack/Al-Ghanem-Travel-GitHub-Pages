import { describe, expect, it } from "vitest";
import { canLoadMarketingScripts, hasConfiguredMarketing, normalizeMarketingIds } from "./marketing";

describe("marketing configuration", () => {
  it("normalizes optional tracking identifiers without enabling empty values", () => {
    const ids = normalizeMarketingIds({ ga4: "  G-ABC123  ", gtm: "", metaPixel: undefined });
    expect(ids).toEqual({ ga4: "G-ABC123", gtm: "", metaPixel: "" });
    expect(hasConfiguredMarketing(ids)).toBe(true);
    expect(hasConfiguredMarketing(normalizeMarketingIds({}))).toBe(false);
  });

  it("allows tracking only after explicit accepted consent and configured identifiers", () => {
    const ids = normalizeMarketingIds({ ga4: "G-ABC123", gtm: "GTM-ABC123", metaPixel: "123" });
    expect(canLoadMarketingScripts(null, ids)).toBe(false);
    expect(canLoadMarketingScripts("declined", ids)).toBe(false);
    expect(canLoadMarketingScripts("accepted", ids)).toBe(true);
    expect(canLoadMarketingScripts("accepted", normalizeMarketingIds({}))).toBe(false);
  });
});

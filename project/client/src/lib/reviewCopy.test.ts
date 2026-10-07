import { describe, expect, it } from "vitest";
import { locales } from "./i18n";
import { reviewCopy } from "./reviewCopy";

describe("review page localization", () => {
  it("provides the key trust, consent, and submission messages in every supported language", () => {
    locales.forEach(locale => {
      const copy = reviewCopy[locale];
      expect(copy.title).toBeTruthy();
      expect(copy.trust).toBeTruthy();
      expect(copy.experienceConfirmed).toBeTruthy();
      expect(copy.publishConsent).toBeTruthy();
      expect(copy.success).toBeTruthy();
      expect(copy.error).toBeTruthy();
    });
  });

  it("uses the requested Arabic public-review section title", () => {
    expect(reviewCopy.ar.approvedTitle).toBe("آراء الشركات وعملائنا");
  });
});

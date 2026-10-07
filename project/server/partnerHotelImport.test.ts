import { describe, expect, it } from "vitest";
import { partnerHotelImportSchema } from "./partnerHotelImport";

const baseImport = {
  city: { slug: "madinah", launchStatus: "active" as const },
  hotel: { slug: "verified-partner-hotel", category: "premium" as const, corporateReady: true, portfolioStatus: "verified" as const },
  translations: [{ locale: "en" as const, name: "Verified Partner Hotel", shortDescription: "A verified property description for testing validation.", longDescription: "A sufficiently long verified partner hotel narrative used to confirm that the controlled ingestion route accepts a complete, reviewable record.", address: "Central Area, Madinah Al Munawwarah, Saudi Arabia" }],
};

describe("verified partner hotel import", () => {
  it("accepts a complete verified import that includes English content", () => {
    expect(partnerHotelImportSchema.safeParse(baseImport).success).toBe(true);
  });

  it("rejects a verified import without an English translation", () => {
    const withoutEnglish = { ...baseImport, translations: [{ ...baseImport.translations[0], locale: "ar" as const }] };
    expect(partnerHotelImportSchema.safeParse(withoutEnglish).success).toBe(false);
  });
});

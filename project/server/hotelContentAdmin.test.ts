import { describe, expect, it } from "vitest";
import { hotelAuthorizedImageInput, hotelContentDraftInput, hotelContentRemoveInput, isPublicPortfolioStatus } from "./hotelContentAdmin";

const draft = {
  city: { slug: "madinah", launchStatus: "active" as const },
  hotel: { slug: "example-madinah", category: "executive" as const, sourceStatus: "official" as const, portfolioStatus: "draft" as const, accessMode: "walkable" as const },
  translations: [{ locale: "en" as const, name: "Example Madinah", shortDescription: "A concise verified accommodation description for controlled administration.", longDescription: "A longer controlled accommodation description with sufficient detail for the administrator-only hotel content workflow.", address: "Madinah Al Munawwarah, Saudi Arabia" }],
  editorialNote: "Official property page to be checked before publishing.",
};

describe("hotel content administration validation", () => {
  it("requires coordinates to be supplied together and a named gate to have a review date", () => {
    expect(hotelContentDraftInput.safeParse({ ...draft, hotel: { ...draft.hotel, latitude: 24.5 } }).success).toBe(false);
    expect(hotelContentDraftInput.safeParse({ ...draft, hotel: { ...draft.hotel, nearestGateName: "Al Salam Gate", nearestGateAddress: "Al Salam Gate, Madinah" } }).success).toBe(false);
  });

  it("accepts a reviewed gate record and the internal corporate media contract", () => {
    expect(hotelContentDraftInput.safeParse({ ...draft, hotel: { ...draft.hotel, latitude: 24.47, longitude: 39.61, nearestGateName: "Al Salam Gate", nearestGateAddress: "Al Salam Gate, Madinah", routeVerifiedAt: "2026-08-18" } }).success).toBe(true);
    expect(hotelAuthorizedImageInput.safeParse({ hotelId: 1, fileName: "hotel.webp", contentType: "image/webp", base64: "a".repeat(32), altText: "Hotel exterior image" }).success).toBe(true);
  });

  it("keeps controlled draft and verified records out of the public projection until published", () => {
    expect(isPublicPortfolioStatus("draft")).toBe(false);
    expect(isPublicPortfolioStatus("verified")).toBe(false);
    expect(isPublicPortfolioStatus("published")).toBe(true);
    expect(hotelContentDraftInput.safeParse({ ...draft, hotel: { ...draft.hotel, portfolioStatus: "published" } }).success).toBe(false);
    expect(hotelContentDraftInput.safeParse({ ...draft, hotel: { ...draft.hotel, portfolioStatus: "published", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Example", locationVerifiedAt: "2026-08-18" } }).success).toBe(true);
    expect(hotelContentDraftInput.safeParse({ ...draft, hotel: { ...draft.hotel, portfolioStatus: "published", sourceStatus: "planning", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Example", locationVerifiedAt: "2026-08-18" } }).success).toBe(false);
  });

  it("accepts the internal supported image contract and rejects unsupported or incomplete media metadata", () => {
    const approvedMedia = { hotelId: 1, fileName: "hotel.webp", contentType: "image/webp" as const, base64: "a".repeat(32), altText: "Exterior view of the hotel entrance" };
    expect(hotelAuthorizedImageInput.safeParse(approvedMedia).success).toBe(true);
    expect(hotelAuthorizedImageInput.safeParse({ ...approvedMedia, contentType: "image/gif" }).success).toBe(false);
    expect(hotelAuthorizedImageInput.safeParse({ ...approvedMedia, altText: "short" }).success).toBe(false);
  });

  it("requires the exact slug before a controlled hotel record can be removed", () => {
    expect(hotelContentRemoveInput.safeParse({ hotelId: 12, confirmationSlug: "example-madinah" }).success).toBe(true);
    expect(hotelContentRemoveInput.safeParse({ hotelId: 12, confirmationSlug: "Example Madinah" }).success).toBe(false);
    expect(hotelContentRemoveInput.safeParse({ hotelId: 0, confirmationSlug: "example-madinah" }).success).toBe(false);
  });
});

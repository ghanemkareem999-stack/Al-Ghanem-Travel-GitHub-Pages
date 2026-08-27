import { describe, expect, it } from "vitest";
import { curatedGalleryGroups } from "./curatedGalleryExpansionData";
import { canonicalHotelProfiles, hotelProfiles } from "./portfolio";
import { orderGalleryForDisplay } from "./curatedGalleryExpansion";

describe("public hotel gallery expansion", () => {
  it("retains every canonical hotel and every canonical image in the public catalogue", () => {
    expect(hotelProfiles).toHaveLength(canonicalHotelProfiles.length);
    for (const canonical of canonicalHotelProfiles) {
      const published = hotelProfiles.find(profile => profile.slug === canonical.slug);
      expect(published).toBeTruthy();
      const requiredCanonicalImages = canonical.slug === "dallah-taibah" ? canonical.gallery.slice(1) : canonical.gallery;
      expect(published?.gallery).toEqual(expect.arrayContaining(requiredCanonicalImages));
    }
  });

  it("uses the clearer owner-provided Dallah Taibah exterior as the published primary image", () => {
    const dallah = hotelProfiles.find(profile => profile.slug === "dallah-taibah");
    expect(dallah?.gallery[0]).toBe("/manus-storage/dallah-taibah-exterior-owner-2026-08-27_8887ff8c.webp");
  });

  it("puts a clearly labelled exterior image before rooms and lobby images", () => {
    const ordered = orderGalleryForDisplay([
      "/manus-storage/example-room.jpg",
      "/manus-storage/example-lobby.jpg",
      "/manus-storage/example-exterior.jpg",
    ]);
    expect(ordered[0]).toContain("example-exterior");
    expect(ordered[1]).toContain("example-lobby");
    expect(ordered[2]).toContain("example-room");
  });

  it("does not guess when gallery filenames have no clear exterior label", () => {
    const images = ["/manus-storage/photo-01.jpg", "/manus-storage/photo-02.jpg"];
    expect(orderGalleryForDisplay(images)).toEqual(images);
  });

  it("publishes each reviewed direct property image from the curated expansion", () => {
    const reviewedImages = curatedGalleryGroups.flatMap(group => group.images);
    const publishedImages = new Set(hotelProfiles.flatMap(profile => profile.gallery));
    expect(reviewedImages).toHaveLength(366);
    expect(reviewedImages.every(image => publishedImages.has(image))).toBe(true);
  });
});

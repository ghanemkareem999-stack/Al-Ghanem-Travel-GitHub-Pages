import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/components/HotelGalleryLightbox.tsx", "utf8");

describe("HotelGalleryLightbox", () => {
  it("opens a focused dialog from each gallery image", () => {
    expect(source).toContain("<Dialog open={isOpen}");
    expect(source).toContain("onOpen={() => setActiveIndex(0)}");
    expect(source).toContain('aria-label={`${label}: ${alt}`}');
    expect(source).toContain('<Expand size={18} />');
  });

  it("supports close, previous, next, and keyboard navigation", () => {
    expect(source).toContain('event.key === "ArrowLeft"');
    expect(source).toContain('event.key === "ArrowRight"');
    expect(source).toContain('aria-label={controls.close}');
    expect(source).toContain('aria-label={controls.previous}');
    expect(source).toContain('aria-label={controls.next}');
    expect(source).toContain('aria-live="polite"');
  });

  it("keeps the hotel name visible immediately above the gallery for clear marketing screenshots", () => {
    expect(source).toContain('<h2 className="mt-3 font-serif text-3xl leading-tight text-[#173e35] sm:text-4xl">{hotelName}</h2>');
    expect(source).toContain('aria-label={`${images.length} images`}');
  });
});

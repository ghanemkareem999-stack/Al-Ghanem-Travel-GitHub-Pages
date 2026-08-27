import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/HotelPortfolio.tsx", "utf8");

describe("HotelPortfolio directory cards", () => {
  it("uses one accessible whole-card detail link and keeps the visual CTA non-interactive", () => {
    expect(source).toContain("<Link href={`/hotels/${hotel.slug}`} aria-label={`${text.view}: ${displayName}`}");
    expect(source).toContain("const displayName = getHotelDisplayName(hotel, locale);");
    expect(source).toContain('className="group block rounded-[1.5rem]');
    expect(source).toContain('<span className="mt-7 inline-flex items-center gap-2');
    expect(source).not.toContain('<Link href={`/hotels/${hotel.slug}`} className="mt-7');
  });
});

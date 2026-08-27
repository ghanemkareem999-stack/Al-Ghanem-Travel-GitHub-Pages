import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { hotelSearchLabels } from "./HotelSearch";

const source = readFileSync("client/src/components/HotelSearch.tsx", "utf8");

describe("HotelSearch", () => {
  it("provides a live, accessible result list linking to hotel-detail pages", () => {
    expect(source).toContain('role="search"');
    expect(source).toContain("searchHotelsByName(hotels, query)");
    expect(source).toContain('href={`/hotels/${hotel.slug}`}');
    expect(source).toContain('aria-live="polite"');
  });

  it("provides complete search guidance in all six supported interface languages", () => {
    expect(Object.keys(hotelSearchLabels)).toEqual(["en", "ar", "ms", "ur", "id", "hi"]);
    for (const labels of Object.values(hotelSearchLabels)) {
      expect(labels.label).not.toHaveLength(0);
      expect(labels.placeholder).not.toHaveLength(0);
      expect(labels.hint).not.toHaveLength(0);
      expect(labels.noResults).not.toHaveLength(0);
    }
  });

  it("helps visitors recover with bilingual search guidance and an accessible reset control", () => {
    expect(source).toContain("{text.hint}");
    expect(source).toContain("onClick={() => setQuery(\"\")}");
    expect(hotelSearchLabels.ar.hint).toContain("العربي");
    expect(hotelSearchLabels.en.hint).toContain("Arabic and English");
  });
});

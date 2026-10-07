import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/components/HotelPropertyLocation.tsx", "utf8");

describe("HotelPropertyLocation fallback", () => {
  it("keeps an accessible property-location card available when the interactive map fails", () => {
    expect(source).toContain("{unavailable ? (");
    expect(source).toContain('role="status"');
    expect(source).toContain("{hotelName}");
    expect(source).toContain("{mapAddress}");
    expect(source).toContain("{labels.unavailable}");
  });

  it("retains the separate Google Maps location action alongside the fallback", () => {
    expect(source).toContain("const mapsUrl = locationUrl ||");
    expect(source).toContain('target="_blank"');
    expect(source).toContain("{labels.action}");
  });
});

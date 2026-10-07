import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/App.tsx", "utf8");

describe("admin route registration", () => {
  it("registers the protected hotel workspace before dynamic locale routes", () => {
    const adminIndex = source.indexOf('<Route path="/admin/hotels"');
    const localeIndex = source.indexOf('<Route path="/:locale/hotels/:slug"');
    expect(adminIndex).toBeGreaterThan(-1);
    expect(localeIndex).toBeGreaterThan(-1);
    expect(adminIndex).toBeLessThan(localeIndex);
  });

  it("registers unlocalized hotel routes before the generic locale route", () => {
    const hotelDirectoryIndex = source.indexOf('<Route path="/hotels"');
    const genericLocaleIndex = source.indexOf('<Route path="/:locale" component={() => <LocalizedPage component={Home} />}');
    expect(hotelDirectoryIndex).toBeGreaterThan(-1);
    expect(genericLocaleIndex).toBeGreaterThan(-1);
    expect(hotelDirectoryIndex).toBeLessThan(genericLocaleIndex);
  });
});

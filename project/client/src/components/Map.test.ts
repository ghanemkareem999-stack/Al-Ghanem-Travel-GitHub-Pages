import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/components/Map.tsx", "utf8");

describe("MapView provider fallback", () => {
  it("notifies the parent when the optional provider fails without emitting a browser-console error", () => {
    expect(source).toContain("script.onerror = () => {");
    expect(source).toContain("onMapError?.();");
    expect(source).not.toContain('console.error("Failed to load Google Maps script")');
  });
});

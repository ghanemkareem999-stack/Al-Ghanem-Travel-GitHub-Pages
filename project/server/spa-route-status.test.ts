import { describe, expect, it } from "vitest";
import { getSpaRouteStatus } from "./_core/vite";

describe("SPA route status", () => {
  it("returns 200 for known public and verified hotel detail routes", () => {
    expect(getSpaRouteStatus("/")).toBe(200);
    expect(getSpaRouteStatus("/hotels")).toBe(200);
    expect(getSpaRouteStatus("/hotels/pullman-zamzam-madinah")).toBe(200);
    expect(getSpaRouteStatus("/reviews?source=footer")).toBe(200);
  });

  it("returns 404 for an unknown page while leaving the branded SPA utility screen renderable", () => {
    expect(getSpaRouteStatus("/missing-page")).toBe(404);
    expect(getSpaRouteStatus("/hotels/pullman-zamzam-madinah/extra")).toBe(404);
  });
});

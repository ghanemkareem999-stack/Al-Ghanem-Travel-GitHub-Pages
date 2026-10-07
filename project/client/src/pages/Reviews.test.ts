import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/Reviews.tsx", "utf8");

describe("Reviews participation anchor", () => {
  it("provides a stable, scroll-safe target for review participation links", () => {
    expect(source).toContain('id="share"');
    expect(source).toContain("scroll-mt-24");
  });

  it("keeps the public feedback form focused by omitting primary-contact and service fields", () => {
    expect(source).not.toContain('name="contactName"');
    expect(source).not.toContain('name="serviceType"');
  });

  it("does not show a public statement that feedback is selected or filtered by the company", () => {
    expect(source).not.toContain("copy.trust");
    expect(source).not.toContain("ShieldCheck");
  });
});

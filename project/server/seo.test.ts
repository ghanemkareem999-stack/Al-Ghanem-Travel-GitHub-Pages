import express from "express";
import { describe, expect, it } from "vitest";
import { buildSitemapXml, getIndexablePaths, registerSeoRoutes } from "./seo";

describe("SEO sitemap", () => {
  it("includes each indexable public route and hotel across all published language URLs", () => {
    const sitemap = buildSitemapXml("https://example.com");
    expect(sitemap).toContain("https://example.com/en");
    expect(sitemap).toContain("https://example.com/ar/hotels");
    expect(sitemap).toContain("https://example.com/id/hotels/dar-al-taqwa-madinah");
    expect(sitemap).toContain('hreflang="ur"');
    expect(sitemap).not.toContain("/en/inquiry");
    expect(getIndexablePaths()).toContain("/hotels/pullman-zamzam-madinah");
  });

  it("serves the configured canonical origin from the sitemap endpoint", async () => {
    expect(process.env.CANONICAL_ORIGIN).toBe("https://alghanemtravel.com");
    const app = express();
    registerSeoRoutes(app);
    const server = await new Promise<ReturnType<typeof app.listen>>(resolve => {
      const instance = app.listen(0, () => resolve(instance));
    });

    try {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Test server did not expose a TCP address");
      const response = await fetch(`http://127.0.0.1:${address.port}/sitemap.xml`);
      expect(response.status).toBe(200);
      expect(await response.text()).toContain("https://alghanemtravel.com/en/hotels");
    } finally {
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  });
});

import { describe, expect, it } from "vitest";

const ga4MeasurementId = process.env.VITE_GA4_MEASUREMENT_ID;
const gtmContainerId = process.env.VITE_GTM_ID;
const metaPixelId = process.env.VITE_META_PIXEL_ID;

describe("marketing identifier configuration", () => {
  it("exposes valid-format GA4, GTM, and Meta Pixel identifiers and reaches their official delivery endpoints", async () => {
    expect(ga4MeasurementId).toMatch(/^G-[A-Z0-9]+$/);
    expect(gtmContainerId).toMatch(/^GTM-[A-Z0-9]+$/);
    expect(metaPixelId).toMatch(/^\d{8,20}$/);

    const [ga4Response, gtmResponse, metaPixelResponse] = await Promise.all([
      fetch(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4MeasurementId ?? "")}`),
      fetch(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmContainerId ?? "")}`),
      fetch("https://connect.facebook.net/en_US/fbevents.js"),
    ]);

    expect(ga4Response.ok).toBe(true);
    expect(gtmResponse.ok).toBe(true);
    expect(metaPixelResponse.ok).toBe(true);
  }, 15_000);
});

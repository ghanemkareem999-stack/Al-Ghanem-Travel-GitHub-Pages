export type MarketingIds = {
  ga4: string;
  gtm: string;
  metaPixel: string;
};

export type MarketingConsentChoice = "accepted" | "declined" | null;

export function normalizeMarketingIds(ids: Partial<MarketingIds>): MarketingIds {
  return {
    ga4: ids.ga4?.trim() ?? "",
    gtm: ids.gtm?.trim() ?? "",
    metaPixel: ids.metaPixel?.trim() ?? "",
  };
}

export function hasConfiguredMarketing(ids: MarketingIds): boolean {
  return Boolean(ids.ga4 || ids.gtm || ids.metaPixel);
}

export function canLoadMarketingScripts(choice: MarketingConsentChoice, ids: MarketingIds): boolean {
  return choice === "accepted" && hasConfiguredMarketing(ids);
}

export const marketingIds = normalizeMarketingIds({
  ga4: import.meta.env.VITE_GA4_MEASUREMENT_ID,
  gtm: import.meta.env.VITE_GTM_ID,
  metaPixel: import.meta.env.VITE_META_PIXEL_ID,
});

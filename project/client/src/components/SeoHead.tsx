import { useEffect } from "react";

function upsertMeta(selector: string, attribute: "name" | "property", value: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function SeoHead({ title, description, structuredData }: { title: string; description: string; structuredData?: Record<string, unknown> }) {
  useEffect(() => {
    const officialBrand = "Al Ghanem Travel | Islamic Tourism & Travel Services";
    const pageTitle = title.replace(/\s*\|\s*Al Ghanem Travel\s*$/i, "").trim();
    const brandedTitle = pageTitle.includes(officialBrand) ? pageTitle : `${pageTitle} | ${officialBrand}`;
    document.title = brandedTitle;
    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", brandedTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[property="og:url"]', "property", "og:url", window.location.href);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.href;
    const existingStructuredData = document.head.querySelector<HTMLScriptElement>("#route-structured-data");
    if (structuredData) {
      const script = existingStructuredData ?? document.createElement("script");
      script.id = "route-structured-data";
      script.type = "application/ld+json";
      script.text = JSON.stringify(structuredData);
      if (!existingStructuredData) document.head.appendChild(script);
    } else {
      existingStructuredData?.remove();
    }
  }, [description, structuredData, title]);
  return null;
}

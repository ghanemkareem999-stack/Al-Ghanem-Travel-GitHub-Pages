import { getHotelContent, getHotelDisplayName, hotelProfiles } from "@/lib/portfolio";
import { getLocaleFromPath, stripLocalePrefix, toLocalePath } from "@/lib/localePaths";
import { infoCopy } from "@/lib/infoCopy";
import { localeMeta, locales, type Locale } from "@/lib/i18n";
import { reviewCopy } from "@/lib/reviewCopy";
import { seoCopy } from "@/lib/seoCopy";

export type SsrHead = {
  title: string;
  description: string;
  canonicalPath?: string;
  locale: Locale;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  notFound?: boolean;
  structuredData?: Record<string, unknown>;
  alternates?: Array<{ locale: Locale; href: string }>;
};

export const SITE_NAME = "Al Ghanem Travel | Islamic Tourism & Travel Services";
export const DEFAULT_SHARE_IMAGE = "/manus-storage/al-ghanem-madinah-hospitality-hero_e26e2975.jpg";

const routeAlternates = (path: string) => locales.map(locale => ({ locale, href: toLocalePath(locale, path) }));

function pageHead(locale: Locale, path: string, title: string, description: string, extras: Partial<SsrHead> = {}): SsrHead {
  return {
    title,
    description,
    canonicalPath: toLocalePath(locale, path),
    locale,
    ogImage: DEFAULT_SHARE_IMAGE,
    ogImageAlt: SITE_NAME,
    alternates: routeAlternates(path),
    ...extras,
  };
}

export function getSsrHead(rawPath: string): SsrHead {
  const [pathname] = rawPath.split("?", 1);
  const locale = getLocaleFromPath(pathname);
  const path = stripLocalePrefix(pathname);

  if (path === "/") return pageHead(locale, path, seoCopy[locale].home.title, seoCopy[locale].home.description, {
    structuredData: { "@context": "https://schema.org", "@type": "TravelAgency", name: "Al Ghanem Travel", description: seoCopy[locale].home.description, areaServed: ["Madinah Al Munawwarah", "Makkah Al Mukarramah"] },
  });
  if (path === "/hotels") return pageHead(locale, path, seoCopy[locale].portfolio.title, seoCopy[locale].portfolio.description);
  if (path === "/inquiry") return pageHead(locale, path, seoCopy[locale].inquiry.title, seoCopy[locale].inquiry.description, { noindex: true });
  if (path === "/reviews") return pageHead(locale, path, `${reviewCopy[locale].title} | Al Ghanem Travel`, reviewCopy[locale].body);

  const infoMatch = path.match(/^\/(about|contact|privacy|terms)$/);
  if (infoMatch) {
    const kind = infoMatch[1] as "about" | "contact" | "privacy" | "terms";
    const copy = infoCopy[locale][kind];
    return pageHead(locale, path, `${copy.title} | Al Ghanem Travel`, copy.intro, { noindex: kind === "privacy" || kind === "terms" });
  }

  const hotelMatch = path.match(/^\/hotels\/([^/]+)$/);
  if (hotelMatch) {
    const hotel = hotelProfiles.find(item => item.slug === hotelMatch[1]);
    if (!hotel) return { title: SITE_NAME, description: seoCopy[locale].home.description, locale, notFound: true };
    const content = getHotelContent(hotel, locale);
    const name = getHotelDisplayName(hotel, locale);
    return pageHead(locale, path, `${name} | Al Ghanem Travel`, content.summary, {
      ogType: "article",
      ogImage: hotel.gallery[0] || DEFAULT_SHARE_IMAGE,
      ogImageAlt: name,
      structuredData: hotel.status === "verified" ? {
        "@context": "https://schema.org",
        "@type": "Hotel",
        name: hotel.name,
        description: content.summary,
        image: hotel.gallery[0] || undefined,
        address: { "@type": "PostalAddress", streetAddress: hotel.address, addressLocality: "Madinah Al Munawwarah", addressCountry: "SA" },
      } : undefined,
    });
  }

  if (path.startsWith("/admin")) return { title: SITE_NAME, description: seoCopy[locale].home.description, locale, noindex: true };
  const notFound = infoCopy[locale].notFound;
  return { title: `${notFound.title} | Al Ghanem Travel`, description: notFound.body, locale, noindex: true, notFound: true };
}

export function getHtmlAttributes(locale: Locale) {
  return { lang: locale, dir: localeMeta[locale].dir };
}

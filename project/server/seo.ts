import { hotelProfiles } from "../client/src/lib/portfolio";
import { locales } from "../client/src/lib/i18n";
import { toLocalePath } from "../client/src/lib/localePaths";
import type { Express, Request, Response } from "express";

const publicStaticPaths = ["/", "/hotels", "/reviews", "/about", "/contact"];

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function getOrigin(req: Request) {
  const protocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim() || req.protocol || "https";
  const configured = process.env.CANONICAL_ORIGIN?.trim();
  const value = configured || `${protocol}://${req.get("host") || "localhost"}`;
  return (/^https?:\/\//i.test(value) ? value : `https://${value}`).replace(/\/$/, "");
}

export function getIndexablePaths() {
  const hotelPaths = hotelProfiles
    .filter(hotel => hotel.status === "verified" || hotel.verification.locationStatus !== "not_published")
    .map(hotel => `/hotels/${hotel.slug}`);
  return [...publicStaticPaths, ...hotelPaths];
}

export function buildSitemapXml(origin: string) {
  const safeOrigin = origin.replace(/\/$/, "");
  const entries = getIndexablePaths().flatMap(path => locales.map(locale => {
    const localizedPath = toLocalePath(locale, path);
    const alternates = locales.map(alternate => `    <xhtml:link rel="alternate" hreflang="${alternate}" href="${escapeXml(`${safeOrigin}${toLocalePath(alternate, path)}`)}" />`).join("\n");
    return `  <url>\n    <loc>${escapeXml(`${safeOrigin}${localizedPath}`)}</loc>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${safeOrigin}${toLocalePath("en", path)}`)}" />\n    <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>\n    <priority>${path === "/" ? "1.0" : path === "/hotels" ? "0.9" : "0.8"}</priority>\n  </url>`;
  })).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries}\n</urlset>`;
}

export function registerSeoRoutes(app: Express) {
  app.get("/robots.txt", (req: Request, res: Response) => {
    const origin = getOrigin(req);
    res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /inquiry\nDisallow: /privacy\nDisallow: /terms\nSitemap: ${origin}/sitemap.xml\n`);
  });
  app.get("/sitemap.xml", (req: Request, res: Response) => {
    res.type("application/xml").send(buildSitemapXml(getOrigin(req)));
  });
}

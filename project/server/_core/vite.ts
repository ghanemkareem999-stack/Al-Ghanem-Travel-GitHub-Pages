import express, { type Express, type NextFunction, type Request, type Response } from "express";
import fs from "fs";
import { type Server } from "http";
import path from "path";
import superjson from "superjson";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getIndexablePaths, getOrigin } from "../seo";

type SsrHead = { title: string; description: string; canonicalPath?: string; locale: string; ogImage?: string; ogImageAlt?: string; ogType?: "website" | "article"; noindex?: boolean; notFound?: boolean; structuredData?: Record<string, unknown>; alternates?: Array<{ locale: string; href: string }> };
type SsrResult = { html: string; dehydratedState: unknown; head: SsrHead };
type RenderModule = { render: (url: string) => Promise<SsrResult> };

export function getSpaRouteStatus(url: string): number {
  const pathname = url.split("?")[0].replace(/^\/(?:en|ar|ms|ur|id|hi)(?=\/|$)/, "") || "/";
  const known = new Set([...getIndexablePaths(), "/inquiry", "/privacy", "/terms", "/admin/reviews", "/admin/hotels"]);
  return known.has(pathname) ? 200 : 404;
}

function escapeHtml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function absoluteUrl(origin: string, value: string) { return /^https?:\/\//i.test(value) ? value : `${origin}${value.startsWith("/") ? value : `/${value}`}`; }
function ogLocale(locale: string) { return ({ ar: "ar_SA", ms: "ms_MY", ur: "ur_PK", id: "id_ID", hi: "hi_IN", en: "en_US" } as Record<string, string>)[locale] || "en_US"; }

function buildHeadTags(head: SsrHead, origin: string) {
  const title = escapeHtml(head.title);
  const description = escapeHtml(head.description);
  const canonical = head.canonicalPath ? absoluteUrl(origin, head.canonicalPath) : origin;
  const tags = [
    `<title>${title}</title>`, `<meta name="description" content="${description}" />`, `<meta name="robots" content="${head.noindex || head.notFound ? "noindex, follow" : "index, follow"}" />`, `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="${head.ogType || "website"}" />`, `<meta property="og:site_name" content="Al Ghanem Travel" />`, `<meta property="og:locale" content="${ogLocale(head.locale)}" />`, `<meta property="og:title" content="${title}" />`, `<meta property="og:description" content="${description}" />`, `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`, `<meta name="twitter:title" content="${title}" />`, `<meta name="twitter:description" content="${description}" />`,
  ];
  if (head.ogImage) {
    const image = absoluteUrl(origin, head.ogImage);
    tags.push(`<meta property="og:image" content="${escapeHtml(image)}" />`, `<meta property="og:image:alt" content="${escapeHtml(head.ogImageAlt || head.title)}" />`, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  }
  for (const alternate of head.alternates ?? []) tags.push(`<link rel="alternate" hreflang="${alternate.locale}" href="${escapeHtml(absoluteUrl(origin, alternate.href))}" />`);
  const english = head.alternates?.find(alternate => alternate.locale === "en");
  if (english) tags.push(`<link rel="alternate" hreflang="x-default" href="${escapeHtml(absoluteUrl(origin, english.href))}" />`);
  if (head.structuredData) tags.push(`<script type="application/ld+json">${JSON.stringify(head.structuredData).replace(/</g, "\\u003c")}</script>`);
  return tags.join("\n    ");
}

function composeHtml(template: string, result: SsrResult, origin: string, devCss = false) {
  const state = JSON.stringify(superjson.serialize(result.dehydratedState)).replace(/</g, "\\u003c");
  const htmlDir = ["ar", "ur"].includes(result.head.locale) ? "rtl" : "ltr";
  let html = template.replace("<!--app-lang-->", escapeHtml(result.head.locale)).replace("<!--app-dir-->", htmlDir).replace("<!--app-head-->", () => buildHeadTags(result.head, origin));
  if (devCss) html = html.replace("</head>", '<link rel="stylesheet" href="/src/index.css?direct" data-ssr-dev-css></head>');
  html = html.replace("</body>", () => `<script>window.__RQ_STATE__=${state}</script></body>`);
  return html.replace("<!--app-html-->", () => result.html);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({ ...viteConfig, configFile: false, server: { middlewareMode: true, hmr: { server }, allowedHosts: true as const }, appType: "custom" });
  app.use(vite.middlewares);
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const templatePath = path.resolve(import.meta.dirname, "../..", "client", "index.html");
      let template = await fs.promises.readFile(templatePath, "utf-8");
      const serverModule = await vite.ssrLoadModule("/src/entry-server.tsx") as RenderModule;
      const result = await serverModule.render(req.originalUrl);
      template = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(result.head.notFound ? 404 : 200).set({ "Content-Type": "text/html", "Cache-Control": "no-store" }).end(composeHtml(template, result, getOrigin(req), true));
    } catch (error) { vite.ssrFixStacktrace(error as Error); next(error); }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  app.use(express.static(distPath, { index: false, redirect: false }));
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
      const serverModule = await import(path.resolve(import.meta.dirname, "server-ssr", "entry-server.js")) as RenderModule;
      const result = await serverModule.render(req.originalUrl);
      res.status(result.head.notFound ? 404 : 200).set({ "Content-Type": "text/html", "Cache-Control": "no-store" }).end(composeHtml(template, result, getOrigin(req)));
    } catch (error) { next(error); }
  });
}

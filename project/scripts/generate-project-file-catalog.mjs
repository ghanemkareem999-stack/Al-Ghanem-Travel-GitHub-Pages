import { createHash } from "node:crypto";
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const exportRoot = "/home/ubuntu/exports/al-ghanem-travel-production";
const generatedDir = path.join(root, "docs", "generated");
const outputMarkdown = path.join(generatedDir, "project-file-catalog-2026-08-27.md");
const outputJson = path.join(generatedDir, "project-file-catalog-2026-08-27.json");

const excludedDirectories = new Set([".git", "node_modules", "dist", "coverage", ".manus-logs"]);
const excludedFiles = new Set([".env"]);

function walk(directory, base = directory) {
  const entries = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (excludedDirectories.has(entry.name)) continue;
    if (excludedFiles.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(base, absolute).replaceAll(path.sep, "/");
    if (entry.isDirectory()) {
      entries.push(...walk(absolute, base));
      continue;
    }
    const stats = statSync(absolute);
    const bytes = stats.size;
    const sha256 = createHash("sha256").update(readFileSync(absolute)).digest("hex");
    entries.push({ relative, bytes, sha256, ext: path.extname(entry.name).toLowerCase() || "[none]" });
  }
  return entries.sort((a, b) => a.relative.localeCompare(b.relative));
}

function classify(relative) {
  if (relative.startsWith("client/src/pages/")) return "Frontend page";
  if (relative.startsWith("client/src/components/")) return "Frontend component";
  if (relative.startsWith("client/src/lib/")) return "Frontend data/library";
  if (relative.startsWith("server/")) return "Backend/API";
  if (relative.startsWith("drizzle/")) return "Database schema/migration";
  if (relative.startsWith("shared/")) return "Shared data/types";
  if (relative.startsWith("docs/generated/")) return "Generated report/list";
  if (relative.startsWith("scripts/")) return "Operational script";
  if (relative.startsWith("media/")) return "Physical media export";
  if (["README.md", "README-DEPLOYMENT.md", "render.yaml", ".env.example", "package.json", "pnpm-lock.yaml", "vite.config.ts", "tsconfig.json", "vitest.config.ts"].includes(relative)) return "Deployment/config";
  return "Project file";
}

function summarize(entries) {
  const byClass = new Map();
  const byExt = new Map();
  for (const entry of entries) {
    const fileClass = classify(entry.relative);
    byClass.set(fileClass, (byClass.get(fileClass) ?? 0) + 1);
    byExt.set(entry.ext, (byExt.get(entry.ext) ?? 0) + 1);
  }
  return {
    byClass: Object.fromEntries([...byClass.entries()].sort(([a], [b]) => a.localeCompare(b))),
    byExt: Object.fromEntries([...byExt.entries()].sort(([a], [b]) => a.localeCompare(b))),
  };
}

function bytesLabel(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

mkdirSync(generatedDir, { recursive: true });
const projectEntries = walk(root);
let exportEntries = [];
try {
  exportEntries = walk(exportRoot);
} catch {
  exportEntries = [];
}
const projectSummary = summarize(projectEntries);
const exportSummary = summarize(exportEntries);

const importantFiles = [
  ["client/src/lib/portfolio.ts", "بيانات الفنادق العامة والمعارض وأسماء الفنادق ومساراتها."],
  ["client/src/lib/curatedGalleryExpansion.ts", "منطق إضافة صور المراجعة الموسعة واستبدال الصورة الأساسية عند الحاجة."],
  ["client/src/components/HotelGalleryLightbox.tsx", "معرض الصور المنبثق وواجهة العرض التسويقي للفندق."],
  ["client/src/components/BackNavigation.tsx", "زر العودة العلوي والعائم وسلوك الرجوع السياقي."],
  ["client/src/pages/HotelDetail.tsx", "صفحة تفاصيل الفندق العامة."],
  ["client/src/pages/HotelContentAdmin.tsx", "لوحة إدارة محتوى الفنادق والصور."],
  ["server/routers.ts", "واجهات tRPC للفنادق والاستفسارات والمراجعات والإدارة."],
  ["server/storage.ts", "طبقة رفع الملفات إلى التخزين المتوافق مع S3."],
  ["drizzle/schema.ts", "مخطط قاعدة البيانات."],
  ["README-DEPLOYMENT.md", "تعليمات النشر الخارجي في نسخة العمل."],
  ["scripts/build-external-delivery.mjs", "باني الحزمة الخارجية المستقلة."],
  ["docs/generated/all-live-website-image-links-2026-08-27.txt", "روابط صور الموقع منظمة حسب الفندق."],
  ["docs/generated/idm-import-all-live-website-image-urls.txt", "قائمة روابط مباشرة آمنة للاستيراد في IDM."],
  ["docs/generated/download-all-live-website-images-idm.bat", "ملف Batch لتنزيل كل صور الموقع عبر IDM في مجلدات الفنادق."],
  ["docs/generated/current-hotel-media-technical-audit-2026-08-27.md", "تقرير تدقيق بيانات الفنادق والصور الحالي."],
  ["docs/generated/project-file-catalog-2026-08-27.md", "هذا الكتالوج."],
];

const markdown = `# Al Ghanem Travel — Project File Catalogue

Generated: ${new Date().toISOString()}

This catalogue lists the current project files and, when already rebuilt, the external delivery package files. Dependency folders, build folders, logs, Git metadata, and plaintext secrets are intentionally excluded from the catalogue.

| Scope | Files | Approx. size |
|---|---:|---:|
| Working project, excluding dependencies/build logs | ${projectEntries.length} | ${bytesLabel(projectEntries.reduce((sum, entry) => sum + entry.bytes, 0))} |
| External delivery package snapshot, excluding dependencies/build logs | ${exportEntries.length} | ${bytesLabel(exportEntries.reduce((sum, entry) => sum + entry.bytes, 0))} |

## Important files

| File | Purpose |
|---|---|
${importantFiles.map(([file, purpose]) => `| ${file} | ${purpose} |`).join("\n")}

## Working project file groups

| Group | File count |
|---|---:|
${Object.entries(projectSummary.byClass).map(([group, count]) => `| ${group} | ${count} |`).join("\n")}

## External package file groups

| Group | File count |
|---|---:|
${Object.entries(exportSummary.byClass).map(([group, count]) => `| ${group} | ${count} |`).join("\n") || "| Not rebuilt yet | 0 |"}

## Complete working-project file index

| Path | Group | Size | SHA-256 |
|---|---|---:|---|
${projectEntries.map(entry => `| ${entry.relative} | ${classify(entry.relative)} | ${bytesLabel(entry.bytes)} | ${entry.sha256} |`).join("\n")}

## Complete external-package file index

| Path | Group | Size | SHA-256 |
|---|---|---:|---|
${exportEntries.length ? exportEntries.map(entry => `| ${entry.relative} | ${classify(entry.relative)} | ${bytesLabel(entry.bytes)} | ${entry.sha256} |`).join("\n") : "| Not rebuilt yet | Not rebuilt yet | 0 B | Not rebuilt yet |"}
`;

writeFileSync(outputMarkdown, markdown, "utf8");
writeFileSync(outputJson, `${JSON.stringify({ generatedAt: new Date().toISOString(), project: { root, files: projectEntries.length, summary: projectSummary, entries: projectEntries }, externalPackage: { root: exportRoot, files: exportEntries.length, summary: exportSummary, entries: exportEntries } }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ projectFiles: projectEntries.length, exportFiles: exportEntries.length, outputMarkdown, outputJson }, null, 2));

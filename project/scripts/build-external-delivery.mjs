import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = "/home/ubuntu/exports/al-ghanem-travel-production";
const sourceMedia = "/home/ubuntu/webdev-static-assets/al-ghanem-travel/external-media-audit-2026-08-25";
const liveSiteMedia = "/home/ubuntu/webdev-static-assets/al-ghanem-travel/live-site-images-2026-08-27";
const externalLockfile = path.join(root, "scripts", "al-ghanem-travel-production.pnpm-lock.yaml");
const destinationPlaceholder = "/home/ubuntu/webdev-static-assets/al-ghanem-travel/madinah-directory-placeholder-2026-08-25.jpg";
const excluded = new Set([".git", ".manus", ".manus-logs", "node_modules", "dist", "coverage", ".env", "RUN_CONFIGURATION_TEMPLATE.txt", "EXPORT_README_AR.md"]);

async function copySource() {
  await rm(output, { recursive: true, force: true });
  await cp(root, output, {
    recursive: true,
    filter: entry => !excluded.has(path.basename(entry)),
  });
  await rm(path.join(output, "client/public/__manus__"), { recursive: true, force: true });
  await rm(path.join(output, ".project-config.json"), { force: true });
  await rm(path.join(output, "client/src/components/ManusDialog.tsx"), { force: true });
  await rm(path.join(output, "server/_core/oauth.ts"), { force: true });
  await rm(path.join(output, "server/_core/sdk.ts"), { force: true });
  await rm(path.join(output, "server/_core/systemRouter.ts"), { force: true });
  await rm(path.join(output, "server/_core/dataApi.ts"), { force: true });
  await rm(path.join(output, "server/_core/env.ts"), { force: true });
  await rm(path.join(output, "server/_core/heartbeat.ts"), { force: true });
  await rm(path.join(output, "server/_core/imageGeneration.ts"), { force: true });
  await rm(path.join(output, "server/_core/llm.ts"), { force: true });
  await rm(path.join(output, "server/_core/map.ts"), { force: true });
  await rm(path.join(output, "server/_core/notification.ts"), { force: true });
  await rm(path.join(output, "server/_core/voiceTranscription.ts"), { force: true });
  await rm(path.join(output, "docs/environment-setup.md"), { force: true });
  await rm(path.join(output, "scripts/build-external-delivery.mjs"), { force: true });
  await rm(path.join(output, "DELIVERY-README.md"), { force: true });
  await rm(path.join(output, "DELIVERY-MEDIA-README.md"), { force: true });
  await rm(path.join(output, "README-DEPLOYMENT.md"), { force: true });
}

async function replace(relativePath, content) {
  await writeFile(path.join(output, relativePath), `${content.trim()}\n`, "utf8");
}

async function text(relativePath) {
  return readFile(path.join(output, relativePath), "utf8");
}

async function writeExternalRuntime() {
  await replace("server/_core/index.ts", `
import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerExternalAuthRoutes } from "../externalAuthRoutes";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { registerSeoRoutes } from "../seo";
import { createContext } from "./context";
import { getServerPort } from "./serverConfig";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerExternalAuthRoutes(app);
  registerStorageProxy(app);
  registerSeoRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  if (process.env.NODE_ENV === "development") await setupVite(app, server);
  else serveStatic(app);
  const port = getServerPort();
  server.listen(port, "0.0.0.0", () => console.log(\`Server listening on port \${port}\`));
}

startServer().catch(error => {
  console.error(error);
  process.exitCode = 1;
});`);

  await replace("server/_core/context.ts", `
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authenticateExternalAdminRequest } from "../externalAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;
  try {
    user = await authenticateExternalAdminRequest(opts.req);
  } catch {
    user = null;
  }
  return { req: opts.req, res: opts.res, user };
}`);

  await replace("server/storage.ts", `
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getExternalStorageUrl } from "./_core/externalStorage";

function normalizeKey(relKey: string) { return relKey.replace(/^\\/+/, ""); }
function appendHashSuffix(relKey: string) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? \`\${relKey}_\${hash}\` : \`\${relKey.slice(0, lastDot)}_\${hash}\${relKey.slice(lastDot)}\`;
}
function getS3Config() {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;
  const publicOrigin = process.env.S3_PUBLIC_ORIGIN;
  if (!bucket || !region || !publicOrigin) throw new Error("S3_BUCKET, S3_REGION, and S3_PUBLIC_ORIGIN are required for media uploads.");
  return {
    bucket,
    publicOrigin,
    client: new S3Client({ region, ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}) }),
  };
}
export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream") {
  const key = appendHashSuffix(normalizeKey(relKey));
  const storage = getS3Config();
  await storage.client.send(new PutObjectCommand({ Bucket: storage.bucket, Key: key, Body: data, ContentType: contentType }));
  const url = getExternalStorageUrl(storage.publicOrigin, key);
  if (!url) throw new Error("S3_PUBLIC_ORIGIN could not resolve the uploaded key.");
  return { key, url };
}
export async function storageGet(relKey: string) {
  const key = normalizeKey(relKey);
  const url = getExternalStorageUrl(process.env.S3_PUBLIC_ORIGIN || "", key);
  if (!url) throw new Error("S3_PUBLIC_ORIGIN is required for media access.");
  return { key, url };
}
export async function storageGetSignedUrl(relKey: string) {
  const key = normalizeKey(relKey);
  const storage = getS3Config();
  return getSignedUrl(storage.client, new GetObjectCommand({ Bucket: storage.bucket, Key: key }), { expiresIn: 3600 });
}`);

  await replace("server/_core/storageProxy.ts", `
import type { Express, Request, Response } from "express";
import { getExternalStorageUrl } from "./externalStorage";
import { resolveExternalMediaKey } from "./externalMediaManifest";

export function registerStorageProxy(app: Express) {
  app.get("/media/*", async (req: Request, res: Response) => {
    const key = String(req.params[0] || "");
    if (!key) return res.status(400).json({ error: "A media key is required." });
    const origin = process.env.ASSET_STORAGE_ORIGIN || process.env.S3_PUBLIC_ORIGIN || "";
    if (!origin) return res.status(500).json({ error: "ASSET_STORAGE_ORIGIN or S3_PUBLIC_ORIGIN is required." });
    try {
      const url = getExternalStorageUrl(origin, resolveExternalMediaKey(key));
      if (!url) return res.status(404).end();
      return res.redirect(302, url);
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : "Invalid media path." });
    }
  });
}`);

  await replace("server/_core/notification.ts", `
export type NotificationPayload = { title: string; content: string };

// Email delivery is handled by the Resend-backed inquiry and review workflows.
// This optional in-app notification hook intentionally has no platform dependency.
export async function notifyOwner(_payload: NotificationPayload): Promise<boolean> {
  return false;
}`);

  await replace("client/src/const.ts", `
export function startLogin() {
  window.location.assign("/admin/login");
}`);
}

async function writeExternalConfigs() {
  let database = await text("server/db.ts");
  database = database.replace("import { ENV } from './_core/env';\n", "");
  database = database.replace("    } else if (user.openId === ENV.ownerOpenId) {\n      values.role = 'admin';\n      updateSet.role = 'admin';\n    }\n", "    }\n");
  await replace("server/db.ts", database);

  let router = await text("server/routers.ts");
  router = router.replace('import { notifyOwner } from "./_core/notification";\n', "");
  router = router.replace('import { systemRouter } from "./_core/systemRouter";\n', "");
  router = router.replace("    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly\n  system: systemRouter,\n", "");
  router = router.replace(/const ownerNotified = await notifyOwner\([\s\S]*?\)\.catch\(\(\) => false\);/g, "const ownerNotified = false;");
  await replace("server/routers.ts", router);

  let app = await text("client/src/App.tsx");
  app = app.replaceAll("/manus-storage/", "/media/");
  await replace("client/src/App.tsx", app);

  for (const authClientFile of ["client/src/_core/hooks/useAuth.ts", "client/src/entry-client.tsx", "client/src/main.tsx"]) {
    let authClient = await text(authClientFile);
    authClient = authClient.replaceAll("manus-cookie", "al-ghanem-admin-session");
    authClient = authClient.replaceAll("manus-runtime-user-info", "al-ghanem-user-info");
    await replace(authClientFile, authClient);
  }

  const filesToRewrite = ["client/src", "shared", "server", "docs"];
  async function rewriteTree(relativePath) {
    const absolute = path.join(output, relativePath);
    let entries = [];
    try { entries = await readdir(absolute, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const item = path.join(relativePath, entry.name);
      if (entry.isDirectory()) await rewriteTree(item);
      else if (/\.(?:ts|tsx|json|md|txt|html|css)$/.test(entry.name)) {
        const original = await text(item);
        if (original.includes("/manus-storage/")) await replace(item, original.replaceAll("/manus-storage/", "/media/"));
      }
    }
  }
  for (const directory of filesToRewrite) await rewriteTree(directory);

  await replace("vite.config.ts", `
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), jsxLocPlugin()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "client", "src"), "@shared": path.resolve(import.meta.dirname, "shared") } },
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: { outDir: path.resolve(import.meta.dirname, "dist/public"), emptyOutDir: true },
  server: { host: true },
});`);

  await replace(".env.example", `
# Database (TiDB Cloud Serverless or MySQL 8)
DATABASE_URL=mysql://USER:PASSWORD@HOST:4000/DATABASE?ssl={"rejectUnauthorized":true}

# Application and local administrator session security
NODE_ENV=production
PORT=3000
JWT_SECRET=generate-a-random-value-of-at-least-32-characters
AUTH_PROVIDER=local
VITE_AUTH_PROVIDER=local
AUTH_ADMIN_EMAIL=admin@example.com
AUTH_ADMIN_PASSWORD_HASH=replace-with-output-of-generate-password-hash
CANONICAL_ORIGIN=https://your-domain.example

# Cloudflare R2 / S3-compatible media storage
STORAGE_PROVIDER=s3
S3_BUCKET=al-ghanem-travel-media
S3_REGION=auto
S3_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
S3_PUBLIC_ORIGIN=https://media.your-domain.example
ASSET_STORAGE_ORIGIN=https://media.your-domain.example
AWS_ACCESS_KEY_ID=replace-with-r2-access-key-id
AWS_SECRET_ACCESS_KEY=replace-with-r2-secret-access-key
EXTERNAL_MEDIA_MANIFEST_PATH=./media/media-organizer-manifest.json

# Optional email delivery through Resend
RESEND_API_KEY=re_replace_with_your_resend_api_key

# Optional analytics
VITE_GA4_MEASUREMENT_ID=
VITE_GTM_ID=
VITE_META_PIXEL_ID=`);

  await replace("render.yaml", `
services:
  - type: web
    name: al-ghanem-travel-production
    runtime: node
    buildCommand: corepack enable && pnpm install --frozen-lockfile && pnpm run build
    startCommand: pnpm start
    healthCheckPath: /healthz
    autoDeploy: true
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: CANONICAL_ORIGIN
        sync: false
      - key: AUTH_PROVIDER
        value: local
      - key: VITE_AUTH_PROVIDER
        value: local
      - key: AUTH_ADMIN_EMAIL
        sync: false
      - key: AUTH_ADMIN_PASSWORD_HASH
        sync: false
      - key: STORAGE_PROVIDER
        value: s3
      - key: S3_BUCKET
        sync: false
      - key: S3_REGION
        value: auto
      - key: S3_ENDPOINT
        sync: false
      - key: S3_PUBLIC_ORIGIN
        sync: false
      - key: ASSET_STORAGE_ORIGIN
        sync: false
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false
      - key: EXTERNAL_MEDIA_MANIFEST_PATH
        value: ./media/media-organizer-manifest.json
      - key: RESEND_API_KEY
        sync: false
      - key: VITE_GA4_MEASUREMENT_ID
        sync: false
      - key: VITE_GTM_ID
        sync: false
      - key: VITE_META_PIXEL_ID
        sync: false`);

  await replace("scripts/generate-password-hash.mjs", `
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 16) {
  console.error("Usage: node scripts/generate-password-hash.mjs '<unique-password-with-at-least-16-characters>'");
  process.exit(1);
}
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
console.log(\`scrypt:\${salt}:\${hash}\`);`);

  await replace("README.md", `
# Al Ghanem Travel — External Deployment Package

This package is a self-hosted Express, Vite SSR, tRPC, Drizzle, MySQL/TiDB, and S3-compatible application. It contains the public multilingual hotel directory and its protected local administrator dashboard. It does not include passwords, API keys, database contents, or platform-specific runtime services.

## Package layout

| Path | Purpose |
|---|---|
| client/ and server/ | Public frontend, Express/tRPC backend, local admin dashboard, SEO routes, and tests. |
| drizzle/ | Drizzle schema and ordered SQL migrations for TiDB/MySQL. |
| media/live-site-files/ | Every current static website image, copied as a physical file and organized by its hotel-folder label. |
| media/by-hotel/ | The prior confirmed owner-archive hotel mappings, organized by hotel slug. |
| media/unresolved-owner-upload/ | Owner-uploaded files intentionally not linked to a hotel because their property or branch was not verified. |
| media/media-organizer-manifest.json | SHA-256 inventory and legacy filename-to-external-object mapping for the full live image set. |
| .env.example | Complete no-secret environment template. |
| render.yaml | GitHub-to-Render blueprint. |
| scripts/generate-password-hash.mjs | Local password-hash generator for the administrator account. |

## 1. Configure TiDB Cloud

Create a TiDB Cloud Serverless MySQL-compatible database and put its TLS connection string in DATABASE_URL. Apply the checked-in SQL migrations in numerical order before accepting production traffic. Do not commit a populated .env file to GitHub.

## 2. Configure Cloudflare R2 and publish the media

Create an R2 bucket, create an access key with bucket write permission, and upload the **contents** of this package's media/ directory to the bucket root without changing or flattening relative paths. Bind a custom R2 public domain or CDN hostname, then set S3_ENDPOINT, S3_BUCKET, S3_REGION=auto, S3_PUBLIC_ORIGIN, ASSET_STORAGE_ORIGIN, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY from .env.example.

The app's /media/<legacy-file-name> route resolves every current historic file name through media-organizer-manifest.json and redirects to the copied R2/CDN object. No public website image needs to remain only as a hosted workspace URL. New dashboard uploads are written directly to the configured R2 bucket. The 22 unresolved archive files remain deliberately separated and must not be attached to a hotel until the exact property and branch are confirmed.

## 3. Create the local administrator account

Generate a dedicated password hash on your own computer:

~~~bash
node scripts/generate-password-hash.mjs 'use-a-unique-password-with-16-or-more-characters'
~~~

Set AUTH_PROVIDER=local, VITE_AUTH_PROVIDER=local, AUTH_ADMIN_EMAIL, the generated AUTH_ADMIN_PASSWORD_HASH, and a random JWT_SECRET of at least 32 characters. The administrator signs in at /admin/login and can manage hotels, gallery references, reviews, and general settings.

## 4. Deploy from GitHub to Render

Commit this package to a new **private** GitHub repository. In Render, select **New + → Blueprint**, connect the repository, and let Render read render.yaml. Enter every value marked sync: false from .env.example in Render's secret configuration. Set CANONICAL_ORIGIN to the final HTTPS Render or custom-domain URL after it is assigned. Render supplies PORT automatically and uses /healthz for health checks.

## 5. Verify before launch

~~~bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
NODE_ENV=production pnpm start
~~~

Confirm the public home, hotel detail, language paths, inquiry form, /admin/login, an R2 media redirect, and the production database migrations before sharing the public URL.

## Security and content safeguards

Keep all secrets in the host secret manager. Do not upload or commit a plaintext administrator password. Keep the provided SHA-256 manifest with the original media backup. The dashboard's gallery removal action removes a database reference; object deletion from R2 must be deliberately managed as a separate operational step.
`);

  const packageJson = JSON.parse(await text("package.json"));
  packageJson.name = "al-ghanem-travel-production";
  delete packageJson.devDependencies["vite-plugin-manus-runtime"];
  delete packageJson.pnpm.patchedDependencies;
  await replace("package.json", JSON.stringify(packageJson, null, 2));
  await cp(externalLockfile, path.join(output, "pnpm-lock.yaml"), { force: true });
}

async function copyMedia() {
  await mkdir(path.join(output, "media"), { recursive: true });
  await cp(path.join(sourceMedia, "media"), path.join(output, "media"), { recursive: true });
  await cp(path.join(liveSiteMedia, "by-hotel"), path.join(output, "media/live-site-files"), { recursive: true });
  await cp(destinationPlaceholder, path.join(output, "media/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg"));
  const ownerManifest = JSON.parse(await readFile(path.join(sourceMedia, "media-organizer-manifest.json"), "utf8"));
  const liveManifest = JSON.parse(await readFile(path.join(liveSiteMedia, "live-site-media-manifest.json"), "utf8"));
  const liveEntries = Array.isArray(liveManifest.entries) ? liveManifest.entries : [];
  const liveKeys = new Set(liveEntries.map(entry => entry.storageKey).filter(Boolean));
  const ownerEntries = Array.isArray(ownerManifest.manifest) ? ownerManifest.manifest : [];
  const externalOwnerEntries = ownerEntries
    .filter(entry => !liveKeys.has(entry.fileName))
    .map(entry => ({ ...entry, destinationPath: String(entry.destinationPath || "").replace(/^media\//, "") }));
  const externalLiveEntries = liveEntries.map(entry => ({
    status: "verified-live-site-image",
    fileName: entry.storageKey,
    hotelName: entry.hotelName,
    sourceUrl: entry.url,
    destinationPath: entry.relativePath,
    contentType: entry.contentType,
    bytes: entry.bytes,
    sha256: entry.sha256,
  }));
  await writeFile(path.join(output, "media/media-organizer-manifest.json"), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    source: "Al Ghanem Travel external delivery media inventory",
    totalLiveSiteImages: externalLiveEntries.length,
    downloadedLiveSiteImages: externalLiveEntries.length,
    unresolvedOwnerUploadFiles: 22,
    manifest: [...externalOwnerEntries, ...externalLiveEntries],
  }, null, 2)}\n`, "utf8");
  await replace("media/MEDIA_TRANSFER.md", `
# Media transfer manifest

Upload the **contents** of this directory to the root of the Cloudflare R2 bucket without renaming or flattening paths. The application resolves every legacy image name through media-organizer-manifest.json and the configured CDN origin.

| Status | Files | Operational rule |
|---|---:|---|
| Verified live-site image files | ${liveEntries.length} | Retain under live-site-files/<hotel-folder>/ and preserve paths. These are the physical files backing the current static site images. |
| Confirmed owner-archive mappings | 417 owner-upload mappings plus 2 verified Dallah supplements | Retain under by-hotel/<hotel-slug>/ as an organized archive. |
| Unresolved owner uploads | 22 | Keep isolated under unresolved-owner-upload/; do not publish or map until the exact property and branch are verified. |
`);
}

async function main() {
  await copySource();
  await writeExternalRuntime();
  await writeExternalConfigs();
  await copyMedia();
  console.log(output);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

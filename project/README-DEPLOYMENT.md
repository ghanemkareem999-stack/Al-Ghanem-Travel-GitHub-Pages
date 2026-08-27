# Al Ghanem Travel — independent deployment

This repository is an Express, Vite SSR, tRPC, Drizzle, and MySQL/TiDB application. It can run outside the current managed workspace with an external database, external object storage/CDN, and an administrator login configured through environment variables.

> The production package deliberately does **not** contain secrets, a populated production database, or a plaintext administrator password. Create those values in the target host's secret manager.

## What is included in the delivery archive

| Item | Location in the delivery archive | Purpose |
|---|---|---|
| Application source | `source/` | Frontend, Express/tRPC backend, dashboard, tests, and Drizzle schema. |
| Schema migrations | `source/drizzle/` | Database tables and the site-settings migration. |
| Organized media | `media/` | Hotel-specific external-media folders, unresolved assets, checksummed manifest, and audit logs. |
| Environment template | `source/DEPLOYMENT_ENV_TEMPLATE.txt` | Required external runtime variables without values. |
| Media decision logs | `source/docs/generated/` and `media/` | Exact mapping audit and unresolved-asset decision log. |

## 1. Prepare the database

Create a MySQL 8 or TiDB database and set `DATABASE_URL` in your host's environment configuration. Copy the variable names from `DEPLOYMENT_ENV_TEMPLATE.txt` into the target host's secret manager. From `source/`, install dependencies with `pnpm install --frozen-lockfile`, then apply the checked-in Drizzle SQL migrations in their numbered order. The current source includes the `site_settings` table used by the protected **General settings** page.

Do not copy a development `.env` file or any hosted workspace credentials into an external deployment.

## 2. Create the independent administrator login

Set `AUTH_PROVIDER=local` and `VITE_AUTH_PROVIDER=local`. Select one dedicated administrator email for `AUTH_ADMIN_EMAIL`, then generate the password hash locally:

```bash
node scripts/generate-password-hash.mjs 'use-a-unique-password-with-16-or-more-characters'
```

Put the printed value into `AUTH_ADMIN_PASSWORD_HASH`. Set a random `JWT_SECRET` of at least 32 characters. The administrator signs in at `/admin/login`; the dashboard then uses the same protected routes for hotel CRUD, image-gallery CRUD, review moderation, and General settings.

## 3. Publish the organized media

The delivery archive's `media/` directory is deliberately outside the application source. Upload it **without changing its relative paths** to a HTTPS-backed bucket or CDN. Set `ASSET_STORAGE_ORIGIN` to that media root and set `EXTERNAL_MEDIA_MANIFEST_PATH` to the included `media-organizer-manifest.json` file on the server.

The server maps existing `/manus-storage/<legacy-file-name>` paths through this manifest before redirecting them to the external media origin. This preserves the current catalogue image references without placing large files in `client/public`.

| Media status | Count | Handling |
|---|---:|---|
| Exact current hotel-gallery mappings | 417 | Stored under `media/by-hotel/<hotel-slug>/`. |
| Unresolved owner-upload files | 22 | Stored under `media/unresolved-owner-upload/`; do not attach automatically. |
| Ambiguous mappings | 0 | No duplicate filename-to-hotel mapping was found. |

Two current Dallah Taibah gallery images were added from the official source after the owner archive; preserve those files from the full project media export when building the CDN migration.

## 4. Configure new dashboard uploads

For a fully independent upload path, set `STORAGE_PROVIDER=s3` and configure `S3_BUCKET`, `S3_REGION`, `S3_PUBLIC_ORIGIN`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`. S3-compatible services may also use `S3_ENDPOINT`. New uploads from the dashboard will then go directly to that storage provider.

The managed-storage fallback remains only for compatibility with the currently hosted site; do not set its variables in an independent production deployment.

## 5. Build and run

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
NODE_ENV=production pnpm start
```

The server listens on `PORT`; use the external host's supplied port. `GET /healthz` provides a lightweight health check.

## Hosting notes

| Host type | Recommended setup |
|---|---|
| Render or another Node web service | Use the included `render.yaml` as a starting point, set all values from `.env.example` in the host secret manager, and attach a managed MySQL-compatible database plus object storage/CDN. |
| VPS | Use Node 22, a process manager such as systemd or PM2, a reverse proxy such as Nginx or Caddy, HTTPS, and external MySQL/object storage. |
| Vercel | The frontend build can be hosted there, but the current Express SSR/tRPC server needs an Express-compatible server-function adapter and persistent MySQL/object storage configuration before using Vercel. Render or a VPS is the direct deployment route supplied by this project. |

## Operational safeguards

The General settings page changes the English homepage default, public WhatsApp/email/Facebook channels, and baseline English SEO. Hotel records should be saved as drafts before publishing. The image gallery remove control deletes the database reference only; it does not erase the underlying object from external storage. Keep original media backups and use the included SHA-256 manifest to verify transfers.

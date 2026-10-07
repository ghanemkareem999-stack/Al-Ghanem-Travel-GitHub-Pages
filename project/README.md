# Al Ghanem Travel

This repository contains the multilingual Al Ghanem Travel B2B accommodation directory for Madinah. It uses React, Vite, Express, tRPC, Drizzle, and MySQL/TiDB. Public interfaces are available in Arabic, English, Malay, Urdu, Indonesian, and Hindi.

## Run locally

Use Node.js 22 and pnpm.

```bash
pnpm install
pnpm dev
```

Run the verification suite before a release.

```bash
pnpm check
pnpm test
```

## Configuration

Use `docs/environment-setup.md` as a list of required configuration keys. Never commit a populated `.env` file, database URL, API key, token, or user session. The managed deployment provides its own secrets and storage credentials. For an external Node.js/MySQL deployment, start with `docs/external-hosting-transfer.md`.

## Project layout

| Path | Purpose |
| --- | --- |
| `client/` | React public site, pages, components, and multilingual interface text. |
| `server/` | Express server, tRPC routers, authorization, and database access. |
| `drizzle/` | Database schema and generated migrations. |
| `docs/` | Owner guides, launch notes, gallery decision logs, and research records. |
| `storage/` | Server-side helpers for managed object storage. |
| `todo.md` | Historical project checklist and open owner-dependent work. |

## Hotel content and images

Customer-visible hotel records are held in `client/src/lib/portfolio.ts` and the authenticated owner workspace at `/admin/hotels`. Large hotel images are stored in managed object storage and referenced by `/manus-storage/...` URLs; they are intentionally not copied into this repository. When self-hosting, mirror authorized image objects to an HTTPS object-storage origin and set `ASSET_STORAGE_ORIGIN` as described in `docs/external-hosting-transfer.md`. Follow the Arabic owner guide at `docs/دليل-إدارة-موقع-الغانم-ترافل.md` before changing hotel names, facts, locations, or imagery.

The owner workspace supports creating, loading for edit, publishing, removing, and uploading rights-evidenced images for controlled hotel records. Its access is protected by the project authentication and the `admin` user role; it does not use a password embedded in the source. See `docs/owner-hotel-workspace.md` for the operational guide.

## Operational notes

The site uses Al Ghanem Travel as the sole customer contact. Do not add hotel-direct contact, ratings, reviews, amenities, routes, or media unless they are supported by the established verification workflow. See `docs/launch-guide.md` for deployment and domain steps.

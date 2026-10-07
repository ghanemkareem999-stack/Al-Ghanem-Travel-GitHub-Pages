# Al Ghanem Travel — Delivery Package

This delivery archive is organised into two top-level folders:

| Folder | Contents |
| --- | --- |
| `source/` | Current React/Vite/Express/tRPC/Drizzle source code, the protected `/admin/hotels` workspace, database schema, tests, deployment configuration, and project documentation. |
| `media/` | Offline copy of the hotel and site image files available at packaging time, together with a manifest mapping each filename to its `/manus-storage/` path. |

## Start on an external Node.js host

Use **Node.js 22** and pnpm. From the `source/` folder:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm test
```

Create a new MySQL or TiDB database. Configure the required secret environment variables described in `source/docs/environment-setup.md`, then apply the schema once:

```bash
pnpm run db:push
pnpm run build
pnpm start
```

The server honours the host-provided `PORT` and exposes `GET /healthz` for a deployment health check. `source/render.yaml` gives a concrete Node.js web-service example; a standard VPS can use the same build and start commands behind HTTPS.

## Images

The application references managed image paths such as `/manus-storage/example.jpg`. Upload the files from `media/` to an HTTPS object-storage provider while preserving the filename/key mapping in `media/manifest.txt`. Set `ASSET_STORAGE_ORIGIN` to that storage origin before publishing the external site. Do **not** copy the image collection into `client/public` or `client/src/assets`.

## Important external-hosting requirements

This archive deliberately does **not** contain secrets, current database contents, OAuth tokens, object-storage credentials, map credentials, or email-service credentials. Create fresh credentials in the destination environment. The public directory works after database and storage configuration; the owner dashboard additionally requires replacing the current platform OAuth integration with an external OAuth provider and assigning the administrator role in the destination database.

The current server is deployment-ready for a **Node.js web-service or VPS** after that configuration. A serverless-only platform such as Vercel may require a platform-specific Express/serverless adapter and separate database and object-storage setup; it is not a drop-in deployment target for the existing long-running server.

Read `source/docs/external-hosting-transfer.md` before launch. It documents the secrets, image migration, database procedure, and verification checklist in detail.

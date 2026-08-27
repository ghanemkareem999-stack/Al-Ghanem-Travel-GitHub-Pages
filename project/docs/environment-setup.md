# Environment setup reference

This project is designed to receive configuration through the deployment environment. No secret values are included in this repository or its export archive.

| Variable | Purpose | Required for local self-hosting |
| --- | --- | --- |
| `DATABASE_URL` | MySQL/TiDB database connection. | Yes |
| `JWT_SECRET` | Signs authenticated sessions. | Yes |
| `CANONICAL_ORIGIN` | Public application origin used by SEO and redirects. | Yes |
| `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL` | Authentication integration. | If using the bundled authentication flow |
| `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY` | Managed server-side APIs and storage. | If using managed platform features |
| `VITE_FRONTEND_FORGE_API_URL`, `VITE_FRONTEND_FORGE_API_KEY` | Browser-side managed API proxy integration. | If using map and managed browser features |
| `ASSET_STORAGE_ORIGIN` | HTTPS object-storage origin for a mirrored copy of the authorized hotel-image keys. It takes precedence over the managed storage proxy. | Yes, when running outside managed storage and public hotel images must remain available. |
| `RESEND_API_KEY` | Optional email delivery for notifications. | Optional |
| `VITE_GA4_MEASUREMENT_ID`, `VITE_GTM_ID`, `VITE_META_PIXEL_ID` | Consent-gated marketing measurement. | Optional |

> Add these values in the hosting provider’s secret or environment settings. Do not put real values in source files, documentation, a local file committed to Git, or an exported support archive.

For a platform-neutral transfer checklist, public-image migration requirement, and external OAuth/map limitations, see `docs/external-hosting-transfer.md`.

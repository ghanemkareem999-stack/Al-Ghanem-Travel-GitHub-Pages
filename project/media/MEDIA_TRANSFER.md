# Media transfer manifest

Upload the **contents** of this directory to the root of the Cloudflare R2 bucket without renaming or flattening paths. The application resolves every legacy image name through media-organizer-manifest.json and the configured CDN origin.

| Status | Files | Operational rule |
|---|---:|---|
| Verified live-site image files | 838 | Retain under live-site-files/<hotel-folder>/ and preserve paths. These are the physical files backing the current static site images. |
| Confirmed owner-archive mappings | 417 owner-upload mappings plus 2 verified Dallah supplements | Retain under by-hotel/<hotel-slug>/ as an organized archive. |
| Unresolved owner uploads | 22 | Keep isolated under unresolved-owner-upload/; do not publish or map until the exact property and branch are verified. |

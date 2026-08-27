# Al Ghanem Travel — live-site image delivery status

## Purpose

This record distinguishes the images currently published in the public website from owner-uploaded source files that remain intentionally unassigned. It accompanies the final IDM script and the external-hosting media archive.

## Current verified live-site set

| Item | Count | Status |
|---|---:|---|
| Static image URLs currently referenced by the live site and generated download tools | 838 | The incorrect exterior image removed from the Golden Tulip Al Ansar gallery is excluded; the remaining URLs were verified as non-empty `image/*` responses. |
| Physical copies prepared for external hosting | 838 | Stored under `media/live-site-files/<hotel-folder>/` in the external delivery build. |
| Reviewed direct hotel-image candidates now published | 366 | Mapped across 100 exact hotel-title groups without replacing the pre-existing gallery images. |
| Owner-provided Karam Al Saadah images now published | 7 | Added only to `karam-al-sada-madinah`, giving the hotel 8 gallery images including its existing exterior. |
| Owner-provided Qasr Al Ansar Golden Tulip images now published | 11 | Added only to `al-ansar-madinah`, giving the hotel 14 gallery images and keeping it separate from `golden-tulip-al-ansar-madinah`. |
| Public hotel profiles | 167 | 148 currently show at least one gallery or disclosed destination placeholder after removing the duplicate Dallah Taibah planning entry. |
| Public profiles still without a property gallery | 19 | No speculative image was assigned. |
| Disclosed destination-placeholder profiles | 7 | These are clearly labeled as destination imagery, not property photography. |

## Download and transfer files

| File | Use |
|---|---|
| `download-all-live-website-images-idm.bat` | IDM commands for all 838 current image files, arranged in per-hotel download folders. |
| `all-live-website-image-links-2026-08-27.txt` | The same 838 direct image URLs, grouped by hotel-folder label. |
| `live-site-media-manifest.json` | SHA-256 and content-type record for every downloaded physical image. |
| `media/media-organizer-manifest.json` in the external delivery build | Legacy URL to external object mapping for the independent R2/S3 deployment. |

## Files deliberately not published

The separate owner archive retains 22 files under `media/unresolved-owner-upload/`. They are physical files, not live website images, and have no hotel association sufficiently safe for publication. They should remain separate until the exact hotel and branch are confirmed. The 19 public records without a property gallery also remain without a substituted hotel image until a matching professional source becomes available.

## External-hosting rule

Upload the **contents** of the `media/` directory from the final external package to the root of the chosen R2/S3 bucket without renaming or flattening folder paths. Configure `ASSET_STORAGE_ORIGIN` and `EXTERNAL_MEDIA_MANIFEST_PATH` exactly as described in the package `.env.example`. The copied files then back every published image independently of the current managed hosting paths.

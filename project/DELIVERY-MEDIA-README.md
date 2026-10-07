# Media Folder Notes

The delivery package places the physical hotel and site images in `media/images/`. The source code does not load images from this folder in production; it continues to use `/manus-storage/...` references.

`media/manifest-current-managed-paths.txt` is the current unique list of managed paths referenced by the source at packaging time. Preserve each referenced filename/key when copying the physical files to your external object-storage provider, then configure `ASSET_STORAGE_ORIGIN` as described in `source/docs/external-hosting-transfer.md`.

Two Dallah Taibah official-gallery images added after the earlier offline export are included alongside the previously exported image collection. Files not referenced in the current manifest are retained only as an offline archive and should not be published or assigned to a hotel automatically.

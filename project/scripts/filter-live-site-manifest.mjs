import { readFileSync, writeFileSync } from "node:fs";

const manifestPath = "/home/ubuntu/webdev-static-assets/al-ghanem-travel/live-site-images-2026-08-27/live-site-media-manifest.json";
const removedStorageKey = "al-ansar-golden-tulip-exterior_0566de35.jpg";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const before = manifest.entries.length;
manifest.entries = manifest.entries.filter(entry => entry.storageKey !== removedStorageKey && !String(entry.relativePath).endsWith("/Golden Tulip Al Ansar/Hotel Exterior.jpg"));
if (manifest.entries.length !== before - 1) throw new Error(`Expected one removed entry, found ${before - manifest.entries.length}.`);
manifest.generatedAt = new Date().toISOString();
manifest.totalExpected = manifest.entries.length;
manifest.downloaded = manifest.entries.length;
manifest.failed = 0;
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Filtered ${removedStorageKey}; manifest now contains ${manifest.entries.length} entries.`);

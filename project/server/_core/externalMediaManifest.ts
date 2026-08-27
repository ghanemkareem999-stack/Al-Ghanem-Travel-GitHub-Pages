import fs from "node:fs";

type ManifestEntry = { fileName?: unknown; destinationPath?: unknown };
type MediaManifest = { manifest?: ManifestEntry[] };

let cachedPath = "";
let cachedMtime = 0;
let cachedLookup = new Map<string, string>();

function loadLookup(manifestPath: string) {
  try {
    const stats = fs.statSync(manifestPath);
    if (cachedPath === manifestPath && cachedMtime === stats.mtimeMs) return cachedLookup;
    const parsed = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as MediaManifest;
    const lookup = new Map<string, string>();
    for (const entry of parsed.manifest || []) {
      if (typeof entry.fileName !== "string" || typeof entry.destinationPath !== "string") continue;
      if (entry.destinationPath.includes("..") || entry.destinationPath.startsWith("/")) continue;
      lookup.set(entry.fileName, entry.destinationPath);
    }
    cachedPath = manifestPath;
    cachedMtime = stats.mtimeMs;
    cachedLookup = lookup;
    return lookup;
  } catch (error) {
    console.warn("[ExternalMediaManifest] Could not load media manifest:", error instanceof Error ? error.message : String(error));
    return cachedLookup;
  }
}

export function resolveExternalMediaKey(key: string) {
  const manifestPath = process.env.EXTERNAL_MEDIA_MANIFEST_PATH;
  if (!manifestPath) return key;
  return loadLookup(manifestPath).get(key) || key;
}

export function getExternalStorageUrl(origin: string, key: string): string | null {
  if (!origin) return null;

  const normalizedKey = key.replace(/^\/+/, "");
  if (
    !normalizedKey ||
    normalizedKey.split("/").some(segment => segment === "." || segment === "..")
  ) {
    throw new Error("Invalid storage key");
  }

  const base = new URL(origin.endsWith("/") ? origin : `${origin}/`);
  if (base.protocol !== "https:") {
    throw new Error("ASSET_STORAGE_ORIGIN must use HTTPS");
  }

  const assetUrl = new URL(normalizedKey, base);
  if (assetUrl.origin !== base.origin || !assetUrl.pathname.startsWith(base.pathname)) {
    throw new Error("Storage key resolves outside ASSET_STORAGE_ORIGIN");
  }

  return assetUrl.toString();
}

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";
import { getExternalStorageUrl } from "./_core/externalStorage";

function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error("Storage is not configured. Use STORAGE_PROVIDER=s3 with external S3 variables, or configure the current managed-storage fallback.");
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

function getExternalS3Config() {
  if (ENV.storageProvider !== "s3") return null;
  if (!ENV.s3Bucket || !ENV.s3Region || !ENV.s3PublicOrigin) {
    throw new Error("External S3 storage requires S3_BUCKET, S3_REGION, and S3_PUBLIC_ORIGIN.");
  }
  const client = new S3Client({
    region: ENV.s3Region,
    ...(ENV.s3Endpoint ? { endpoint: ENV.s3Endpoint, forcePathStyle: true } : {}),
  });
  return { client, bucket: ENV.s3Bucket, publicOrigin: ENV.s3PublicOrigin };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  const external = getExternalS3Config();
  if (external) {
    await external.client.send(new PutObjectCommand({ Bucket: external.bucket, Key: key, Body: data, ContentType: contentType }));
    const url = getExternalStorageUrl(external.publicOrigin, key);
    if (!url) throw new Error("External S3 public origin could not resolve the uploaded key.");
    return { key, url };
  }

  const { forgeUrl, forgeKey } = getForgeConfig();
  const presignUrl = new URL("v1/storage/presign/put", `${forgeUrl}/`);
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!presignResp.ok) throw new Error(`Managed storage presign failed (${presignResp.status}).`);
  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Managed storage returned an empty upload URL.");
  const body = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data as any], { type: contentType });
  const uploadResp = await fetch(s3Url, { method: "PUT", headers: { "Content-Type": contentType }, body });
  if (!uploadResp.ok) throw new Error(`Managed storage upload failed (${uploadResp.status}).`);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const external = getExternalS3Config();
  if (external) {
    const url = getExternalStorageUrl(external.publicOrigin, key);
    if (!url) throw new Error("External S3 public origin could not resolve the storage key.");
    return { key, url };
  }
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  const external = getExternalS3Config();
  if (external) return getSignedUrl(external.client, new GetObjectCommand({ Bucket: external.bucket, Key: key }), { expiresIn: 3600 });
  const { forgeUrl, forgeKey } = getForgeConfig();
  const getUrl = new URL("v1/storage/presign/get", `${forgeUrl}/`);
  getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!resp.ok) throw new Error(`Managed storage signed URL request failed (${resp.status}).`);
  const { url } = (await resp.json()) as { url: string };
  if (!url) throw new Error("Managed storage returned an empty download URL.");
  return url;
}

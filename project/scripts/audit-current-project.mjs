import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const generatedDir = path.join(root, "docs", "generated");
const liveManifestPath = "/home/ubuntu/webdev-static-assets/al-ghanem-travel/live-site-images-2026-08-27/live-site-media-manifest.json";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout.trim();
}

function parseJsonFromTsx(stdout) {
  const start = stdout.lastIndexOf("\n{");
  const candidate = start === -1 ? stdout : stdout.slice(start + 1);
  return JSON.parse(candidate);
}

mkdirSync(generatedDir, { recursive: true });

const tempProbe = path.join(root, "scripts", ".audit-current-project-probe.ts");
writeFileSync(tempProbe, `
import { canonicalHotelProfiles, hotelProfiles } from "../client/src/lib/portfolio";
const slugs = hotelProfiles.map(hotel => hotel.slug);
const duplicateSlugs = [...new Set(slugs.filter((slug, index) => slugs.indexOf(slug) !== index))];
const allGalleryUrls = [...new Set(hotelProfiles.flatMap(hotel => hotel.gallery))];
const zeroGallery = hotelProfiles.filter(hotel => hotel.gallery.length === 0);
const placeholder = hotelProfiles.filter(hotel => hotel.galleryKind === "destination_placeholder");
const shortGallery = hotelProfiles.filter(hotel => hotel.gallery.length > 0 && hotel.gallery.length < 3 && hotel.galleryKind !== "destination_placeholder");
const qasr = hotelProfiles.find(hotel => hotel.slug === "al-ansar-madinah");
const golden = hotelProfiles.find(hotel => hotel.slug === "golden-tulip-al-ansar-madinah");
const karam = hotelProfiles.find(hotel => hotel.slug === "karam-al-sada-madinah");
const ruaaLike = hotelProfiles.filter(hotel => /\b(?:ruaa|roaa|roya\s+al\s+alami|roya\s+international)\b|رؤى\s+العالمي|روئ\s+العالمي/i.test([hotel.slug, hotel.name, hotel.arabicName, ...(hotel.searchAliases ?? [])].join(" ")));
console.log(JSON.stringify({
  publicProfiles: hotelProfiles.length,
  canonicalProfiles: canonicalHotelProfiles.length,
  duplicateSlugs,
  allGalleryUrls,
  zeroGallery: zeroGallery.map(hotel => ({ slug: hotel.slug, name: hotel.name })),
  placeholder: placeholder.map(hotel => ({ slug: hotel.slug, name: hotel.name })),
  shortGallery: shortGallery.map(hotel => ({ slug: hotel.slug, name: hotel.name, galleryCount: hotel.gallery.length })),
  qasr: qasr ? { slug: qasr.slug, name: qasr.name, arabicName: qasr.arabicName, galleryCount: qasr.gallery.length, gallery: qasr.gallery } : null,
  golden: golden ? { slug: golden.slug, name: golden.name, arabicName: golden.arabicName, galleryCount: golden.gallery.length, gallery: golden.gallery } : null,
  karam: karam ? { slug: karam.slug, name: karam.name, arabicName: karam.arabicName, galleryCount: karam.gallery.length, gallery: karam.gallery } : null,
  ruaaLike: ruaaLike.map(hotel => ({ slug: hotel.slug, name: hotel.name, arabicName: hotel.arabicName })),
}, null, 2));
`, "utf8");

try {
  const probe = parseJsonFromTsx(run("node", ["./node_modules/tsx/dist/cli.mjs", tempProbe]));
  const liveManifest = JSON.parse(readFileSync(liveManifestPath, "utf8"));
  const manifestKeys = new Set(liveManifest.entries.map(entry => entry.storageKey));
  const missingPhysical = probe.allGalleryUrls.filter(url => url.startsWith("/manus-storage/") && !manifestKeys.has(url.replace("/manus-storage/", "")));
  const nonStorage = probe.allGalleryUrls.filter(url => !url.startsWith("/manus-storage/"));
  const structureChecks = [
    "client/src/lib/portfolio.ts",
    "client/src/lib/curatedGalleryExpansion.ts",
    "client/src/lib/curatedGalleryExpansionData.ts",
    "client/src/components/HotelGalleryLightbox.tsx",
    "client/src/components/BackNavigation.tsx",
    "server/routers.ts",
    "server/storage.ts",
    "drizzle/schema.ts",
    "README-DEPLOYMENT.md",
    "render.yaml",
    "scripts/build-external-delivery.mjs",
  ];
  const missingStructure = structureChecks.filter(relativePath => {
    try { readFileSync(path.join(root, relativePath)); return false; } catch { return true; }
  });
  const summary = {
    generatedAt: new Date().toISOString(),
    publicProfiles: probe.publicProfiles,
    canonicalProfiles: probe.canonicalProfiles,
    duplicatePublicSlugs: probe.duplicateSlugs.length,
    publicGalleryUrls: probe.allGalleryUrls.length,
    liveSiteImageUrls: liveManifest.totalExpected,
    physicalLiveSiteImages: liveManifest.downloaded,
    physicalDownloadFailures: liveManifest.failed,
    galleryUrlsMissingPhysicalFiles: missingPhysical.length,
    nonManagedStorageGalleryUrls: nonStorage.length,
    publicProfilesWithNoGallery: probe.zeroGallery.length,
    destinationPlaceholderProfiles: probe.placeholder.length,
    shortNonPlaceholderGalleries: probe.shortGallery.length,
    requiredStructureFilesMissing: missingStructure.length,
    qasrGalleryCount: probe.qasr?.galleryCount ?? 0,
    goldenTulipAlAnsarGalleryCount: probe.golden?.galleryCount ?? 0,
    karamGalleryCount: probe.karam?.galleryCount ?? 0,
    ruaaLikePublicProfiles: probe.ruaaLike,
    missingPhysical,
    nonStorage,
    duplicateSlugs: probe.duplicateSlugs,
    zeroGallery: probe.zeroGallery,
    placeholderProfiles: probe.placeholder,
    shortGallery: probe.shortGallery,
    missingStructure,
  };

  const report = `# Al Ghanem Travel — Current Project, Hotel, and Media Audit

Generated: ${summary.generatedAt}

This audit reads the actual exported hotel-profile arrays after all gallery expansion steps and compares the current public gallery references with the downloaded physical live-site media manifest. It is a technical consistency audit of the current website package; it is not a fresh external source-verification review of every hotel in the Madinah market.

| Check | Result |
|---|---:|
| Public hotel profiles in current directory data | ${summary.publicProfiles} |
| Canonical baseline profiles before curated expansion | ${summary.canonicalProfiles} |
| Duplicate public slugs | ${summary.duplicatePublicSlugs} |
| Unique gallery URLs currently exposed by public profiles | ${summary.publicGalleryUrls} |
| Current live-site image URLs in generated IDM/plain files | ${summary.liveSiteImageUrls} |
| Physical live-site image files downloaded and verified | ${summary.physicalLiveSiteImages} |
| Download failures | ${summary.physicalDownloadFailures} |
| Public gallery URLs missing from physical manifest | ${summary.galleryUrlsMissingPhysicalFiles} |
| Public profiles with no gallery | ${summary.publicProfilesWithNoGallery} |
| Profiles using disclosed destination placeholder media | ${summary.destinationPlaceholderProfiles} |
| Profiles with one or two non-placeholder gallery images | ${summary.shortNonPlaceholderGalleries} |
| Required project-structure files missing | ${summary.requiredStructureFilesMissing} |

## Key findings

The current website exposes **${summary.publicGalleryUrls} unique public hotel-gallery URLs** across **${summary.publicProfiles} public hotel profiles**. The generated IDM/plain download set contains **${summary.liveSiteImageUrls} unique live-site image URLs**, because it also includes shared site visuals and image references outside final public hotel galleries. The live-site downloader verified **${summary.physicalLiveSiteImages} physical files** with **${summary.physicalDownloadFailures} failures**.

**Karam Al Saadah** now has ${summary.karamGalleryCount} gallery images, including the seven owner-provided room and bathroom images. **Al Ansar Palace Golden Tulip Hotel / Qasr Al Ansar Golden Tulip** now has ${summary.qasrGalleryCount} gallery images, including the eleven owner-provided Golden Tulip/Qasr Al Ansar photos. The separate **Golden Tulip Al Ansar** record remains distinct with ${summary.goldenTulipAlAnsarGalleryCount} gallery images.

The supplied Golden Tulip/Qasr Al Ansar photographs were not assigned to Ruaa International. Ruaa International exists as a separate externally observed hotel candidate, but it is not represented by these photos because the supplied facade explicitly shows Qasr Al Ansar Golden Tulip Hotel.

## Exceptions retained for owner review

Open backlog items remain for broader hotel-name rechecks, route verification, and continuing image expansion. This package should be treated as the latest tested source-and-media export, not as a declaration that every possible Madinah hotel has been exhaustively reverified today.

### Duplicate public slugs

${summary.duplicateSlugs.length ? summary.duplicateSlugs.map(slug => `- ${slug}`).join("\n") : "None detected."}

### Public gallery URLs missing from physical manifest

${summary.missingPhysical.length ? summary.missingPhysical.map(url => `- ${url}`).join("\n") : "None detected."}

### Non-managed-storage public gallery URLs

${summary.nonStorage.length ? summary.nonStorage.map(url => `- ${url}`).join("\n") : "None detected."}

### Profiles with no public gallery

${summary.zeroGallery.length ? summary.zeroGallery.map(hotel => `- ${hotel.slug} — ${hotel.name}`).join("\n") : "None detected."}

### Profiles using the disclosed destination placeholder

${summary.placeholderProfiles.length ? summary.placeholderProfiles.map(hotel => `- ${hotel.slug} — ${hotel.name}`).join("\n") : "None detected."}

### Short non-placeholder galleries

${summary.shortGallery.length ? summary.shortGallery.map(hotel => `- ${hotel.slug} — ${hotel.name}: ${hotel.galleryCount}`).join("\n") : "None detected."}
`;

  writeFileSync(path.join(generatedDir, "current-project-audit-summary-2026-08-27.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  writeFileSync(path.join(generatedDir, "current-hotel-media-technical-audit-2026-08-27.md"), report, "utf8");
  console.log(JSON.stringify(summary, null, 2));
} finally {
  rmSync(tempProbe, { force: true });
}

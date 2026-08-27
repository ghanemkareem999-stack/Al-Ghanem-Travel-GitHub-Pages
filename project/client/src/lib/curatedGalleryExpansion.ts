import { curatedGalleryGroups } from "@/lib/curatedGalleryExpansionData";

type GalleryProfile = { slug: string; name: string; searchAliases?: string[]; gallery: string[] };

const STORAGE_ORIGIN = "https://ghanemtravel-mpamfjeg.manus.space";

const preferredPrimaryImageBySlug: Record<string, string> = {
  "dallah-taibah": "/manus-storage/dallah-taibah-exterior-owner-2026-08-27_8887ff8c.webp",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(hotel|madinah|medinah|alif\s*2|source branch name)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function curatedImagesBySlug(profiles: GalleryProfile[]) {
  const profileByIdentity = new Map<string, GalleryProfile>();
  for (const profile of profiles) {
    for (const identity of [profile.slug, profile.name, ...(profile.searchAliases || [])]) {
      profileByIdentity.set(normalize(identity), profile);
    }
  }
  const imagesBySlug = new Map<string, string[]>();
  for (const group of curatedGalleryGroups) {
    const identity = normalize(group.heading);
    const directMatch = profileByIdentity.get(identity);
    const fuzzyMatches = directMatch ? [directMatch] : profiles.filter(profile => {
      const values = [profile.slug, profile.name, ...(profile.searchAliases || [])].map(normalize);
      return values.some(value => value.includes(identity) || identity.includes(value));
    });
    if (fuzzyMatches.length !== 1 || !group.images.length) continue;
    const profile = fuzzyMatches[0];
    imagesBySlug.set(profile.slug, [...(imagesBySlug.get(profile.slug) || []), ...group.images]);
  }
  return imagesBySlug;
}

const galleryPriority = [
  /exterior|facade|entrance|front|building|tower|street|hotel[-_ ]?view|property[-_ ]?view/i,
  /lobby|reception|atrium|lounge|public|common[-_ ]?area/i,
  /dining|restaurant|breakfast|cafe/i,
  /room|suite|bed|guest/i,
  /bathroom|bath|washroom/i,
];

/** Moves a clearly labelled exterior/property view to the lead position without guessing from unlabeled imagery. */
export function orderGalleryForDisplay(images: string[]): string[] {
  const exteriorIndex = images.findIndex(image => galleryPriority[0].test(image));
  if (exteriorIndex <= 0) return images;
  const ranked = images.map((image, index) => ({ image, index, rank: galleryPriority.findIndex(pattern => pattern.test(image)) }));
  if (exteriorIndex < 0) return images;
  return ranked
    .sort((a, b) => (a.rank < 0 ? galleryPriority.length : a.rank) - (b.rank < 0 ? galleryPriority.length : b.rank) || a.index - b.index)
    .map(item => item.image);
}

/** Appends reviewed direct property images and applies the small set of owner-approved primary-image replacements. */
export function appendCuratedGalleryExpansion<T extends GalleryProfile>(profiles: T[]): T[] {
  const imagesBySlug = curatedImagesBySlug(profiles);
  return profiles.map(profile => {
    const curated = imagesBySlug.get(profile.slug) || [];
    const preferredPrimary = preferredPrimaryImageBySlug[profile.slug];
    if (!curated.length && !preferredPrimary) return profile;
    const existing = new Set(profile.gallery.map(image => image.startsWith("/") ? `${STORAGE_ORIGIN}${image}` : image));
    const extra = curated.filter(image => !existing.has(`${STORAGE_ORIGIN}${image}`));
    const retainedGallery = preferredPrimary ? profile.gallery.slice(1) : profile.gallery;
    const gallery = preferredPrimary ? [preferredPrimary, ...retainedGallery, ...extra] : [...profile.gallery, ...extra];
    return (preferredPrimary || extra.length) ? { ...profile, gallery: Array.from(new Set(gallery)) } : profile;
  });
}

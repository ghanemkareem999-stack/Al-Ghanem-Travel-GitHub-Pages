import { locales, type Locale } from "@/lib/i18n";
import { planningCopy } from "@/lib/planningCopy";
import { appendCuratedGalleryExpansion } from "@/lib/curatedGalleryExpansion";
import { madinahPlanningHotels, type MadinahDirectoryZone, type MadinahPlanningHotel } from "@shared/madinahPlanning";

type RoomDetail = { name: string; detail: string };
type HotelContent = { summary: string; highlights: string[]; amenities: string[]; rooms: RoomDetail[]; nearby: Record<string, string> };
type VerificationMetadata = {
  evidenceLevel: "official_property" | "map_listing" | "planning_record";
  reviewedOn?: string;
  routeReviewedOn?: string;
  locationStatus: "named_gate_verified" | "property_point_reviewed" | "not_published";
  editorialNote: string;
};

export type HotelProfile = {
  slug: string;
  name: string;
  arabicName?: string;
  searchAliases?: string[];
  city: "madinah" | "makkah";
  category: "premium" | "executive" | "value";
  status: "verified" | "verification_pending" | "planning_record";
  proximityBand: "haram_side" | "central" | "city" | "transfer";
  corporateReady: boolean;
  address: string;
  mapAddress?: string;
  googleMapsPlaceUrl?: string;
  sourceUrl?: string;
  gallery: string[];
  galleryKind?: "property" | "destination_placeholder";
  galleryNote: string;
  nearbySites: Array<{ key: "nabawi" | "baqi" | "kingFahadGate"; address: string }>;
  content: Record<Locale, HotelContent>;
  nearestGate?: { name: string; address: string };
  planning?: Pick<MadinahPlanningHotel, "zone" | "grade" | "distanceEstimate" | "walkingEstimate" | "vehicleEstimate" | "accessMode" | "routeReview">;
  verification: VerificationMetadata;
};

type HotelProfileDraft = Omit<HotelProfile, "verification">;

export const legacyHotelSlugAliases = {
  "al-aqiq-madinah": "millennium-madinah",
} as const;

export type OwnerPublishedHotelRecord = {
  slug: string; category: HotelProfile["category"]; citySlug: string; googleMapsPlaceUrl: string | null; locationVerifiedAt: Date | null; routeVerifiedAt: Date | null; nearestGateName: string | null; nearestGateAddress: string | null; directoryZone: string | null; sourceStatus: "planning" | "official" | "partner_verified"; accessMode: "walkable" | "transfer_advised" | null; corporateReady: boolean; translations: Array<{ locale: string; name: string; shortDescription: string | null; longDescription: string | null; address: string | null }>; gallery: string[];
};

export function ownerPublishedProfile(record: OwnerPublishedHotelRecord): HotelProfile | null {
  const english = record.translations.find(item => item.locale === "en");
  const arabic = record.translations.find(item => item.locale === "ar");
  if (!english?.name || !english.address || !record.googleMapsPlaceUrl || !record.locationVerifiedAt) return null;
  const localized = Object.fromEntries(locales.map(locale => {
    const translated = record.translations.find(item => item.locale === locale) ?? english;
    return [locale, { summary: translated.shortDescription || english.shortDescription || english.name, highlights: [], amenities: [], rooms: [], nearby: { nabawi: locale === "ar" ? "المسجد النبوي" : "Al-Masjid an-Nabawi" } }];
  })) as unknown as Record<Locale, HotelContent>;
  const namedGate = record.nearestGateName && record.nearestGateAddress && record.routeVerifiedAt ? { name: record.nearestGateName, address: record.nearestGateAddress } : undefined;
  const proximityBand: HotelProfile["proximityBand"] = record.accessMode === "transfer_advised" ? "transfer" : record.directoryZone?.startsWith("central_") ? "central" : "city";
  return { slug: record.slug, name: english.name, arabicName: arabic?.name, city: record.citySlug === "makkah" ? "makkah" : "madinah", category: record.category, status: "verified", proximityBand, corporateReady: record.corporateReady, address: english.address, mapAddress: english.address, googleMapsPlaceUrl: record.googleMapsPlaceUrl, gallery: record.gallery, galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: localized, nearestGate: namedGate, verification: { evidenceLevel: "official_property", reviewedOn: record.locationVerifiedAt.toISOString().slice(0, 10), routeReviewedOn: record.routeVerifiedAt?.toISOString().slice(0, 10), locationStatus: namedGate ? "named_gate_verified" : "property_point_reviewed", editorialNote: "Owner-managed published record" } };
}

const gallery = ["/manus-storage/al-ghanem-suite_7157df1b.jpg", "/manus-storage/al-ghanem-meeting_a8dfe2c7.jpg", "/manus-storage/al-ghanem-facade_a96099eb.jpg"];
const madinahDestinationPlaceholder = "/manus-storage/madinah-directory-placeholder-2026-08-25_d4dcf8bd.jpg";
const destinationPlaceholderPlanningSlugs = new Set(["sidrat-al-madina", "sidra-alia-al-dahabi-madinah", "taqwa-manazil-madina", "karam-al-sada-madinah"]);

const reviewedMapDetails: Partial<Record<string, Partial<Pick<HotelProfile, "mapAddress" | "googleMapsPlaceUrl" | "nearbySites" | "nearestGate" | "gallery">>>> = {
  "pullman-zamzam-madinah": {
    mapAddress: "Pullman Zamzam Madinah, Amr Bin Al Gmoh Street, Madinah, Saudi Arabia",
    gallery: ["/manus-storage/03_pullman_zamzam_madina__view__01_37e4f69c.webp", "/manus-storage/pullman-zamzam-madinah-room-2026_a609d9bb.jpg", "/manus-storage/pullman-zamzam-madinah-lobby-2026_cedd2947.jpg"],
    nearbySites: [
      { key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" },
      { key: "baqi", address: "Al Baqi Cemetery, Madinah, Saudi Arabia" },
    ],
    nearestGate: { name: "Al Salam Gate", address: "Al Salam Gate, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" },
  },
  "dar-al-iman-intercontinental": {
    mapAddress: "InterContinental Dar Al Iman Madinah, Badaah, Madinah, Saudi Arabia",
    nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
  },
  "anwar-al-madinah-movenpick": {
    mapAddress: "Anwar Al Madinah Movenpick, Badaah, Madinah, Saudi Arabia",
    nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    nearestGate: { name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" },
  },
  "le-meridien-madinah": {
    mapAddress: "Le Meridien Medina, Said Bin Al Aas Street, Al Jamiah, Madinah 42351, Saudi Arabia",
    googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Le%20Meridien%20Medina%2C%20Madinah%2C%20Saudi%20Arabia",
  },
  "eman-royal": {
    mapAddress: "Eman Royal Hotel, North Central Area, King Faisal Road, Budaah, Madinah 42311, Saudi Arabia",
    googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Eman%20Royal%20Hotel%20Madinah%2C%20Madinah%2C%20Saudi%20Arabia",
  },
  "al-nokhba-madinah": {
    mapAddress: "Maden Hotel (Al Nokhba Royal Inn), King Fahd Street, Madinah, Saudi Arabia",
    googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Maden%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
  },
  "rawdah-al-aqiq": {
    mapAddress: "Rawdah Al Aqeeq Hotel, Saeed Ibn Al Qureshi Street, Salman Al Farsi, Madinah 42311, Saudi Arabia",
    googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Rawdah%20Al%20Aqeeq%20Hotel%20Madinah%2C%20Madinah%2C%20Saudi%20Arabia",
  },
  "al-aqiq-madinah": {
    mapAddress: "Al Aqeeq Hotel, Musab bin Omeir Street, Budaah, Madinah 42313, Saudi Arabia",
    googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Aqeeq%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
  },
};

const authorizedMediaGalleries: Partial<Record<string, string[]>> = {
  "le-meridien-madinah": ["/manus-storage/le-meridien-madinah-exterior-2026_57705004.jpg", "/manus-storage/le-meridien-madinah-room-2026_94f3204e.jpg", "/manus-storage/le-meridien-madinah-restaurant-2026_396bee31.jpg"],
  "eman-royal": ["/manus-storage/10_eiman_royal_madinah__exterior__01_53ee85e5.webp", "/manus-storage/10_eiman_royal_madinah__exterior__02_acbccd01.webp", "/manus-storage/eman-royal-madinah-lobby-2026_d3c2ae46.jpg"],
  "coral-madinah": ["/manus-storage/rua-al-hijrah-exterior-2026_9294fda3.jpg", "/manus-storage/rua-al-hijrah-room-2026_d7df4501.jpg", "/manus-storage/rua-al-hijrah-lobby-2026_5f2cc9db.jpg"],
  "al-ansar-madinah": [
    "/manus-storage/al-ansar-palace-golden-tulip-exterior-2026_323a3f6c.jpg",
    "/manus-storage/al-ansar-palace-golden-tulip-room-2026_183cb509.jpg",
    "/manus-storage/al-ansar-palace-golden-tulip-lobby-2026_5b8abc0e.jpg",
    "/manus-storage/qasr-al-ansar-golden-tulip-exterior-night-owner-2026-08-27_8a225d90.png",
    "/manus-storage/qasr-al-ansar-golden-tulip-reception-owner-2026-08-27_dcf32099.png",
    "/manus-storage/qasr-al-ansar-golden-tulip-lobby-owner-2026-08-27_0832ab00.jpg",
    "/manus-storage/qasr-al-ansar-golden-tulip-corridor-owner-2026-08-27_a2096a36.jpg",
    "/manus-storage/qasr-al-ansar-golden-tulip-facade-owner-2026-08-27_ffebae33.jpg",
    "/manus-storage/qasr-al-ansar-golden-tulip-tower-facade-owner-2026-08-27_b8bbdc3b.png",
    "/manus-storage/qasr-al-ansar-golden-tulip-triple-room-a-owner-2026-08-27_20becd0b.png",
    "/manus-storage/qasr-al-ansar-golden-tulip-triple-room-b-owner-2026-08-27_b22f7bfd.png",
    "/manus-storage/qasr-al-ansar-golden-tulip-twin-room-a-owner-2026-08-27_cf09e0a3.png",
    "/manus-storage/qasr-al-ansar-golden-tulip-twin-room-b-owner-2026-08-27_d669d001.png",
    "/manus-storage/qasr-al-ansar-golden-tulip-double-room-owner-2026-08-27_b8362bc9.png",
  ],
  "al-mokhtara-golden": ["/manus-storage/al-mokhtara-golden-exterior-2026_790739f0.jpg", "/manus-storage/al-mokhtara-golden-room-2026_87c19459.jpg", "/manus-storage/al-mokhtara-golden-lobby-2026_358d2fef.jpg"],
  "al-waha-hotel-madinah": ["/manus-storage/hayah-al-waha-exterior-2026_99887d95.jpg", "/manus-storage/hayah-al-waha-room-2026_7e986d6c.jpg", "/manus-storage/hayah-al-waha-lobby-2026_bf161e3d.jpg"],
  "al-mokhtara-international": ["/manus-storage/15_mokhtara_international__exterior__01_3cee8d58.webp", "/manus-storage/15_mokhtara_international__exterior__02_01a4cd8c.webp"],
  "al-durrah-madinah": ["/manus-storage/durrat-al-madinah-hotel-exterior-2026_0317a1b8.jpg", "/manus-storage/durrat-al-madinah-hotel-room-2026_62d01097.jpg", "/manus-storage/durrat-al-madinah-hotel-lobby-2026_b8611147.jpg"],
  "al-nokhba-madinah": ["/manus-storage/maden-hotel-exterior-2026_d2fdef5f.jpg", "/manus-storage/maden-hotel-room-2026_52ec9449.jpg", "/manus-storage/maden-hotel-lobby-2026_d0cb5c07.jpg"],
  "rawdah-al-aqiq": ["/manus-storage/rawdah-al-aqeeq-exterior-2026_64cd07c8.jpg", "/manus-storage/rawdah-al-aqeeq-room-2026_3b4a1978.jpg", "/manus-storage/rawdah-al-aqeeq-lobby-2026_ef5cb649.jpg"],
  "al-diyafah-serviced-apartments": ["/manus-storage/22_al_diyafah_apartments__lobby__01_5c3afae7.webp", "/manus-storage/22_al_diyafah_apartments__room__01_6a59f28e.webp"],
  "al-sultan-madinah": ["/manus-storage/25_sultan_madinah__exterior__01_68f1168a.webp"],
  "marriott-madinah": ["/manus-storage/26_madinah_marriott__exterior__01_b726affc.webp", "/manus-storage/26_madinah_marriott__exterior__02_9c65f214.webp"],
  "crowne-plaza-madinah": ["/manus-storage/27_crowne_plaza_madinah__exterior__01_8c5800be.webp", "/manus-storage/27_crowne_plaza_madinah__room__01_6ad55214.webp"],
  "al-aqiq-madinah": ["/manus-storage/28_al_aqeeq_madinah__room__01_00aa494e.webp", "/manus-storage/28_al_aqeeq_madinah__room__02_72956266.webp"],
  "al-waqf-serviced-apartments": ["/manus-storage/24_waqf_othman_bin_affan__room__01_2de361b4.webp", "/manus-storage/24_waqf_othman_bin_affan__room__02_a72aec75.webp"],
  "sheraton-madinah": ["/manus-storage/32_sheraton_madinah__exterior__01_be2d434d.webp", "/manus-storage/32_sheraton_madinah__exterior__02_572e74c3.webp"],
  "shaza-madinah": ["/manus-storage/shaza-regency-plaza-exterior-2026_ed25e7c0.webp", "/manus-storage/shaza-regency-plaza-room-2026_c98d40b7.jpg", "/manus-storage/shaza-regency-plaza-lobby-2026_a89bf720.jpg"],
  "al-awali-serviced-apartments": ["/manus-storage/37_al_awali_apartments__room__01_a68d3bf7.webp"],
  "al-rehab-madinah": ["/manus-storage/rehab-taba-hotel-exterior-2026_1ca0c523.jpg", "/manus-storage/rehab-taba-hotel-room-2026_6baf5b1b.jpg", "/manus-storage/rehab-taba-hotel-lobby-2026_36ea37de.jpg"],
  "al-ferdous-madinah": ["/manus-storage/39_al_firdous__exterior__01_d700157a.webp"],
  "nusk-al-eman-hotel": ["/manus-storage/nusk-al-eman-exterior_4d999c54.jpg", "/manus-storage/nusk-al-eman-lobby_76a20dbe.jpg"],
  "sidrat-al-madina": ["/manus-storage/sidrat-al-madina-exterior_a60ebca0.jpg"],
  "sidra-alia-al-dahabi-madinah": ["/manus-storage/sidra-alia-01_72e009c1.jpg", "/manus-storage/sidra-alia-02_0cd1edb6.jpg", "/manus-storage/sidra-alia-lobby_2a037312.jpg"],
  "taqwa-manazil-madina": ["/manus-storage/taqwa-manazil-exterior_5ce8fdd8.jpg", "/manus-storage/taqwa-manazil-corridor_304a43f8.jpg", "/manus-storage/taqwa-manazil-lobby_f07693db.jpg"],
  "karam-al-sada-madinah": [
    "/manus-storage/karam-al-sada-exterior_dddcc30c.jpg",
    "/manus-storage/karam-al-saadah-triple-room-a-owner-2026-08-27_64f2bc5a.png",
    "/manus-storage/karam-al-saadah-triple-room-b-owner-2026-08-27_6fdde471.png",
    "/manus-storage/karam-al-saadah-family-room-owner-2026-08-27_abf386c5.png",
    "/manus-storage/karam-al-saadah-triple-room-c-owner-2026-08-27_cd37de23.png",
    "/manus-storage/karam-al-saadah-bathroom-owner-2026-08-27_c232bec4.png",
    "/manus-storage/karam-al-saadah-family-room-d-owner-2026-08-27_f1f7e4c9.png",
    "/manus-storage/karam-al-saadah-room-desk-owner-2026-08-27_ea734fff.png",
  ],
};

/** Supplied hotel imagery is appended only where the package's hotel identity matches a public profile. */
const suppliedHotelGalleries: Partial<Record<string, string[]>> = {
  "dar-al-eiman-grand-madinah": ["/manus-storage/exterior-trip-medina_03d41764.jpg"],
  "luluat-al-diyafa-madinah": ["/manus-storage/luluat-al-diyafa-madinah-exterior_f5768722.jpg", "/manus-storage/luluat-al-diyafa-madinah-room_a146bf76.jpg", "/manus-storage/luluat-al-diyafa-madinah-room-alt_5b84b4e8.jpg"],
  "jiwar-taiba-madinah": ["/manus-storage/jiwar-taiba-madinah-exterior_9e2bbc5d.jpg", "/manus-storage/jiwar-taiba-madinah-room_ce340cf6.jpg", "/manus-storage/jiwar-taiba-madinah-lobby_310d83cd.jpg"],
  "belvedere-hotel-madinah": ["/manus-storage/belvedere-hotel-madinah-lobby_a664a0c2.jpg", "/manus-storage/belvedere-hotel-madinah-room_88df16de.jpg", "/manus-storage/belvedere-hotel-madinah-suite_130e06fb.jpg"],
  "worth-peninsula-madinah": ["/manus-storage/worth-peninsula-madinah-exterior_82c6f72e.jpg", "/manus-storage/worth-peninsula-madinah-room_3a557abc.jpg", "/manus-storage/worth-peninsula-madinah-lobby_f5c4d204.jpg"],
  "golden-madinah-hotel": ["/manus-storage/golden-madinah-hotel-exterior_02f50b8b.jpg", "/manus-storage/golden-madinah-hotel-room_fea1fe0c.jpg", "/manus-storage/golden-madinah-hotel-lobby_fa1b088d.jpg"],
  "abraj-al-marzam-madinah": ["/manus-storage/abraj-al-marzam-madinah-exterior_05a1f451.jpg", "/manus-storage/abraj-al-marzam-madinah-room_8950e35d.jpg", "/manus-storage/abraj-al-marzam-madinah-lobby_360389ea.jpg"],
  "assaafa-hotel-madinah": ["/manus-storage/assaafa-hotel-madinah-exterior_abeae964.jpeg", "/manus-storage/assaafa-hotel-madinah-room_5c06d01c.jpg", "/manus-storage/assaafa-hotel-madinah-lobby_8bc45b80.jpg"],
  "diyafa-al-mukhtara-madinah": ["/manus-storage/diyafa-al-mukhtara-madinah-exterior_9d718612.webp", "/manus-storage/diyafa-al-mukhtara-madinah-room_dd553dda.jpg", "/manus-storage/diyafa-al-mukhtara-madinah-lobby_133f1471.jpg"],
  "castle-hotel-madinah": ["/manus-storage/castle-hotel-madinah-exterior_c8553e20.jpg", "/manus-storage/castle-hotel-madinah-room_dde8502e.jpg", "/manus-storage/castle-hotel-madinah-lobby_7225e888.jpg"],
  "holiday-villa-madinah": ["/manus-storage/holiday-villa-madinah-exterior_5167df79.jpg", "/manus-storage/holiday-villa-madinah-lobby_b2a3a553.jpg", "/manus-storage/holiday-villa-madinah-room_2a0a6241.jpg"],
  "waqt-al-nazeel-madinah": ["/manus-storage/waqt-al-nazeel-madinah-lobby_86c96a14.jpg", "/manus-storage/waqt-al-nazeel-madinah-room_9931d75d.jpg", "/manus-storage/waqt-al-nazeel-madinah-room-alt_fe275acd.jpg"],
  "aval-hotel-madinah": ["/manus-storage/aval-hotel-madinah-exterior_275c7880.jpg", "/manus-storage/aval-hotel-madinah-lobby_5b89a276.jpg", "/manus-storage/aval-hotel-madinah-room_0160ed2b.jpg"],
  "diyar-wahat-al-nazeel-madinah": ["/manus-storage/diyar-wahat-al-nazeel-exterior_98196255.jpg", "/manus-storage/diyar-wahat-al-nazeel-room_989fc269.jpg"],
  "mohamadia-al-zahra-madinah": ["/manus-storage/mohamadia-al-zahra-exterior_970c819f.jpg", "/manus-storage/mohamadia-al-zahra-lobby_2e4510f5.jpg", "/manus-storage/mohamadia-al-zahra-room_0e2669c4.jpg"],
  "anwar-al-zahraa-madinah": ["/manus-storage/anwar-al-zahraa-lobby_6e37bb77.jpg", "/manus-storage/anwar-al-zahraa-exterior_68123fb1.jpg", "/manus-storage/anwar-al-zahraa-room_3d6bbab6.jpg"],
  "golden-tulip-al-ansar-madinah": ["/manus-storage/al-ansar-golden-tulip-lobby_41130aab.jpg", "/manus-storage/al-ansar-golden-tulip-interior_ca7ce72a.jpg"],
  "grand-zowar-madinah": ["/manus-storage/grand-zowar-lobby_f2dc01a1.jpg", "/manus-storage/grand-zowar-room_d304ff93.jpg", "/manus-storage/grand-zowar-exterior_9aceaa73.jpg"],
  "rabwat-al-safwa-7-madinah": ["/manus-storage/rabwat-al-safwa-7-exterior-day_07bf3ebc.webp", "/manus-storage/rabwat-al-safwa-7-sign_6329e40b.jpg", "/manus-storage/rabwat-al-safwa-7-exterior-night_0adf9120.jpg"],
  "shaza-al-baraka-madinah": ["/manus-storage/shaza-al-baraka-room_aefb2321.jpg", "/manus-storage/shaza-al-baraka-exterior_76a99251.jpg", "/manus-storage/shaza-al-baraka-lobby_e269f363.jpg"],
  "zaha-al-munawara-madinah": ["/manus-storage/zaha-al-munawara-lobby_89d655d0.jpg", "/manus-storage/zaha-al-munawara-exterior_0cbf8d76.jpg", "/manus-storage/zaha-al-munawara-corridor_8445d402.jpg"],
  "shaza-regency-plaza-madinah": ["/manus-storage/shaza-regency-plaza-lobby_ff5b7f4e.jpg", "/manus-storage/shaza-regency-plaza-exterior_0d4b4931.jpg", "/manus-storage/shaza-regency-plaza-room_c7068f18.jpg"],
  "diyar-al-salam-madinah": ["/manus-storage/diyar-al-salam-room_0cbeb420.jpg", "/manus-storage/diyar-al-salam-exterior_676dcfd8.jpg", "/manus-storage/diyar-al-salam-lobby_115e9dc1.jpg"],
  "diyar-al-salam-silver-madinah": ["/manus-storage/diyar-al-salam-silver-lobby_de339a55.jpg", "/manus-storage/diyar-al-salam-silver-exterior_bc6c01f9.jpg", "/manus-storage/diyar-al-salam-silver-room_898699ff.jpg"],
  "cladium-hotel-madinah": ["/manus-storage/cladium-room_6bfa7b5e.jpg", "/manus-storage/cladium-lobby_44603903.webp", "/manus-storage/cladium-exterior_d7128667.jpg"],
  "zaha-taiba-madinah": ["/manus-storage/zaha-taiba-official-exterior_8d3e449a.jpg", "/manus-storage/zaha-taiba-official-lobby_296d28b3.jpg"],
  "afaq-al-masi-madinah": ["/manus-storage/afaq-al-masi-lobby_c43ead7c.jpg", "/manus-storage/afaq-al-masi-exterior_a80e6afb.jpg", "/manus-storage/afaq-al-masi-reception_f9833a04.jpg"],
  "afaq-al-salam-golden-madinah": ["/manus-storage/afaq-al-salam-golden-exterior-day_04830d57.jpg", "/manus-storage/afaq-al-salam-golden-exterior-night_7d3b1b1d.jpg", "/manus-storage/afaq-al-salam-golden-lobby_df8684f2.jpg"],
  "diyar-al-taqwa-madinah": ["/manus-storage/diyar-al-taqwa-lobby_48740534.jpg", "/manus-storage/diyar-al-taqwa-exterior_6f207a66.jpg", "/manus-storage/diyar-al-taqwa-room_f9ee8974.jpg"],
  "plaza-inn-ohud-madinah": ["/manus-storage/plaza-inn-ohud-dining_e08fde1e.jpg", "/manus-storage/plaza-inn-ohud-room_ce131503.jpg", "/manus-storage/plaza-inn-ohud-lobby_9ad4db66.jpg"],
  "aurion-al-aqeeq-madinah": ["/manus-storage/aurion-al-aqeeq-room_97c2a1da.jpg", "/manus-storage/aurion-al-aqeeq-suite_f3ffc623.jpg", "/manus-storage/aurion-al-aqeeq-bedroom_0f73b8f7.jpg"],
  "ancyra-rose-madinah": ["/manus-storage/ancyra-rose-official-exterior_98eaac35.jpg", "/manus-storage/ancyra-rose-official-family-room_649947a8.jpg"],
  "tulip-inn-al-daar-rawafid": ["/manus-storage/tulip-inn-al-daar-rawafid-room_9fca4742.jpg", "/manus-storage/tulip-inn-al-daar-rawafid-lobby_41fe7e17.jpg", "/manus-storage/tulip-inn-al-daar-rawafid-guest-room_9e3545a2.jpg"],
  "maien-taiba": ["/manus-storage/maien-taiba-reception_eed933d9.jpg", "/manus-storage/maien-taiba-twin-room_c66df46c.jpg", "/manus-storage/maien-taiba-quint-room_3c03df4e.jpg"],
  "the-venue-al-harithia": ["/manus-storage/the-venue-al-harithia-lobby_f5ec87b0.jpeg", "/manus-storage/the-venue-al-harithia-hallway_3f737e05.jpeg", "/manus-storage/the-venue-al-harithia-lounge_419ca182.jpeg"],
  "maysan-al-taqwa": ["/manus-storage/maysan-al-taqwa-exterior_19e967ed.jpg", "/manus-storage/maysan-al-taqwa-room_2b429b08.jpg"],
  "ruve-al-madinah": ["/manus-storage/ruve-al-madinah-official-1_b30d8745.jpg", "/manus-storage/ruve-al-madinah-official-2_0a80d468.jpg", "/manus-storage/ruve-al-madinah-official-3_921f4c92.jpg"],
  "safwat-al-madinah": ["/manus-storage/safwat-al-madinah-exterior_795c7ebc.jpg", "/manus-storage/safwat-al-madinah-room_2c877aa0.jpg", "/manus-storage/safwat-al-madinah-lobby_c1bfd1d4.jpg"],
  "artal-al-monawwarah": ["/manus-storage/artal-al-monawwarah-lobby_f554974b.jpg", "/manus-storage/artal-al-monawwarah-exterior_0d52259c.jpg"],
  "nusk-al-hijrah-madinah": ["/manus-storage/nusk-al-hijrah-lobby_bb7ebc30.jpg", "/manus-storage/nusk-al-hijrah-room_a740dbd6.jpg", "/manus-storage/nusk-al-hijrah-entrance_fc96e013.jpg"],
  "al-saha-hotel-madinah": ["/manus-storage/al-saha-hotel-exterior_b05f0eac.jpg", "/manus-storage/al-saha-hotel-room_8c873841.jpg", "/manus-storage/al-saha-hotel-lobby_a1385626.jpg"],
  "al-waha-rawdah-madinah": ["/manus-storage/al-waha-rawdah-lobby_a793a776.jpg", "/manus-storage/al-waha-rawdah-room_4b2a5070.jpg", "/manus-storage/al-waha-rawdah-reception_b5821b96.jpg"],
  "manazel-al-aswaf-madinah": ["/manus-storage/manazel-al-aswaf-exterior_6d002802.jpg", "/manus-storage/manazel-al-aswaf-room_c5aaefa5.jpg", "/manus-storage/manazel-al-aswaf-lobby_f62c7798.jpg"],
  "maysan-rihab-al-misk-madinah": ["/manus-storage/maysan-rihab-al-misk-room_e30b875c.jpg", "/manus-storage/maysan-rihab-al-misk-exterior_f110b3b6.jpg", "/manus-storage/maysan-rihab-al-misk-lobby_dd315d03.jpg"],
  "durrah-al-eiman-madinah": ["/manus-storage/durrah-al-eiman-exterior_95196c97.jpg", "/manus-storage/durrah-al-eiman-lobby_372f2b5c.jpg", "/manus-storage/durrah-al-eiman-room_6a93e299.jpg"],
  "saraya-taba-hotel-a-madinah": ["/manus-storage/saraya-taba-room_a679b92b.jpg", "/manus-storage/saraya-taba-lobby_c6206689.jpg", "/manus-storage/saraya-taba-guest-room_e41880bf.jpg"],
  "hayah-plaza-madinah": ["/manus-storage/hayah-plaza-room_c528be45.jpg", "/manus-storage/hayah-plaza-lobby_1e18b400.jpg", "/manus-storage/hayah-plaza-reception_2f0b284a.jpg"],
  "qasr-al-andalus-golden-madinah": ["/manus-storage/qasr-al-andalus-golden-room_4ac41372.jpg", "/manus-storage/qasr-al-andalus-golden-lobby_d9c1e9e3.jpg", "/manus-storage/qasr-al-andalus-golden-exterior_ecaeca4c.jpg"],
  "rotana-al-misk-madinah": ["/manus-storage/rotana-al-misk-exterior_42958503.jpg", "/manus-storage/rotana-al-misk-room_612d2ebf.jpg", "/manus-storage/rotana-al-misk-lobby_6e5147f5.jpg"],
  "abraj-al-diyafah-madinah": ["/manus-storage/abraj-al-diyafah-lobby_fdebf33e.jpg", "/manus-storage/abraj-al-diyafah-room_ab9d4634.jpg", "/manus-storage/abraj-al-diyafah-reception_1be81ab2.jpg"],
  "al-mokhtara-al-gharbi-madinah": ["/manus-storage/al-mokhtara-al-gharbi-exterior_548cbc0c.jpg", "/manus-storage/al-mokhtara-al-gharbi-room_15cdc474.jpg", "/manus-storage/al-mokhtara-al-gharbi-lobby_bbb534d1.jpg"],
  "manazeli-al-madinah": ["/manus-storage/manazeli-al-madinah-room_9022665b.jpg", "/manus-storage/manazeli-al-madinah-reception_1fd9afc7.jpg", "/manus-storage/manazeli-al-madinah-suite_71987019.jpg"],
  "al-sada-al-masi-madinah": ["/manus-storage/al-sada-al-masi-exterior_64764373.jpg", "/manus-storage/al-sada-al-masi-room_0a886411.jpg", "/manus-storage/al-sada-al-masi-lobby_bf1d13f3.jpg"],
  "nusk-al-madinah-hotel": ["/manus-storage/nusk-al-madinah-room_863b9541.jpg", "/manus-storage/nusk-al-madinah-lobby_5adb1aef.jpg", "/manus-storage/nusk-al-madinah-guest-room_76652261.webp"],
  "rama-al-madinah-hotel": ["/manus-storage/rama-al-madinah-exterior_92924b1b.jpg", "/manus-storage/rama-al-madinah-room_21b59319.jpg", "/manus-storage/rama-al-madinah-lobby_5f74f7ea.jpg"],
  "rabwat-al-safwa-golden-madinah": ["/manus-storage/rabwat-al-safwa-golden-exterior_9196b612.jpg", "/manus-storage/rabwat-al-safwa-golden-room_f9ccd1f6.jpg", "/manus-storage/rabwat-al-safwa-golden-lobby_781fe428.jpg"],
  "mias-al-madinah": ["/manus-storage/mias-al-madinah-room-view_f37b4e5f.webp", "/manus-storage/mias-al-madinah-lobby_8fac0110.jpg", "/manus-storage/mias-al-madinah-reception_08ae7c13.jpg"],
  "diyar-al-madinah-madinah": ["/manus-storage/diyar-al-madinah-exterior_9a935f2e.jpg", "/manus-storage/diyar-al-madinah-room_a9653c1c.jpg", "/manus-storage/diyar-al-madinah-lobby_263d6033.jpg"],
  "hayah-al-huda-madinah": ["/manus-storage/hayah-al-huda-exterior_ebaddbd1.jpg", "/manus-storage/hayah-al-huda-lobby_6868152b.jpg", "/manus-storage/hayah-al-huda-room_70ce791b.jpg"],
  "riyadh-al-zahra-madinah": ["/manus-storage/riyadh-al-zahra-exterior_a867aed1.jpg", "/manus-storage/riyadh-al-zahra-room_9d4c6433.jpg", "/manus-storage/riyadh-al-zahra-lobby_7169a975.jpg"],
  "araek-taiba-madinah": ["/manus-storage/araek-taiba-exterior_a6df6c5d.jpg", "/manus-storage/araek-taiba-room_95e2f420.jpg", "/manus-storage/araek-taiba-lobby_7ccd6852.jpg"],
  "zowar-international-madinah": ["/manus-storage/zowar-international-exterior_79416168.jpg", "/manus-storage/zowar-international-room_948c2da7.jpg", "/manus-storage/zowar-international-lobby_bf154821.jpg"],
  "odst-al-madinah": ["/manus-storage/odst-al-madinah-lobby_01eb9d86.jpg", "/manus-storage/odst-al-madinah-room_0518fcf4.jpg", "/manus-storage/odst-al-madinah-reception_e5707ab6.jpg"],
  "hayah-golden-madinah": ["/manus-storage/hayah-golden-exterior_30d3097a.jpg", "/manus-storage/hayah-golden-room_6d9d51e4.webp", "/manus-storage/hayah-golden-lobby_791a5d22.jpg"],
  "bosphorus-waqf-safi-madinah": ["/manus-storage/bosphorus-waqf-safi-room_68fb17b3.jpg", "/manus-storage/bosphorus-waqf-safi-lobby_118aef4f.jpg", "/manus-storage/bosphorus-waqf-safi-guest-room_1c801637.jpg"],
  "karam-taibah-almasi-madinah": ["/manus-storage/karam-taibah-almasi-exterior_7923ee17.jpg", "/manus-storage/karam-taibah-almasi-room_97562dec.jpg", "/manus-storage/karam-taibah-almasi-lobby_cf986a55.jpg"],
  "dar-al-naeem-madinah": ["/manus-storage/dar-al-naeem-exterior_b9f8751f.jpg", "/manus-storage/dar-al-naeem-room_885a96b0.jpg", "/manus-storage/dar-al-naeem-lobby_7f648d79.jpg"],
  "rawabi-al-zahra-madinah": ["/manus-storage/rawabi-al-zahra-lobby_fdc12dd5.jpg", "/manus-storage/rawabi-al-zahra-room_883d2751.jpg", "/manus-storage/rawabi-al-zahra-reception_d2a810b8.jpg"],
  "bosphorus-hotel-al-salam": ["/manus-storage/bosphorus-al-salam-room_ece8d1fa.jpg", "/manus-storage/bosphorus-al-salam-lobby_835fb25f.jpg", "/manus-storage/bosphorus-al-salam-guest-room_d2b752a8.jpg"],
  "arjwan-rose-madinah": ["/manus-storage/arjwan-rose-exterior_1780db6d.jpg", "/manus-storage/arjwan-rose-room_63ec7629.jpg", "/manus-storage/arjwan-rose-lobby_a5dcc208.jpg"],
  "wardat-al-rayyan-madinah": ["/manus-storage/wardat-al-rayyan-exterior_73aa13d1.jpg", "/manus-storage/wardat-al-rayyan-room_bf920395.jpg", "/manus-storage/wardat-al-rayyan-family-room_56dcf20c.jpg"],
  "al-jaad-madinah": ["/manus-storage/al-jaad-madinah-exterior_e639324a.jpg", "/manus-storage/al-jaad-madinah-room_3a202d8e.jpg", "/manus-storage/al-jaad-madinah-lobby_e42a923d.jpg"],
  "diyar-al-huda-madinah": ["/manus-storage/diyar-al-huda-exterior_1219522b.jpg", "/manus-storage/diyar-al-huda-room_d863e883.jpg", "/manus-storage/diyar-al-huda-lobby_129b280e.jpg"],
  "mirage-al-salam-madinah": ["/manus-storage/mirage-al-salam-exterior_d7907a3e.jpg", "/manus-storage/mirage-al-salam-room_b8176cc3.jpg", "/manus-storage/mirage-al-salam-lobby_03895a4a.jpg"],
  "al-mukhtara-diamond-madinah": ["/manus-storage/al-mokhtara-diamond-exterior_755c5352.jpg", "/manus-storage/al-mokhtara-diamond-room_ad7cbe7d.jpg", "/manus-storage/al-mokhtara-diamond-lobby_eae74b23.jpg"],
  "hayah-salam-silver-madinah": ["/manus-storage/hayah-salam-silver-exterior_dd9a41a4.jpg", "/manus-storage/hayah-salam-silver-room_bb94460c.jpg", "/manus-storage/hayah-salam-silver-reception_6727546c.jpg"],
  "manarat-al-taj-madinah": ["/manus-storage/manarat-al-taj-lobby_2c6f6b02.jpg", "/manus-storage/manarat-al-taj-room_5539362d.jpg"],
  "manar-al-eiman-madinah": ["/manus-storage/manar-al-eiman-exterior_2abe022a.jpg", "/manus-storage/manar-al-eiman-room_762f0201.jpg", "/manus-storage/manar-al-eiman-reception_3c8fcd4d.jpg"],
  "bosphorus-hotel-medina": ["/manus-storage/bosphorus-hotel-medina-exterior_e26196b8.jpg", "/manus-storage/bosphorus-hotel-medina-room_567b84cf.jpg", "/manus-storage/bosphorus-hotel-medina-lobby_81ea5be4.jpg"],
  "maden-al-rawda-madinah": ["/manus-storage/maden-al-rawda-exterior_c586f683.jpg", "/manus-storage/maden-al-rawda-room_208f94ca.jpg", "/manus-storage/maden-al-rawda-lobby_c760748b.jpg"],
  "faraj-almadina-hotel": ["/manus-storage/faraj-almadina-room_7a0c1cfd.jpg", "/manus-storage/faraj-almadina-reception_7d99bd75.jpg", "/manus-storage/faraj-almadina-public-space_1345d74f.jpg"],
  "jawharat-al-rasheed-madinah": ["/manus-storage/jawharat-al-rasheed-room_34f22827.jpg", "/manus-storage/jawharat-al-rasheed-reception_9bf622aa.webp", "/manus-storage/jawharat-al-rasheed-lobby_07b04114.webp"],
  "emaar-taibah-madinah": ["/manus-storage/emaar-taibah-exterior_78f231be.jpg", "/manus-storage/emaar-taibah-room_ba21390c.jpg", "/manus-storage/emaar-taibah-lobby_ec02733b.jpg"],
  "emaar-maktan-madinah": ["/manus-storage/emaar-maktan-exterior_d35561f3.jpg", "/manus-storage/emaar-maktan-room_8ca68d7f.jpg", "/manus-storage/emaar-maktan-lobby_bc65f6b5.jpg"],
  "jiwar-al-madina": ["/manus-storage/jiwar-al-madina-exterior_7523dcfc.jpg", "/manus-storage/jiwar-al-madina-room_33da0c94.jpg", "/manus-storage/jiwar-al-madina-lobby_72bdeb66.jpg"],
  "mysk-al-balad-madinah": ["/manus-storage/mysk-al-balad-exterior_863ce27f.jpg", "/manus-storage/mysk-al-balad-room_2289e1e4.jpg", "/manus-storage/mysk-al-balad-lobby_a5d8d726.jpg"],
  "elaf-taiba-madinah": ["/manus-storage/elaf-taiba-lobby_c986b5f3.jpg", "/manus-storage/elaf-taiba-reception_cc5dce9c.jpg", "/manus-storage/elaf-taiba-room_873488b0.jpg"],
  "taiba-front-madinah": ["/manus-storage/taiba-front-exterior_6c74a068.jpg", "/manus-storage/taiba-front-lobby_090a4373.jpg", "/manus-storage/taiba-front-room_afe547c2.jpg"],
  "swiss-international-taba-al-salam": ["/manus-storage/swiss-taba-al-salam-exterior_01a3803f.jpg", "/manus-storage/swiss-taba-al-salam-reception_2c2b7136.jpg", "/manus-storage/swiss-taba-al-salam-room_5756efbb.jpg"],
  "elaf-al-taqwa-madinah": ["/manus-storage/elaf-al-taqwa-exterior_4c92e46b.jpg", "/manus-storage/elaf-al-taqwa-room_f75acbe8.jpg", "/manus-storage/elaf-al-taqwa-facade_c97b6e12.webp"],
  "al-manakha-rotana-madinah": ["/manus-storage/al-manakha-rotana-exterior_f54f77cc.jpg", "/manus-storage/al-manakha-rotana-lobby_2d5a3042.jpg", "/manus-storage/al-manakha-rotana-room_3c0e81b2.jpg"],
  "maden-hotel-madinah": ["/manus-storage/maden-hotel-exterior_24163449.jpg", "/manus-storage/maden-hotel-lobby_6a050a38.jpg", "/manus-storage/maden-hotel-room_3ff43321.jpg"],
  "kayan-international-hotel": ["/manus-storage/kayan-international-lobby_793e81fa.png", "/manus-storage/kayan-international-room_9dcd4d06.jpg", "/manus-storage/kayan-international-exterior_b735c7b0.jpg"],
  "novotel-madinah": ["/manus-storage/novotel-madinah-room_5c83530d.jpg", "/manus-storage/novotel-madinah-exterior_557edb7c.jpg", "/manus-storage/novotel-madinah-lobby_f621b6cb.jpg"],
  "sofitel-shahd-al-madinah": ["/manus-storage/sofitel-shahd-exterior_e36b9568.jpg", "/manus-storage/sofitel-shahd-room_ead5cfae.jpg", "/manus-storage/sofitel-shahd-skyline_a1cf3910.jpg"],
  "emaar-elite-madinah": ["/manus-storage/emaar-elite-exterior_9c6c7fd5.jpg", "/manus-storage/emaar-elite-room_11ff2236.jpg", "/manus-storage/emaar-elite-lobby_3dc9f58e.jpg"],
  "grand-plaza-badr-al-maqam": ["/manus-storage/grand-plaza-badr-exterior_90ae9db2.jpg", "/manus-storage/grand-plaza-badr-room_e8a07366.jpg", "/manus-storage/grand-plaza-badr-lounge_19add0f5.jpg"],
  "diyar-ajwa-tapestry-hilton": ["/manus-storage/diyar-ajwa-lobby_1ffce765.jpg", "/manus-storage/diyar-ajwa-facade_73040270.jpg", "/manus-storage/diyar-ajwa-room_74dba180.jpg"],
  "grand-plaza-al-madinah": ["/manus-storage/grand-plaza-exterior_7c73b3b2.jpg", "/manus-storage/grand-plaza-room_12204036.jpg", "/manus-storage/grand-plaza-lobby_2e1878cb.jpg"],
  "al-muna-kareem-madinah": ["/manus-storage/al-muna-kareem-exterior_51c249c5.jpg", "/manus-storage/al-muna-kareem-room_7c81c76f.jpg", "/manus-storage/al-muna-kareem-facade_8aabbab0.jpg"],
  "dar-al-iman-intercontinental": ["/manus-storage/01_dar_al_iman_intercontinental__exterior__01_a773e3cf.webp", "/manus-storage/01_dar_al_iman_intercontinental__exterior__02_b46049ce.webp", "/manus-storage/01_dar_al_iman_intercontinental__room__01_1993f8d5.webp"],
  "pullman-zamzam-madinah": ["/manus-storage/03_pullman_zamzam_madina__view__01_bd38e8a2.webp", "/manus-storage/03_pullman_zamzam_madina__room__01_5dfda350.webp"],
  "anwar-al-madinah-movenpick": ["/manus-storage/05_anwar_al_madinah_movenpick__exterior__01_15400a7b.webp", "/manus-storage/05_anwar_al_madinah_movenpick__room__01_572fb92b.webp"],
  "hilton-madinah": ["/manus-storage/06_hilton_madinah__exterior__01_c2270329.webp", "/manus-storage/06_hilton_madinah__room__01_1ebf8f7b.webp"],
  "le-meridien-madinah": ["/manus-storage/07_le_meridien_madinah__exterior__01_1aea5fd9.webp", "/manus-storage/07_le_meridien_madinah__exterior__02_386f6b68.webp"],
  "al-haram-hotel": ["/manus-storage/09_dar_al_eiman_al_haram__exterior__01_e8c8d659.webp", "/manus-storage/dar-al-eiman-al-haram-room_dd55c7ba.jpg", "/manus-storage/dar-al-eiman-al-haram-exterior_2404c84d.jpg", "/manus-storage/dar-al-eiman-al-haram-twin-room_542ef42e.jpg"],
  "dallah-taibah": ["/manus-storage/08_dallah_taibah__exterior__01_80cb409d.webp", "/manus-storage/2001_eaf41eea.jpg", "/manus-storage/2035_PDBL_e768d003.jpg"],
  "rawdah-al-aqiq": ["/manus-storage/20_rawda_al_aqeeq__exterior__01_73f8def9.webp", "/manus-storage/20_rawda_al_aqeeq__exterior__02_a4d99731.webp"],
  "madinah-harmony": ["/manus-storage/23_madinah_harmony__exterior__01_e40dd3fe.webp", "/manus-storage/23_madinah_harmony__room__01_2d2025c0.webp"],
  "crowne-plaza-madinah": ["/manus-storage/27_crowne_plaza_madinah__exterior__01_2438f63d.webp", "/manus-storage/27_crowne_plaza_madinah__room__01_158bda6d.webp"],
  "doubletree-by-hilton-madinah-gate": ["/manus-storage/29_doubletree_madinah_gate__room__01_8751ec5f.webp"],
  "radisson-hotel-madinah": ["/manus-storage/30_radisson_blu_madinah__exterior__01_dfed9fee.webp"],
};

function planningCategory(grade: MadinahPlanningHotel["grade"]): HotelProfile["category"] {
  return grade === "5-star" ? "premium" : grade === "4-star" ? "executive" : "value";
}

function planningProximity(record: MadinahPlanningHotel): HotelProfile["proximityBand"] {
  if (record.slug === "pullman-zamzam-madinah") return "haram_side";
  const { zone } = record;
  if (zone === "central_north" || zone === "central_east") return "haram_side";
  if (zone === "central_south" || zone === "central_west") return "central";
  return zone === "northern_transfer" ? "transfer" : "city";
}

function planningContent(record: MadinahPlanningHotel): Record<Locale, HotelContent> {
  return Object.fromEntries(locales.map(locale => {
    const copy = planningCopy[locale];
    const name = locale === "ar" ? record.arabicName : record.name;
    const nearby = locale === "ar" ? { nabawi: "المسجد النبوي", baqi: "مقبرة البقيع" } : { nabawi: "Al-Masjid an-Nabawi", baqi: "Al Baqi Cemetery" };
    return [locale, {
      summary: copy.summary(name),
      highlights: [copy.zones[record.zone]],
      amenities: [], rooms: [], nearby,
    }];
  })) as unknown as Record<Locale, HotelContent>;
}

function verificationPendingContent(record: MadinahPlanningHotel): Record<Locale, HotelContent> {
  const copy = {
    en: { summary: `${record.name} is listed for Madinah accommodation. Share your group dates and requirements, and our team will confirm the suitable arrangement before proceeding.`, highlight: "Madinah accommodation enquiry" },
    ar: { summary: `${record.arabicName} ضمن خيارات الإقامة المدرجة للمدينة المنورة. شاركوا معنا تواريخ مجموعتكم ومتطلباتها، ويؤكد لكم فريقنا الترتيبات المناسبة قبل المتابعة.`, highlight: "استفسار عن إقامة في المدينة" },
    ms: { summary: `${record.name} disenaraikan untuk penginapan di Madinah. Kongsikan tarikh dan keperluan kumpulan anda, dan pasukan kami akan mengesahkan susunan yang sesuai sebelum meneruskan.`, highlight: "Pertanyaan penginapan Madinah" },
    ur: { summary: `${record.name} مدینہ میں رہائش کے لیے درج ہے۔ اپنے گروپ کی تاریخیں اور ضروریات بتائیں، اور ہماری ٹیم آگے بڑھنے سے پہلے مناسب انتظامات کی تصدیق کرے گی۔`, highlight: "مدینہ رہائش کی انکوائری" },
    id: { summary: `${record.name} tercantum untuk akomodasi di Madinah. Bagikan tanggal dan kebutuhan grup Anda, lalu tim kami akan mengonfirmasi pengaturan yang sesuai sebelum melanjutkan.`, highlight: "Pertanyaan akomodasi Madinah" },
    hi: { summary: `${record.name} मदीना आवास के लिए सूचीबद्ध है। अपने समूह की तिथियां और आवश्यकताएं साझा करें; हमारी टीम आगे बढ़ने से पहले उपयुक्त व्यवस्था की पुष्टि करेगी।`, highlight: "मदीना आवास पूछताछ" },
  } as const;
  return Object.fromEntries(locales.map(locale => [locale, { summary: copy[locale].summary, highlights: [copy[locale].highlight], amenities: [], rooms: [], nearby: {} }])) as unknown as Record<Locale, HotelContent>;
}

/** These candidates remain visible only after a Madinah-specific location or media match could not be completed. */
const verificationPendingPlanningSlugs = new Set(["hilton-garden-inn-madinah", "four-points-by-sheraton-madinah", "golden-tulip-madinah", "almasa-grand", "ramada-madinah-al-qibla", "al-jawhara-madinah", "al-taj-madinah", "al-sultan-madinah", "al-waleed-madinah", "andalus-palace-madinah", "al-andalus-madinah", "al-aqsa-madinah", "al-eman-east", "al-jazira-madinah", "al-aliyah-madinah", "al-ferdous-madinah", "al-aziziyah-hotel-madinah", "quba-hotel-madinah", "sheraton-madinah", "marriott-madinah"]);

function planningProfile(record: MadinahPlanningHotel): HotelProfileDraft {
  const reviewedMap = reviewedMapDetails[record.slug];
  const isVerificationPending = verificationPendingPlanningSlugs.has(record.slug);
  const exactGallery = reviewedMap?.gallery ?? authorizedMediaGalleries[record.slug] ?? [];
  const usesDestinationPlaceholder = !exactGallery.length && destinationPlaceholderPlanningSlugs.has(record.slug);
  return {
    slug: record.slug, name: record.name, city: "madinah", category: planningCategory(record.grade), status: isVerificationPending ? "verification_pending" : "planning_record",
    proximityBand: isVerificationPending ? "city" : planningProximity(record), corporateReady: false, address: "Madinah Al Munawwarah, Saudi Arabia", arabicName: record.arabicName,
    mapAddress: isVerificationPending ? undefined : reviewedMap?.mapAddress, googleMapsPlaceUrl: isVerificationPending ? undefined : reviewedMap?.googleMapsPlaceUrl, nearestGate: isVerificationPending ? undefined : reviewedMap?.nearestGate, gallery: isVerificationPending ? [] : usesDestinationPlaceholder ? [madinahDestinationPlaceholder] : exactGallery, galleryKind: usesDestinationPlaceholder ? "destination_placeholder" : undefined, galleryNote: usesDestinationPlaceholder ? "Madinah destination image — not property photography" : "", nearbySites: isVerificationPending ? [] : reviewedMap?.nearbySites ?? [], content: isVerificationPending ? verificationPendingContent(record) : planningContent(record), searchAliases: { "hilton-madinah": ["Hilton Madinah"], "pullman-zamzam-madinah": ["Pullman Zamzam Madinah"], "le-meridien-madinah": ["Le Méridien Madinah"], "al-haram-hotel": ["Al Haram Hotel"], "eman-royal": ["Eman Royal", "Al Eiman Royal Hotel"], "ramada-madinah-al-qibla": ["Ramada Madinah Al Qibla", "Ramada by Wyndham Madinah Al Qibla"], "al-mokhtara-golden": ["Al Mokhtara Golden", "Al Mukhtara Golden Hotel"], "al-durrah-madinah": ["Durrat Al Madinah Hotel"], "madinah-harmony": ["Madinah Harmony"] }[record.slug],
    planning: { zone: record.zone, grade: record.grade, distanceEstimate: record.distanceEstimate, walkingEstimate: record.walkingEstimate, vehicleEstimate: record.vehicleEstimate, accessMode: record.accessMode, routeReview: record.routeReview },
  };
}

const verifiedHotelProfiles: HotelProfileDraft[] = [{
  slug: "dar-al-taqwa-madinah", name: "Dar Al Taqwa Hotel", arabicName: "فندق دار التقوى", city: "madinah", category: "premium", status: "verified", proximityBand: "haram_side", corporateReady: true,
  address: "Central Area, Madinah Al Munawwarah, Saudi Arabia", mapAddress: "Dar Al-Taqwa Hotel Madinah, Off Al Sitteen Street, Al Haram, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Dar%20Al%20Taqwa%20Hotel%20Madinah%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.taqwamadinah.com/", gallery: ["/manus-storage/dar-al-taqwa-madinah-room-2026_a6636fc2.jpg", "/manus-storage/dar-al-taqwa-madinah-lobby-2026_88c6b228.jpg", "/manus-storage/dar-al-taqwa-madinah-dining-2026_29d983e4.jpg"],
  galleryNote: "Hotel gallery",
  nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }, { key: "baqi", address: "Jannat al-Baqi, Madinah, Saudi Arabia" }, { key: "kingFahadGate", address: "King Fahad Gate, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], nearestGate: { name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" },
  content: {
    en: { summary: "A Madinah hotel profile based on information published on the hotel’s official website. The property describes its Central Area location, proximity to King Fahad Gate’s ladies’ entrance, Haram-view room categories, dining venues, and meetings and events facilities.", highlights: ["Central Area location", "Meetings and events facilities", "Haram-view room categories"], amenities: ["Business meetings", "High-speed Wi-Fi", "Dining venues", "Valet parking", "Room service", "Concierge support"], rooms: [{ name: "Standard King Haram View", detail: "2 guests · 27 m²" }, { name: "Standard Twin Beds Haram View", detail: "2 guests · 26 m²" }, { name: "Deluxe King Bed Haram View", detail: "2 guests · 30 m²" }], nearby: { nabawi: "Al-Masjid an-Nabawi", baqi: "Jannat al-Baqi Cemetery", kingFahadGate: "King Fahad Gate" } },
    ar: { summary: "ملف فندق في المدينة المنورة يعتمد على المعلومات المنشورة في الموقع الرسمي للفندق. يوضح الفندق موقعه في المنطقة المركزية وقربه من مدخل السيدات عند بوابة الملك فهد وفئات الغرف المطلة على الحرم ومنافذ الطعام ومرافق الاجتماعات والفعاليات.", highlights: ["موقع في المنطقة المركزية", "مرافق للاجتماعات والفعاليات", "فئات غرف بإطلالة على الحرم"], amenities: ["اجتماعات الأعمال", "واي فاي عالي السرعة", "منافذ طعام", "موقف سيارات بخدمة صف", "خدمة الغرف", "دعم الكونسيرج"], rooms: [{ name: "غرفة كينغ قياسية بإطلالة على الحرم", detail: "ضيفان · 27 م²" }, { name: "غرفة توأم قياسية بإطلالة على الحرم", detail: "ضيفان · 26 م²" }, { name: "غرفة كينغ ديلوكس بإطلالة على الحرم", detail: "ضيفان · 30 م²" }], nearby: { nabawi: "المسجد النبوي", baqi: "مقبرة جنة البقيع", kingFahadGate: "بوابة الملك فهد" } },
    ms: { summary: "Profil hotel Madinah berdasarkan maklumat yang diterbitkan di laman web rasmi hotel. Pihak hotel menerangkan lokasi di Kawasan Pusat, kedekatan dengan pintu masuk wanita King Fahad Gate, kategori bilik menghadap Haram, tempat makan serta kemudahan mesyuarat dan acara.", highlights: ["Lokasi Kawasan Pusat", "Kemudahan mesyuarat dan acara", "Kategori bilik menghadap Haram"], amenities: ["Mesyuarat perniagaan", "Wi-Fi berkelajuan tinggi", "Tempat makan", "Parkir valet", "Khidmat bilik", "Sokongan concierge"], rooms: [{ name: "Bilik King Standard Pemandangan Haram", detail: "2 tetamu · 27 m²" }, { name: "Bilik Twin Standard Pemandangan Haram", detail: "2 tetamu · 26 m²" }, { name: "Bilik King Deluxe Pemandangan Haram", detail: "2 tetamu · 30 m²" }], nearby: { nabawi: "Al-Masjid an-Nabawi", baqi: "Tanah Perkuburan Jannat al-Baqi", kingFahadGate: "King Fahad Gate" } },
    ur: { summary: "مدینہ ہوٹل کا پروفائل، ہوٹل کی سرکاری ویب سائٹ پر شائع شدہ معلومات کی بنیاد پر۔ ہوٹل اپنے مرکزی علاقے کے مقام، کنگ فہد گیٹ کے خواتین کے داخلی راستے سے قربت، حرم ویو رومز، ڈائننگ وینیوز اور میٹنگز و ایونٹس کی سہولیات کا ذکر کرتا ہے۔", highlights: ["مرکزی علاقے کا مقام", "میٹنگز اور ایونٹس کی سہولیات", "حرم ویو روم کیٹیگریز"], amenities: ["کاروباری میٹنگز", "تیز رفتار وائی فائی", "ڈائننگ وینیوز", "ویلیٹ پارکنگ", "روم سروس", "کنسیئرژ سپورٹ"], rooms: [{ name: "اسٹینڈرڈ کنگ حرم ویو", detail: "2 مہمان · 27 م²" }, { name: "اسٹینڈرڈ ٹوئن بیڈز حرم ویو", detail: "2 مہمان · 26 م²" }, { name: "ڈیلکس کنگ حرم ویو", detail: "2 مہمان · 30 م²" }], nearby: { nabawi: "مسجد نبوی", baqi: "جنت البقیع قبرستان", kingFahadGate: "کنگ فہد گیٹ" } },
    id: { summary: "Profil hotel Madinah berdasarkan informasi yang diterbitkan di situs resmi hotel. Hotel menjelaskan lokasinya di Kawasan Pusat, kedekatan dengan pintu masuk wanita King Fahad Gate, kategori kamar berpemandangan Haram, tempat makan, serta fasilitas rapat dan acara.", highlights: ["Lokasi Kawasan Pusat", "Fasilitas rapat dan acara", "Kategori kamar berpemandangan Haram"], amenities: ["Rapat bisnis", "Wi-Fi berkecepatan tinggi", "Tempat makan", "Parkir valet", "Layanan kamar", "Dukungan concierge"], rooms: [{ name: "Kamar King Standar Pemandangan Haram", detail: "2 tamu · 27 m²" }, { name: "Kamar Twin Standar Pemandangan Haram", detail: "2 tamu · 26 m²" }, { name: "Kamar King Deluxe Pemandangan Haram", detail: "2 tamu · 30 m²" }], nearby: { nabawi: "Al-Masjid an-Nabawi", baqi: "Pemakaman Jannat al-Baqi", kingFahadGate: "King Fahad Gate" } },
    hi: { summary: "मदीना होटल प्रोफ़ाइल, होटल की आधिकारिक वेबसाइट पर प्रकाशित जानकारी पर आधारित है। होटल केंद्रीय क्षेत्र में अपने स्थान, किंग फहद गेट महिला प्रवेश की निकटता, हरम-व्यू कक्ष श्रेणियों, भोजन स्थलों और बैठकों व कार्यक्रमों की सुविधाओं का विवरण देता है।", highlights: ["केंद्रीय क्षेत्र का स्थान", "बैठक और कार्यक्रम सुविधाएं", "हरम-व्यू कक्ष श्रेणियां"], amenities: ["व्यावसायिक बैठकें", "हाई-स्पीड वाई-फाई", "भोजन स्थल", "वैलेट पार्किंग", "रूम सर्विस", "कंसीयर्ज सहायता"], rooms: [{ name: "स्टैंडर्ड किंग हरम व्यू", detail: "2 अतिथि · 27 m²" }, { name: "स्टैंडर्ड ट्विन बेड्स हरम व्यू", detail: "2 अतिथि · 26 m²" }, { name: "डीलक्स किंग हरम व्यू", detail: "2 अतिथि · 30 m²" }], nearby: { nabawi: "अल-मस्जिद अन-नबवी", baqi: "जन्नत अल-बक़ी कब्रिस्तान", kingFahadGate: "किंग फहद गेट" } },
  },
}];

function sourceReviewedContent(copy: Record<Locale, Pick<HotelContent, "summary" | "highlights" | "amenities"> & Partial<Pick<HotelContent, "rooms">>>): Record<Locale, HotelContent> {
  return Object.fromEntries(locales.map(locale => {
    const nearby = locale === "ar" ? { nabawi: "المسجد النبوي" } : { nabawi: "Al-Masjid an-Nabawi" };
    return [locale, { ...copy[locale], rooms: copy[locale].rooms ?? [], nearby }];
  })) as unknown as Record<Locale, HotelContent>;
}

const sourceReviewedHotelProfiles: HotelProfileDraft[] = [
  {
    slug: "biltmore-al-madinah", name: "The Biltmore Al Madinah Hotel", arabicName: "فندق بيلتمور المدينة المنورة", searchAliases: ["The Biltmore Almadinah Hotel", "The Oberoi Madina"], city: "madinah", category: "premium", status: "verified", proximityBand: "central", corporateReady: false,
    address: "DMAE6930, Zaid Bin Sabit Street, Markaziah, Madinah 42311, Saudi Arabia", mapAddress: "The Biltmore Al Madinah Hotel, DMAE6930, Zaid Bin Sabit Street, Markaziah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=The%20Biltmore%20Al%20Madinah%20Hotel%2C%20Zaid%20Bin%20Sabit%20Street%2C%20Markaziah%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://www.thebiltmorehotels.com/en/the-biltmore-al-madinah-hotel/", gallery: ["/manus-storage/biltmore-al-madinah-suite-2026_d7a31330.jpg", "/manus-storage/biltmore-al-madinah-dining-2026_02ff6ba3.jpg", "/manus-storage/biltmore-al-madinah-lobby-2026_7ff24bc8.jpg"],
    galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: sourceReviewedContent({
      en: { summary: "A Madinah hotel with rooms and suites, dining destinations, fitness facilities, and meeting and event spaces listed on the Biltmore hotel page.", highlights: ["Rooms and suites", "Dining destinations", "Meeting and event spaces"], amenities: ["Meetings and events", "Dining venues", "Fitness facilities"] },
      ar: { summary: "فندق في المدينة المنورة يذكر موقع بيلتمور غرفاً وأجنحة ووجهات للطعام ومرافق لياقة ومساحات للاجتماعات والفعاليات.", highlights: ["غرف وأجنحة", "وجهات للطعام", "مساحات للاجتماعات والفعاليات"], amenities: ["اجتماعات وفعاليات", "وجهات للطعام", "مرافق لياقة"] },
      ms: { summary: "Hotel di Madinah dengan bilik dan suite, destinasi makan, kemudahan kecergasan serta ruang mesyuarat dan acara yang disenaraikan pada halaman Biltmore.", highlights: ["Bilik dan suite", "Destinasi makan", "Ruang mesyuarat dan acara"], amenities: ["Mesyuarat dan acara", "Destinasi makan", "Kemudahan kecergasan"] },
      ur: { summary: "مدینہ کا ایک ہوٹل جس کے لیے بِلٹمور کے صفحے پر کمرے اور سویٹس، ڈائننگ مقامات، فٹنس سہولیات اور میٹنگ و ایونٹ اسپیسز درج ہیں۔", highlights: ["کمرے اور سویٹس", "ڈائننگ مقامات", "میٹنگ اور ایونٹ اسپیسز"], amenities: ["میٹنگز اور ایونٹس", "ڈائننگ مقامات", "فٹنس سہولیات"] },
      id: { summary: "Hotel di Madinah dengan kamar dan suite, pilihan bersantap, fasilitas kebugaran, serta ruang rapat dan acara yang tercantum pada halaman Biltmore.", highlights: ["Kamar dan suite", "Pilihan bersantap", "Ruang rapat dan acara"], amenities: ["Rapat dan acara", "Pilihan bersantap", "Fasilitas kebugaran"] },
      hi: { summary: "मदीना का एक होटल, जिसकी बिल्टमोर वेबसाइट पर कमरे और सुइट्स, भोजन स्थल, फिटनेस सुविधाएं और बैठक व कार्यक्रम स्थल सूचीबद्ध हैं।", highlights: ["कमरे और सुइट्स", "भोजन स्थल", "बैठक और कार्यक्रम स्थल"], amenities: ["बैठक और कार्यक्रम", "भोजन स्थल", "फिटनेस सुविधाएं"] },
    }),
  },
  {
    slug: "new-madinah-hotel", name: "New Madinah Hotel", city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Abi Sayeed Al Khudri Street, PO Box 1582, Madinah 41441, Saudi Arabia", mapAddress: "New Madinah Hotel, Abi Sayeed Al Khudri Street, Behind Shariah Court, Madinah 41441, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=New%20Madinah%20Hotel%2C%20Abi%20Sayeed%20Al%20Khudri%20Street%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.ihg.com/spnd/hotels/us/en/madinah/medvm/hoteldetail", gallery: ["/manus-storage/new-madinah-hotel-exterior-2026_29c83619.jpg", "/manus-storage/new-madinah-hotel-room-2026_360a7f4f.jpg", "/manus-storage/new-madinah-hotel-lobby-2026_47c1e336.jpg"],
    galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], nearestGate: { name: "Bab Al Baqi", address: "Bab Al Baqi, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" },
    content: sourceReviewedContent({
      en: { summary: "A source-reviewed Madinah hotel profile based on IHG’s official property page. The hotel states a central Madinah setting, 207 rooms and suites, daily housekeeping, Wi-Fi, an on-site restaurant, and three meeting rooms.", highlights: ["207 rooms and suites", "3 meeting rooms", "Central Madinah setting"], amenities: ["Wi-Fi", "On-site restaurant", "Daily housekeeping", "Meetings"] },
      ar: { summary: "ملف فندقي تمت مراجعته من مصدر رسمي بالاعتماد على صفحة IHG الخاصة بالمنشأة. يذكر الفندق موقعاً في وسط المدينة المنورة و207 غرف وأجنحة وخدمة تنظيف يومية وواي فاي ومطعماً داخل المنشأة وثلاث قاعات للاجتماعات.", highlights: ["207 غرف وأجنحة", "3 قاعات للاجتماعات", "موقع في وسط المدينة المنورة"], amenities: ["واي فاي", "مطعم داخل المنشأة", "تنظيف يومي", "اجتماعات"] },
      ms: { summary: "Profil hotel Madinah yang disemak daripada sumber rasmi berdasarkan halaman hartanah IHG. Hotel ini menyatakan suasana di pusat Madinah, 207 bilik dan suite, pengemasan harian, Wi-Fi, restoran di dalam hotel dan tiga bilik mesyuarat.", highlights: ["207 bilik dan suite", "3 bilik mesyuarat", "Lokasi pusat Madinah"], amenities: ["Wi-Fi", "Restoran di hotel", "Pengemasan harian", "Mesyuarat"] },
      ur: { summary: "مدینہ ہوٹل کا یہ پروفائل IHG کے سرکاری پراپرٹی صفحے سے ماخذ کی جانچ کے بعد تیار کیا گیا ہے۔ ہوٹل مرکزی مدینہ میں مقام، 207 کمرے اور سویٹس، روزانہ ہاؤس کیپنگ، وائی فائی، آن سائٹ ریسٹورنٹ اور تین میٹنگ رومز بیان کرتا ہے۔", highlights: ["207 کمرے اور سویٹس", "3 میٹنگ رومز", "مرکزی مدینہ کا مقام"], amenities: ["وائی فائی", "آن سائٹ ریسٹورنٹ", "روزانہ ہاؤس کیپنگ", "میٹنگز"] },
      id: { summary: "Profil hotel Madinah yang ditinjau berdasarkan halaman properti resmi IHG. Hotel ini menyatakan lokasi di pusat Madinah, 207 kamar dan suite, layanan kebersihan harian, Wi-Fi, restoran di properti, dan tiga ruang rapat.", highlights: ["207 kamar dan suite", "3 ruang rapat", "Lokasi pusat Madinah"], amenities: ["Wi-Fi", "Restoran di properti", "Kebersihan harian", "Rapat"] },
      hi: { summary: "यह मदीना होटल प्रोफ़ाइल IHG के आधिकारिक संपत्ति पृष्ठ के स्रोत-समीक्षित विवरण पर आधारित है। होटल केंद्रीय मदीना में स्थान, 207 कमरे और सुइट्स, दैनिक हाउसकीपिंग, वाई-फाई, ऑन-साइट रेस्तरां और तीन बैठक कक्ष बताता है।", highlights: ["207 कमरे और सुइट्स", "3 बैठक कक्ष", "केंद्रीय मदीना स्थान"], amenities: ["वाई-फाई", "ऑन-साइट रेस्तरां", "दैनिक हाउसकीपिंग", "बैठकें"] },
    }),
  },
  {
    slug: "saja-by-warwick-madinah", name: "Saja by Warwick Madinah", city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Northern Central Zone, Madinah Al Munawwarah, Saudi Arabia", mapAddress: "Saja Al Madinah Hotel, King Faisal Road, Budaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Saja%20by%20Warwick%20Madinah%2C%20Northern%20Central%20Area%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.warwickhotels.com/saja-by-warwick-madinah", gallery: ["/manus-storage/saja-by-warwick-madinah-exterior-2026_e4e1947b.jpg", "/manus-storage/saja-by-warwick-madinah-room-2026_515df4e9.jpg", "/manus-storage/saja-by-warwick-madinah-lobby-2026_2944db32.jpg"],
    galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: sourceReviewedContent({
      en: { summary: "A source-reviewed Madinah hotel profile based on the property’s official website. The hotel states a Northern Central Zone location, 300 metres from Al Masjid an Nabawi, renovated rooms, two restaurants, and a lobby coffee shop. A property-pin and gate route remain pending independent map review.", highlights: ["Northern Central Zone", "2 restaurants", "Lobby coffee shop"], amenities: ["Dining", "Lobby coffee shop", "Renovated rooms"] },
      ar: { summary: "ملف فندقي تمت مراجعته من مصدر رسمي بالاعتماد على موقع المنشأة. يذكر الفندق موقعه في المنطقة المركزية الشمالية وعلى بعد 300 متر من المسجد النبوي، مع غرف مجددة ومطعمين ومقهى في الردهة. تبقى نقطة الموقع ومسار البوابة قيد المراجعة المستقلة.", highlights: ["المنطقة المركزية الشمالية", "مطعمان", "مقهى في الردهة"], amenities: ["خيارات طعام", "مقهى في الردهة", "غرف مجددة"] },
      ms: { summary: "Profil hotel Madinah yang disemak daripada sumber rasmi berdasarkan laman web hartanah. Hotel menyatakan lokasi di Zon Pusat Utara, 300 meter dari Al Masjid an Nabawi, bilik yang diperbaharui, dua restoran dan kedai kopi lobi. Pin hartanah dan laluan pintu masuk masih menunggu semakan peta bebas.", highlights: ["Zon Pusat Utara", "2 restoran", "Kedai kopi lobi"], amenities: ["Pilihan makan", "Kedai kopi lobi", "Bilik diperbaharui"] },
      ur: { summary: "مدینہ ہوٹل کا یہ پروفائل پراپرٹی کی سرکاری ویب سائٹ سے ماخذ کی جانچ کے بعد تیار کیا گیا ہے۔ ہوٹل شمالی مرکزی زون، مسجد نبوی سے 300 میٹر، تجدید شدہ کمروں، دو ریسٹورنٹس اور لابی کافی شاپ کا ذکر کرتا ہے۔ پراپرٹی پن اور گیٹ روٹ آزاد نقشہ جائزے کے منتظر ہیں۔", highlights: ["شمالی مرکزی زون", "2 ریسٹورنٹس", "لابی کافی شاپ"], amenities: ["ڈائننگ", "لابی کافی شاپ", "تجدید شدہ کمرے"] },
      id: { summary: "Profil hotel Madinah yang ditinjau berdasarkan sumber resmi dari situs properti. Hotel menyatakan lokasi di Zona Pusat Utara, 300 meter dari Al Masjid an Nabawi, kamar yang direnovasi, dua restoran, dan kedai kopi lobi. Pin properti dan rute gerbang masih menunggu tinjauan peta independen.", highlights: ["Zona Pusat Utara", "2 restoran", "Kedai kopi lobi"], amenities: ["Pilihan bersantap", "Kedai kopi lobi", "Kamar direnovasi"] },
      hi: { summary: "यह मदीना होटल प्रोफ़ाइल संपत्ति की आधिकारिक वेबसाइट के स्रोत-समीक्षित विवरण पर आधारित है। होटल उत्तरी केंद्रीय क्षेत्र, अल-मस्जिद अन-नबवी से 300 मीटर की दूरी, नवीनीकृत कमरों, दो रेस्तरां और लॉबी कॉफी शॉप का उल्लेख करता है। संपत्ति पिन और गेट मार्ग स्वतंत्र मानचित्र समीक्षा की प्रतीक्षा में हैं।", highlights: ["उत्तरी केंद्रीय क्षेत्र", "2 रेस्तरां", "लॉबी कॉफी शॉप"], amenities: ["भोजन", "लॉबी कॉफी शॉप", "नवीनीकृत कमरे"] },
    }),
  },
  {
    slug: "golden-tulip-al-zahabi", name: "Golden Tulip Al Zahabi", city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Opposite the Prophet’s Mosque, Gate No. 338, 691 Medina, Saudi Arabia", mapAddress: "Golden Tulip Al Zahabi, Suhayb Bin Sinan Street, Budaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Golden%20Tulip%20Al%20Zahabi%20Madinah%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://al-zahabi.goldentulip.com/en-us/", gallery: ["/manus-storage/golden-tulip-al-zahabi-exterior-2026_d05c6586.jpg", "/manus-storage/golden-tulip-al-zahabi-room-2026_4c05ab99.jpg", "/manus-storage/golden-tulip-al-zahabi-lobby-2026_b18b2647.jpg"],
    galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: sourceReviewedContent({
      en: { summary: "A source-reviewed Madinah hotel profile based on the property’s official website. The hotel states an address opposite the Prophet’s Mosque near Gate 338, six published room types, Wi-Fi, daily housekeeping, 24-hour reception, accessible rooms, buffet breakfast, and room service. A reviewed entrance-to-gate route remains pending.", highlights: ["6 published room types", "Opposite the Prophet’s Mosque", "24-hour reception"], amenities: ["Wi-Fi", "Daily housekeeping", "Accessible rooms", "Buffet breakfast", "Room service"] },
      ar: { summary: "ملف فندقي تمت مراجعته من مصدر رسمي بالاعتماد على موقع المنشأة. يذكر الفندق عنواناً مقابل المسجد النبوي بالقرب من البوابة 338، وستة أنواع منشورة من الغرف، وواي فاي وتنظيفاً يومياً واستقبالاً على مدار الساعة وغرفاً ميسرة وفطوراً بوفيه وخدمة غرف. يبقى مسار المدخل إلى البوابة قيد المراجعة المستقلة.", highlights: ["6 أنواع منشورة من الغرف", "مقابل المسجد النبوي", "استقبال على مدار الساعة"], amenities: ["واي فاي", "تنظيف يومي", "غرف ميسرة", "فطور بوفيه", "خدمة غرف"] },
      ms: { summary: "Profil hotel Madinah yang disemak daripada sumber rasmi berdasarkan laman web hartanah. Hotel menyatakan alamat bertentangan Masjid Nabawi berhampiran Pintu 338, enam jenis bilik yang diterbitkan, Wi-Fi, pengemasan harian, kaunter 24 jam, bilik mudah akses, sarapan bufet dan perkhidmatan bilik. Laluan masuk ke pintu masih menunggu semakan bebas.", highlights: ["6 jenis bilik diterbitkan", "Bertentangan Masjid Nabawi", "Kaunter 24 jam"], amenities: ["Wi-Fi", "Pengemasan harian", "Bilik mudah akses", "Sarapan bufet", "Perkhidmatan bilik"] },
      ur: { summary: "مدینہ ہوٹل کا یہ پروفائل پراپرٹی کی سرکاری ویب سائٹ سے ماخذ کی جانچ کے بعد تیار کیا گیا ہے۔ ہوٹل مسجد نبوی کے سامنے گیٹ 338 کے قریب پتہ، شائع شدہ چھ روم ٹائپس، وائی فائی، روزانہ ہاؤس کیپنگ، 24 گھنٹے ریسپشن، قابل رسائی کمرے، بفے ناشتہ اور روم سروس بیان کرتا ہے۔ داخلی راستے سے گیٹ تک کا جائزہ شدہ روٹ ابھی باقی ہے۔", highlights: ["6 شائع شدہ روم ٹائپس", "مسجد نبوی کے سامنے", "24 گھنٹے ریسپشن"], amenities: ["وائی فائی", "روزانہ ہاؤس کیپنگ", "قابل رسائی کمرے", "بفے ناشتہ", "روم سروس"] },
      id: { summary: "Profil hotel Madinah yang ditinjau berdasarkan sumber resmi dari situs properti. Hotel menyatakan alamat yang berseberangan dengan Masjid Nabawi dekat Gerbang 338, enam tipe kamar yang dipublikasikan, Wi-Fi, kebersihan harian, resepsionis 24 jam, kamar aksesibel, sarapan prasmanan, dan layanan kamar. Rute masuk ke gerbang yang ditinjau masih tertunda.", highlights: ["6 tipe kamar dipublikasikan", "Berseberangan dengan Masjid Nabawi", "Resepsionis 24 jam"], amenities: ["Wi-Fi", "Kebersihan harian", "Kamar aksesibel", "Sarapan prasmanan", "Layanan kamar"] },
      hi: { summary: "यह मदीना होटल प्रोफ़ाइल संपत्ति की आधिकारिक वेबसाइट के स्रोत-समीक्षित विवरण पर आधारित है। होटल पैगंबर मस्जिद के सामने गेट 338 के पास का पता, छह प्रकाशित कमरे प्रकार, वाई-फाई, दैनिक हाउसकीपिंग, 24 घंटे रिसेप्शन, सुलभ कमरे, बुफे नाश्ता और रूम सर्विस बताता है। प्रवेश से गेट तक का समीक्षित मार्ग अभी लंबित है।", highlights: ["6 प्रकाशित कमरे प्रकार", "पैगंबर मस्जिद के सामने", "24 घंटे रिसेप्शन"], amenities: ["वाई-फाई", "दैनिक हाउसकीपिंग", "सुलभ कमरे", "बुफे नाश्ता", "रूम सर्विस"] },
    }),
  },
  {
    slug: "dar-al-iman-intercontinental", name: "InterContinental Dar Al Iman Madinah", city: "madinah", category: "premium", status: "verified", proximityBand: "haram_side", corporateReady: false,
    address: "2657-Badaah, Unit No. 10, Madinah 42311-6910, Saudi Arabia", mapAddress: "InterContinental Dar Al Iman Madinah, Badaah, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=InterContinental%20Dar%20Al%20Iman%20Madinah", sourceUrl: "https://www.ihg.com/intercontinental/hotels/us/en/madinah/medha/hoteldetail", gallery: ["/manus-storage/01_dar_al_iman_intercontinental__exterior__02_7503a7d3.webp", "/manus-storage/dar-al-iman-madinah-room-2026_6462e1c6.jpg", "/manus-storage/dar-al-iman-madinah-lounge-2026_0038b5bd.jpg"],
    galleryNote: "Property images are not displayed until a partner authorization or commercial-use licence is documented.", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], nearestGate: { name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" },
    content: sourceReviewedContent({
      en: { summary: "A Madinah accommodation option with two restaurants and guest services including Wi-Fi, parking, group check-in support, and 24-hour in-room dining.", highlights: ["Madinah location", "2 restaurants", "Group check-in support"], amenities: ["Wi-Fi", "Parking", "24-hour in-room dining", "Group check-in"] },
      ar: { summary: "خيار إقامة في المدينة المنورة يضم مطعمين وخدمات للضيوف تشمل واي فاي ومواقف سيارات ودعم تسجيل وصول المجموعات وخدمة طعام داخل الغرفة على مدار الساعة.", highlights: ["موقع في المدينة المنورة", "مطعمان", "دعم تسجيل وصول المجموعات"], amenities: ["واي فاي", "مواقف سيارات", "طعام داخل الغرفة على مدار الساعة", "تسجيل وصول المجموعات"] },
      ms: { summary: "Pilihan penginapan di Madinah dengan dua restoran dan perkhidmatan tetamu termasuk Wi-Fi, tempat letak kereta, sokongan daftar masuk kumpulan serta sajian dalam bilik 24 jam.", highlights: ["Lokasi Madinah", "2 restoran", "Sokongan daftar masuk kumpulan"], amenities: ["Wi-Fi", "Tempat letak kereta", "Sajian dalam bilik 24 jam", "Daftar masuk kumpulan"] },
      ur: { summary: "مدینہ میں رہائش کا ایک آپشن جس میں دو ریسٹورنٹس اور وائی فائی، پارکنگ، گروپ چیک اِن سپورٹ اور 24 گھنٹے اِن روم ڈائننگ سمیت مہمان خدمات شامل ہیں۔", highlights: ["مدینہ کا مقام", "2 ریسٹورنٹس", "گروپ چیک اِن سپورٹ"], amenities: ["وائی فائی", "پارکنگ", "24 گھنٹے اِن روم ڈائننگ", "گروپ چیک اِن"] },
      id: { summary: "Pilihan akomodasi di Madinah dengan dua restoran dan layanan tamu termasuk Wi-Fi, parkir, dukungan check-in grup, serta bersantap di kamar 24 jam.", highlights: ["Lokasi Madinah", "2 restoran", "Dukungan check-in grup"], amenities: ["Wi-Fi", "Parkir", "Bersantap di kamar 24 jam", "Check-in grup"] },
      hi: { summary: "मदीना में एक आवास विकल्प, जिसमें दो रेस्तरां और वाई-फाई, पार्किंग, समूह चेक-इन सहायता तथा 24 घंटे इन-रूम डाइनिंग सहित अतिथि सेवाएँ हैं।", highlights: ["मदीना स्थान", "2 रेस्तरां", "समूह चेक-इन सहायता"], amenities: ["वाई-फाई", "पार्किंग", "24 घंटे इन-रूम डाइनिंग", "समूह चेक-इन"] },
    }),
  },
  {
    slug: "anwar-al-madinah-movenpick", name: "Anwar Al Madinah Mövenpick", city: "madinah", category: "premium", status: "verified", proximityBand: "haram_side", corporateReady: false,
    address: "Central Zone, Madinah Al Munawwarah, Saudi Arabia", mapAddress: "Anwar Al Madinah Movenpick, Badaah, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Anwar%20Al%20Madinah%20Movenpick", sourceUrl: "https://movenpick.accor.com/en/middle-east/saudi-arabia/madinah/hotel-madinah-anwar.html", gallery: ["/manus-storage/05_anwar_al_madinah_movenpick__exterior__01_67815a5e.webp", "/manus-storage/anwar-al-madinah-movenpick-room-2026_c2da374e.jpg", "/manus-storage/anwar-al-madinah-movenpick-dining-2026_5929c04d.jpg"],
    galleryNote: "Property images are not displayed until a partner authorization or commercial-use licence is documented.", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], nearestGate: { name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" },
    content: sourceReviewedContent({
      en: { summary: "A Central Zone Madinah accommodation option with rooms and suites, four on-site restaurants, meeting and celebration spaces, and a direct connection to the adjacent mall.", highlights: ["Central Zone", "4 on-site restaurants", "Meetings and celebrations"], amenities: ["Dining", "Meeting and celebration spaces", "Direct mall connection"] },
      ar: { summary: "خيار إقامة في المنطقة المركزية بالمدينة المنورة يضم غرفاً وأجنحة وأربعة مطاعم داخل المنشأة ومساحات للاجتماعات والاحتفالات واتصالاً مباشراً بالمركز التجاري المجاور.", highlights: ["المنطقة المركزية", "4 مطاعم داخل المنشأة", "اجتماعات واحتفالات"], amenities: ["خيارات طعام", "مساحات للاجتماعات والاحتفالات", "اتصال مباشر بالمركز التجاري"] },
      ms: { summary: "Pilihan penginapan di Zon Pusat Madinah dengan bilik dan suite, empat restoran di hotel, ruang mesyuarat dan sambutan, serta sambungan terus ke pusat beli-belah bersebelahan.", highlights: ["Zon Pusat", "4 restoran di hotel", "Mesyuarat dan sambutan"], amenities: ["Pilihan makan", "Ruang mesyuarat dan sambutan", "Sambungan terus ke pusat beli-belah"] },
      ur: { summary: "مرکزی زون مدینہ میں رہائش کا ایک آپشن جس میں کمرے اور سویٹس، چار آن سائٹ ریسٹورنٹس، میٹنگ اور سیلیبریشن اسپیسز اور ملحقہ مال سے براہ راست رابطہ شامل ہے۔", highlights: ["مرکزی زون", "4 آن سائٹ ریسٹورنٹس", "میٹنگز اور سیلیبریشنز"], amenities: ["ڈائننگ", "میٹنگ اور سیلیبریشن اسپیسز", "مال سے براہ راست رابطہ"] },
      id: { summary: "Pilihan akomodasi di Zona Pusat Madinah dengan kamar dan suite, empat restoran di properti, ruang rapat dan perayaan, serta koneksi langsung ke mal yang berdekatan.", highlights: ["Zona Pusat", "4 restoran di properti", "Rapat dan perayaan"], amenities: ["Pilihan bersantap", "Ruang rapat dan perayaan", "Koneksi langsung ke mal"] },
      hi: { summary: "केंद्रीय क्षेत्र मदीना में एक आवास विकल्प, जिसमें कमरे और सुइट, चार ऑन-साइट रेस्तरां, बैठक और समारोह स्थल तथा समीपवर्ती मॉल से सीधा संपर्क है।", highlights: ["केंद्रीय क्षेत्र", "4 ऑन-साइट रेस्तरां", "बैठकें और समारोह"], amenities: ["भोजन", "बैठक और समारोह स्थल", "मॉल से सीधा संपर्क"] },
    }),
  },
  {
    slug: "hilton-madinah", name: "Madinah Hilton", arabicName: "فندق هيلتون المدينة", searchAliases: ["Hilton Madinah"], city: "madinah", category: "premium", status: "verified", proximityBand: "haram_side", corporateReady: false,
    address: "Oppst Prophet Mosque, King Fahd Str, Madinah 41419, Saudi Arabia", mapAddress: "Madinah Hilton, King Fahd Road, Budaah, Madinah 41419, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Madinah%20Hilton%2C%20King%20Fahd%20Street%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.hilton.com/en/hotels/medhihi-madinah-hilton/", gallery: ["/manus-storage/06_hilton_madinah__exterior__01_1980d1b9.webp", "/manus-storage/hilton-madinah-room-2026_ea7e1d25.jpg", "/manus-storage/hilton-madinah-lounge-2026_44577b3d.jpg"],
    galleryNote: "Property images are not displayed until a partner authorization or commercial-use licence is documented.", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], nearestGate: { name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" },
    content: sourceReviewedContent({
      en: { summary: "A central Madinah accommodation option with rooms and suites, two restaurants, a café, and guest services including Wi-Fi, parking, fitness facilities, concierge support, and room service.", highlights: ["Central Madinah location", "2 restaurants and a café", "Rooms and suites"], amenities: ["Wi-Fi", "Parking", "Fitness centre", "Concierge", "Room service"] },
      ar: { summary: "خيار إقامة في وسط المدينة المنورة يضم غرفاً وأجنحة ومطعمين ومقهى، إلى جانب خدمات للضيوف تشمل واي فاي ومواقف سيارات ومرافق لياقة ودعم الكونسيرج وخدمة الغرف.", highlights: ["موقع في وسط المدينة المنورة", "مطعمان ومقهى", "غرف وأجنحة"], amenities: ["واي فاي", "مواقف سيارات", "مركز لياقة", "دعم الكونسيرج", "خدمة الغرف"] },
      ms: { summary: "Pilihan penginapan di pusat Madinah dengan bilik dan suite, dua restoran, sebuah kafe, serta perkhidmatan tetamu termasuk Wi-Fi, tempat letak kereta, kemudahan kecergasan, sokongan concierge dan perkhidmatan bilik.", highlights: ["Lokasi pusat Madinah", "2 restoran dan sebuah kafe", "Bilik dan suite"], amenities: ["Wi-Fi", "Tempat letak kereta", "Pusat kecergasan", "Sokongan concierge", "Perkhidmatan bilik"] },
      ur: { summary: "مرکزی مدینہ میں رہائش کا ایک آپشن جس میں کمرے اور سویٹس، دو ریسٹورنٹس، ایک کیفے اور وائی فائی، پارکنگ، فٹنس، کنسیئرژ سپورٹ اور روم سروس سمیت مہمان خدمات شامل ہیں۔", highlights: ["مرکزی مدینہ کا مقام", "2 ریسٹورنٹس اور ایک کیفے", "کمرے اور سویٹس"], amenities: ["وائی فائی", "پارکنگ", "فٹنس سینٹر", "کنسیئرژ سپورٹ", "روم سروس"] },
      id: { summary: "Pilihan akomodasi di pusat Madinah dengan kamar dan suite, dua restoran, sebuah kafe, serta layanan tamu termasuk Wi-Fi, parkir, fasilitas kebugaran, dukungan pramutamu, dan layanan kamar.", highlights: ["Lokasi pusat Madinah", "2 restoran dan sebuah kafe", "Kamar dan suite"], amenities: ["Wi-Fi", "Parkir", "Pusat kebugaran", "Dukungan pramutamu", "Layanan kamar"] },
      hi: { summary: "केंद्रीय मदीना में एक आवास विकल्प, जिसमें कमरे और सुइट, दो रेस्तरां, एक कैफ़े तथा वाई-फाई, पार्किंग, फिटनेस सुविधाएँ, कंसीयर्ज सहायता और रूम सर्विस जैसी अतिथि सेवाएँ हैं।", highlights: ["केंद्रीय मदीना स्थान", "2 रेस्तरां और एक कैफ़े", "कमरे और सुइट"], amenities: ["वाई-फाई", "पार्किंग", "फिटनेस सेंटर", "कंसीयर्ज सहायता", "रूम सर्विस"] },
    }),
  },
  {
    slug: "millennium-madinah", name: "Millennium Al Aqeeq Hotel", searchAliases: ["Al Aqeeq Madinah", "Al Aqeeq Hotel"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Madinah Al Munawwarah, Saudi Arabia", mapAddress: "Millennium Al Aqeeq Hotel, Musab bin Omeir Street, Budaah, Madinah 42313, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Millennium%20Al%20Aqeeq%20Hotel%2C%20Musab%20Bin%20Omair%20Street%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.millenniumhotels.com/en/madinah/millennium-al-aqeeq-hotel/", gallery: ["/manus-storage/millennium-al-aqeeq-exterior-2026_239eb0d4.webp", "/manus-storage/millennium-al-aqeeq-room-2026_e0b7640d.jpg", "/manus-storage/millennium-al-aqeeq-lobby-2026_19f63fbb.jpg"],
    galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], nearestGate: { name: "King Fahad Gate", address: "King Fahad Gate, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" },
    content: sourceReviewedContent({
      en: { summary: "A Madinah accommodation option offering rooms and suites, two restaurants, a coffee shop, 24-hour room service, and listed facilities including Wi-Fi, a business centre, multilingual staff, and meeting and event spaces.", highlights: ["Rooms and suites", "2 restaurants and coffee shop", "Meeting and event facilities"], amenities: ["Wi-Fi", "Business centre", "Multilingual staff", "Meeting and event facilities", "24-hour room service"] },
      ar: { summary: "خيار إقامة في المدينة المنورة يضم غرفاً وأجنحة ومطعمين ومقهى وخدمة غرف على مدار الساعة، مع مرافق معلنة تشمل واي فاي ومركز أعمال وفريقاً متعدد اللغات ومساحات للاجتماعات والفعاليات.", highlights: ["غرف وأجنحة", "مطعمان ومقهى", "مرافق للاجتماعات والفعاليات"], amenities: ["واي فاي", "مركز أعمال", "فريق متعدد اللغات", "مرافق للاجتماعات والفعاليات", "خدمة الغرف على مدار الساعة"] },
      ms: { summary: "Pilihan penginapan di Madinah dengan bilik dan suite, dua restoran, kedai kopi, perkhidmatan bilik 24 jam, serta kemudahan yang disenaraikan termasuk Wi-Fi, pusat perniagaan, kakitangan berbilang bahasa dan ruang mesyuarat serta acara.", highlights: ["Bilik dan suite", "2 restoran dan kedai kopi", "Kemudahan mesyuarat dan acara"], amenities: ["Wi-Fi", "Pusat perniagaan", "Kakitangan berbilang bahasa", "Kemudahan mesyuarat dan acara", "Perkhidmatan bilik 24 jam"] },
      ur: { summary: "مدینہ میں رہائش کا ایک آپشن جس میں کمرے اور سویٹس، دو ریسٹورنٹس، کافی شاپ، 24 گھنٹے روم سروس اور وائی فائی، بزنس سینٹر، کثیر لسانی عملہ اور میٹنگ و ایونٹ اسپیسز سمیت درج سہولیات شامل ہیں۔", highlights: ["کمرے اور سویٹس", "2 ریسٹورنٹس اور کافی شاپ", "میٹنگ اور ایونٹ سہولیات"], amenities: ["وائی فائی", "بزنس سینٹر", "کثیر لسانی عملہ", "میٹنگ اور ایونٹ سہولیات", "24 گھنٹے روم سروس"] },
      id: { summary: "Pilihan akomodasi di Madinah dengan kamar dan suite, dua restoran, kedai kopi, layanan kamar 24 jam, serta fasilitas yang tercantum termasuk Wi-Fi, pusat bisnis, staf multibahasa, dan ruang rapat serta acara.", highlights: ["Kamar dan suite", "2 restoran dan kedai kopi", "Fasilitas rapat dan acara"], amenities: ["Wi-Fi", "Pusat bisnis", "Staf multibahasa", "Fasilitas rapat dan acara", "Layanan kamar 24 jam"] },
      hi: { summary: "मदीना में एक आवास विकल्प, जिसमें कमरे और सुइट, दो रेस्तरां, कॉफी शॉप, 24 घंटे रूम सर्विस तथा वाई-फाई, बिज़नेस सेंटर, बहुभाषी कर्मचारी और बैठक व कार्यक्रम स्थल जैसी सूचीबद्ध सुविधाएँ हैं।", highlights: ["कमरे और सुइट", "2 रेस्तरां और कॉफी शॉप", "बैठक और कार्यक्रम सुविधाएं"], amenities: ["वाई-फाई", "बिज़नेस सेंटर", "बहुभाषी कर्मचारी", "बैठक और कार्यक्रम सुविधाएं", "24 घंटे रूम सर्विस"] },
    }),
  },
  {
    slug: "radisson-hotel-madinah", name: "Radisson Hotel Madinah", city: "madinah", category: "executive", status: "verified", proximityBand: "city", corporateReady: false,
    address: "4608 Khallad Ibn Suwaid Street, 6316, Ad Duwaimah District, Madinah, Saudi Arabia", mapAddress: "Radisson Hotel Madinah, Building 4608, Khallad Ibn Suwaid Street, 6316 Ad Duwaimah, Madinah 42315, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Radisson%20Hotel%20Madinah%2C%20Al%20Madinah%20Road%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.radissonhotels.com/en-us/destination/saudi-arabia/madinah", gallery: ["/manus-storage/radisson-hotel-madinah-exterior-2026_b832254a.jpg", "/manus-storage/radisson-hotel-madinah-room-2026_a26a9e92.jpg", "/manus-storage/radisson-hotel-madinah-lobby-2026_d0770aeb.jpg"],
    galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: sourceReviewedContent({
      en: { summary: "A Madinah accommodation option with on-site dining, meeting facilities, a gym, and an outdoor pool listed on the official Radisson Hotels destination page.", highlights: ["On-site dining", "Meeting facilities", "Gym and outdoor pool"], amenities: ["Dining", "Meetings", "Gym", "Outdoor pool"] },
      ar: { summary: "خيار إقامة في المدينة المنورة يذكر موقع راديسون الرسمي أنه يضم مطاعم داخل المنشأة ومرافق للاجتماعات ونادياً رياضياً ومسبحاً خارجياً.", highlights: ["مطاعم داخل المنشأة", "مرافق للاجتماعات", "نادٍ رياضي ومسبح خارجي"], amenities: ["خيارات طعام", "اجتماعات", "نادٍ رياضي", "مسبح خارجي"] },
      ms: { summary: "Pilihan penginapan di Madinah dengan tempat makan di hotel, kemudahan mesyuarat, gimnasium dan kolam renang luar yang disenaraikan pada halaman destinasi rasmi Radisson Hotels.", highlights: ["Tempat makan di hotel", "Kemudahan mesyuarat", "Gimnasium dan kolam luar"], amenities: ["Makan", "Mesyuarat", "Gimnasium", "Kolam luar"] },
      ur: { summary: "مدینہ میں رہائش کا ایک آپشن جس کے لیے رڈیسن ہوٹلز کے سرکاری ڈیسٹینیشن صفحے پر آن سائٹ ڈائننگ، میٹنگ سہولیات، جم اور آؤٹ ڈور پول درج ہیں۔", highlights: ["آن سائٹ ڈائننگ", "میٹنگ سہولیات", "جم اور آؤٹ ڈور پول"], amenities: ["ڈائننگ", "میٹنگز", "جم", "آؤٹ ڈور پول"] },
      id: { summary: "Pilihan akomodasi di Madinah dengan pilihan bersantap di properti, fasilitas rapat, pusat kebugaran, dan kolam renang luar yang tercantum di halaman destinasi resmi Radisson Hotels.", highlights: ["Bersantap di properti", "Fasilitas rapat", "Pusat kebugaran dan kolam luar"], amenities: ["Bersantap", "Rapat", "Pusat kebugaran", "Kolam luar"] },
      hi: { summary: "मदीना में एक आवास विकल्प, जिसमें रैडिसन होटल्स के आधिकारिक गंतव्य पृष्ठ पर ऑन-साइट भोजन, बैठक सुविधाएं, जिम और आउटडोर पूल सूचीबद्ध हैं।", highlights: ["ऑन-साइट भोजन", "बैठक सुविधाएं", "जिम और आउटडोर पूल"], amenities: ["भोजन", "बैठकें", "जिम", "आउटडोर पूल"] },
    }),
  },
  {
    slug: "crowne-plaza-madinah", name: "Crowne Plaza Madinah", city: "madinah", category: "premium", status: "verified", proximityBand: "central", corporateReady: true,
    address: "King Faisal Street, Between 1st Ring Road, Madinah, Saudi Arabia", mapAddress: "Crowne Plaza Madinah, 1st Ring Road, Between King Faisal Street, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Crowne%20Plaza%20Madinah%2C%20King%20Faisal%20Street%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.ihg.com/crowneplaza/hotels/us/en/madinah/medin/hoteldetail", gallery: ["/manus-storage/27_crowne_plaza_madinah__exterior__01_8c5800be.webp", "/manus-storage/crowne-plaza-madinah-room-2026_3f671de9.jpg", "/manus-storage/crowne-plaza-madinah-dining-2026_e5165fff.jpg", "/manus-storage/crowne-plaza-madinah-lobby-2026_63fd0d11.jpg"],
    galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], nearestGate: { name: "Al Salam Gate", address: "Al Salam Gate, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" },
    content: sourceReviewedContent({
      en: { summary: "A Madinah accommodation option with 506 rooms and suites, a restaurant and café, business facilities, six meeting rooms, Wi-Fi, daily housekeeping, and parking.", highlights: ["506 rooms and suites", "6 meeting rooms", "Business facilities"], amenities: ["Restaurant and café", "Wi-Fi", "Daily housekeeping", "Parking", "Business centre"] },
      ar: { summary: "خيار إقامة في المدينة المنورة يضم 506 غرف وأجنحة ومطعماً ومقهى ومرافق أعمال وست قاعات للاجتماعات وواي فاي وتنظيفاً يومياً ومواقف للسيارات.", highlights: ["506 غرف وأجنحة", "6 قاعات للاجتماعات", "مرافق أعمال"], amenities: ["مطعم ومقهى", "واي فاي", "تنظيف يومي", "مواقف سيارات", "مركز أعمال"] },
      ms: { summary: "Pilihan penginapan di Madinah dengan 506 bilik dan suite, restoran dan kafe, kemudahan perniagaan, enam bilik mesyuarat, Wi-Fi, pengemasan harian serta tempat letak kereta.", highlights: ["506 bilik dan suite", "6 bilik mesyuarat", "Kemudahan perniagaan"], amenities: ["Restoran dan kafe", "Wi-Fi", "Pengemasan harian", "Parkir", "Pusat perniagaan"] },
      ur: { summary: "مدینہ میں رہائش کا ایک آپشن جس میں 506 کمرے اور سویٹس، ریسٹورنٹ اور کیفے، کاروباری سہولیات، چھ میٹنگ رومز، وائی فائی، روزانہ ہاؤس کیپنگ اور پارکنگ شامل ہیں۔", highlights: ["506 کمرے اور سویٹس", "6 میٹنگ رومز", "کاروباری سہولیات"], amenities: ["ریسٹورنٹ اور کیفے", "وائی فائی", "روزانہ ہاؤس کیپنگ", "پارکنگ", "بزنس سینٹر"] },
      id: { summary: "Pilihan akomodasi di Madinah dengan 506 kamar dan suite, restoran dan kafe, fasilitas bisnis, enam ruang rapat, Wi-Fi, kebersihan harian, dan parkir.", highlights: ["506 kamar dan suite", "6 ruang rapat", "Fasilitas bisnis"], amenities: ["Restoran dan kafe", "Wi-Fi", "Kebersihan harian", "Parkir", "Pusat bisnis"] },
      hi: { summary: "मदीना में एक आवास विकल्प, जिसमें 506 कमरे और सुइट, रेस्तरां और कैफे, व्यावसायिक सुविधाएं, छह बैठक कक्ष, वाई-फाई, दैनिक हाउसकीपिंग और पार्किंग शामिल हैं।", highlights: ["506 कमरे और सुइट", "6 बैठक कक्ष", "व्यावसायिक सुविधाएं"], amenities: ["रेस्तरां और कैफे", "वाई-फाई", "दैनिक हाउसकीपिंग", "पार्किंग", "बिज़नेस सेंटर"] },
    }),
  },
  {
    slug: "doubletree-by-hilton-madinah-gate", name: "DoubleTree by Hilton Madinah Gate", city: "madinah", category: "executive", status: "verified", proximityBand: "transfer", corporateReady: true,
    address: "7965 King Abdul Aziz Road, 3334 Al Hadra District, Madinah 42368, Saudi Arabia", mapAddress: "DoubleTree by Hilton Madinah Gate, 7965 King Abdul Aziz Road, Al Hadra, Madinah 42368, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=DoubleTree%20by%20Hilton%20Madinah%20Gate%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.hilton.com/en/hotels/medmgdi-doubletree-madinah-gate/", gallery: ["/manus-storage/doubletree-madinah-gate-room-2026_d74126a5.jpg", "/manus-storage/doubletree-madinah-gate-dining-2026_59045298.jpg", "/manus-storage/doubletree-madinah-gate-lobby-2026_922440b3.jpg"],
    galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: sourceReviewedContent({
      en: { summary: "A newly built Madinah accommodation option adjacent to Madinah Gate Mall and the Haramain High-Speed Railway Station, with on-site dining, meeting rooms, fitness and business facilities, and a complimentary mosque shuttle service.", highlights: ["Adjacent to Madinah Gate Mall", "Meeting rooms", "Complimentary mosque shuttle"], amenities: ["On-site dining", "Free Wi-Fi", "Fitness centre", "Business centre", "Parking", "Room service"] },
      ar: { summary: "خيار إقامة حديث في المدينة المنورة بجوار مجمع بوابة المدينة ومحطة قطار الحرمين السريع، ويضم مطعماً داخل المنشأة وقاعات للاجتماعات ومرافق لياقة وأعمال وخدمة نقل مجانية إلى المسجد.", highlights: ["بجوار مجمع بوابة المدينة", "قاعات للاجتماعات", "خدمة نقل مجانية إلى المسجد"], amenities: ["مطعم داخل المنشأة", "واي فاي مجاني", "مركز لياقة", "مركز أعمال", "مواقف سيارات", "خدمة غرف"] },
      ms: { summary: "Pilihan penginapan Madinah yang baru dibina bersebelahan Madinah Gate Mall dan Stesen Kereta Api Berkelajuan Tinggi Haramain, dengan tempat makan di hotel, bilik mesyuarat, kemudahan kecergasan dan perniagaan, serta perkhidmatan ulang-alik percuma ke masjid.", highlights: ["Bersebelahan Madinah Gate Mall", "Bilik mesyuarat", "Ulang-alik masjid percuma"], amenities: ["Tempat makan di hotel", "Wi-Fi percuma", "Pusat kecergasan", "Pusat perniagaan", "Parkir", "Khidmat bilik"] },
      ur: { summary: "مدینہ میں ایک نیا تعمیر شدہ رہائشی آپشن جو مدینہ گیٹ مال اور حرمین ہائی اسپیڈ ریلوے اسٹیشن سے متصل ہے، آن سائٹ ڈائننگ، میٹنگ رومز، فٹنس اور بزنس سہولیات اور مسجد کے لیے مفت شٹل سروس کے ساتھ۔", highlights: ["مدینہ گیٹ مال سے متصل", "میٹنگ رومز", "مسجد کے لیے مفت شٹل"], amenities: ["آن سائٹ ڈائننگ", "مفت وائی فائی", "فٹنس سینٹر", "بزنس سینٹر", "پارکنگ", "روم سروس"] },
      id: { summary: "Pilihan akomodasi Madinah yang baru dibangun di samping Madinah Gate Mall dan Stasiun Kereta Cepat Haramain, dengan bersantap di properti, ruang rapat, fasilitas kebugaran dan bisnis, serta layanan antar-jemput masjid gratis.", highlights: ["Di samping Madinah Gate Mall", "Ruang rapat", "Antar-jemput masjid gratis"], amenities: ["Bersantap di properti", "Wi-Fi gratis", "Pusat kebugaran", "Pusat bisnis", "Parkir", "Layanan kamar"] },
      hi: { summary: "मदीना में एक नया बना आवास विकल्प, जो मदीना गेट मॉल और हरमैन हाई-स्पीड रेलवे स्टेशन के निकट है तथा इसमें ऑन-साइट भोजन, बैठक कक्ष, फिटनेस और व्यावसायिक सुविधाएं तथा मस्जिद के लिए निःशुल्क शटल सेवा है।", highlights: ["मदीना गेट मॉल के निकट", "बैठक कक्ष", "मस्जिद के लिए निःशुल्क शटल"], amenities: ["ऑन-साइट भोजन", "निःशुल्क वाई-फाई", "फिटनेस सेंटर", "बिज़नेस सेंटर", "पार्किंग", "रूम सर्विस"] },
    }),
  },
  {
    slug: "al-mokhtara-international", name: "Mokhtara International Hotel", arabicName: "فندق المختارة العالمي", searchAliases: ["Al Mukhtara International Hotel", "Mokhtara International Hotel", "فندق المختارة العالمي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "King Faisal Road, Bada'ah, Madinah 42311, Saudi Arabia", mapAddress: "Mokhtara International Hotel, FJF4+6G, King Faisal Road, Bada'ah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Mokhtara%20International%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://mukhtarahotels.com/", gallery: ["/manus-storage/15_mokhtara_international__exterior__01_3cee8d58.webp", "/manus-storage/15_mokhtara_international__exterior__02_01a4cd8c.webp", "/manus-storage/al-mukhtara-international-room-2026_cc0ede0b.jpg", "/manus-storage/al-mukhtara-international-lobby-2026_73129fbc.jpg"],
    galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: sourceReviewedContent({
      en: { summary: "A Madinah accommodation option listed by its operator, Manazil Al Mukhtara.", highlights: ["Madinah accommodation"], amenities: [] },
      ar: { summary: "خيار إقامة في المدينة المنورة مدرج ضمن منشآت مشغّله، منازل المختارة.", highlights: ["إقامة في المدينة المنورة"], amenities: [] },
      ms: { summary: "Pilihan penginapan di Madinah yang disenaraikan oleh pengendalinya, Manazil Al Mukhtara.", highlights: ["Penginapan di Madinah"], amenities: [] },
      ur: { summary: "مدینہ میں رہائش کا ایک آپشن جو اس کے آپریٹر، منازل المختارہ، کے تحت درج ہے۔", highlights: ["مدینہ میں رہائش"], amenities: [] },
      id: { summary: "Pilihan akomodasi di Madinah yang tercantum oleh operatornya, Manazil Al Mukhtara.", highlights: ["Akomodasi di Madinah"], amenities: [] },
      hi: { summary: "मदीना में एक आवास विकल्प, जो इसके संचालक मनाज़िल अल मुख्तारा द्वारा सूचीबद्ध है।", highlights: ["मदीना आवास"], amenities: [] },
    }),
  },
  {
    slug: "al-ritz-al-madinah", name: "Al Ritz Al Madinah Hotel", city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "148 Abdul Rahman Ibn Awf Street, Budaah District, North Central Area, Madinah, Saudi Arabia", mapAddress: "Al Ritz Al Madinah Hotel, FJF5+5WH, Budaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Ritz%20Al%20Madinah%20Hotel%2C%20148%20Abdul%20Rahman%20Ibn%20Awf%20Street%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://mukhtarahotels.com/hotel?Hotel=6767d5416eb54fffbf59a7e5&checkIn=2026-08-07&checkOut=2026-08-08&rooms=1&adults=1", gallery: ["/manus-storage/al-ritz-al-madinah-exterior-2026_758f5568.jpg", "/manus-storage/al-ritz-al-madinah-room-2026_377c0346.jpg", "/manus-storage/al-ritz-al-madinah-lobby-2026_f3c36798.jpg"],
    galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: sourceReviewedContent({
      en: { summary: "A North Central Area Madinah accommodation option with 250 rooms, two restaurants, on-site parking, and selected accessibility facilities.", highlights: ["250 rooms", "2 restaurants", "North Central Area"], amenities: ["Parking", "Free Wi-Fi", "Room service", "Laundry", "Accessibility facilities"], rooms: [{ name: "Standard Triple Room", detail: "City view · 13 m² · 3 single beds" }, { name: "Standard Double Room", detail: "City view · 13 m² · 2 single beds" }, { name: "Suite Room", detail: "City view · 13 m² · 3 single beds" }, { name: "Standard Quad Room", detail: "City view · 13 m² · 4 single beds" }, { name: "Standard King Room", detail: "City view · 13 m² · 1 king bed" }] },
      ar: { summary: "خيار إقامة في المنطقة المركزية الشمالية بالمدينة المنورة يضم 250 غرفة ومطعمين ومواقف سيارات ومرافق مهيأة مختارة.", highlights: ["250 غرفة", "مطعمان", "المنطقة المركزية الشمالية"], amenities: ["مواقف سيارات", "واي فاي مجاني", "خدمة غرف", "خدمة غسيل", "مرافق مهيأة"], rooms: [{ name: "غرفة ثلاثية قياسية", detail: "إطلالة على المدينة · 13 م² · 3 أسرّة مفردة" }, { name: "غرفة مزدوجة قياسية", detail: "إطلالة على المدينة · 13 م² · سريران مفردان" }, { name: "جناح", detail: "إطلالة على المدينة · 13 م² · 3 أسرّة مفردة" }, { name: "غرفة رباعية قياسية", detail: "إطلالة على المدينة · 13 م² · 4 أسرّة مفردة" }, { name: "غرفة كينغ قياسية", detail: "إطلالة على المدينة · 13 م² · سرير كينغ واحد" }] },
      ms: { summary: "Pilihan penginapan di Madinah di Kawasan Pusat Utara dengan 250 bilik, dua restoran, tempat letak kereta di lokasi dan kemudahan akses terpilih.", highlights: ["250 bilik", "2 restoran", "Kawasan Pusat Utara"], amenities: ["Tempat letak kereta", "Wi-Fi percuma", "Khidmat bilik", "Dobi", "Kemudahan akses"], rooms: [{ name: "Bilik Triple Standard", detail: "Pemandangan bandar · 13 m² · 3 katil bujang" }, { name: "Bilik Double Standard", detail: "Pemandangan bandar · 13 m² · 2 katil bujang" }, { name: "Bilik Suite", detail: "Pemandangan bandar · 13 m² · 3 katil bujang" }, { name: "Bilik Quad Standard", detail: "Pemandangan bandar · 13 m² · 4 katil bujang" }, { name: "Bilik King Standard", detail: "Pemandangan bandar · 13 m² · 1 katil king" }] },
      ur: { summary: "شمالی مرکزی علاقے میں مدینہ کی ایک رہائشی پیشکش جس میں 250 کمرے، دو ریسٹورنٹس، آن سائٹ پارکنگ اور منتخب قابلِ رسائی سہولیات شامل ہیں۔", highlights: ["250 کمرے", "2 ریسٹورنٹس", "شمالی مرکزی علاقہ"], amenities: ["پارکنگ", "مفت وائی فائی", "روم سروس", "لانڈری", "قابلِ رسائی سہولیات"], rooms: [{ name: "اسٹینڈرڈ ٹرپل روم", detail: "شہر کا منظر · 13 م² · 3 سنگل بیڈز" }, { name: "اسٹینڈرڈ ڈبل روم", detail: "شہر کا منظر · 13 م² · 2 سنگل بیڈز" }, { name: "سویٹ روم", detail: "شہر کا منظر · 13 م² · 3 سنگل بیڈز" }, { name: "اسٹینڈرڈ کوآڈ روم", detail: "شہر کا منظر · 13 م² · 4 سنگل بیڈز" }, { name: "اسٹینڈرڈ کنگ روم", detail: "شہر کا منظر · 13 م² · 1 کنگ بیڈ" }] },
      id: { summary: "Pilihan akomodasi Madinah di Area Pusat Utara dengan 250 kamar, dua restoran, parkir di properti, dan fasilitas aksesibilitas tertentu.", highlights: ["250 kamar", "2 restoran", "Area Pusat Utara"], amenities: ["Parkir", "Wi-Fi gratis", "Layanan kamar", "Laundry", "Fasilitas aksesibilitas"], rooms: [{ name: "Kamar Triple Standar", detail: "Pemandangan kota · 13 m² · 3 tempat tidur single" }, { name: "Kamar Double Standar", detail: "Pemandangan kota · 13 m² · 2 tempat tidur single" }, { name: "Kamar Suite", detail: "Pemandangan kota · 13 m² · 3 tempat tidur single" }, { name: "Kamar Quad Standar", detail: "Pemandangan kota · 13 m² · 4 tempat tidur single" }, { name: "Kamar King Standar", detail: "Pemandangan kota · 13 m² · 1 tempat tidur king" }] },
      hi: { summary: "उत्तर केंद्रीय क्षेत्र में मदीना का एक आवास विकल्प, जिसमें 250 कमरे, दो रेस्तरां, ऑन-साइट पार्किंग और चुनिंदा सुलभ सुविधाएं हैं।", highlights: ["250 कमरे", "2 रेस्तरां", "उत्तर केंद्रीय क्षेत्र"], amenities: ["पार्किंग", "निःशुल्क वाई-फाई", "रूम सर्विस", "लॉन्ड्री", "सुलभ सुविधाएं"], rooms: [{ name: "स्टैंडर्ड ट्रिपल रूम", detail: "शहर दृश्य · 13 m² · 3 सिंगल बेड" }, { name: "स्टैंडर्ड डबल रूम", detail: "शहर दृश्य · 13 m² · 2 सिंगल बेड" }, { name: "सुइट रूम", detail: "शहर दृश्य · 13 m² · 3 सिंगल बेड" }, { name: "स्टैंडर्ड क्वाड रूम", detail: "शहर दृश्य · 13 m² · 4 सिंगल बेड" }, { name: "स्टैंडर्ड किंग रूम", detail: "शहर दृश्य · 13 m² · 1 किंग बेड" }] },
    }),
  },
  {
    slug: "al-waqf-serviced-apartments", name: "Waqf Uthman Bin Affan Hotel", city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "176 Abu Dujana Al-Ansari Street, Bada'a District, Northern Central Area, Madinah, Saudi Arabia", mapAddress: "Waqf Othman Bin Affan Hotel, King Faisal Road, Budaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Waqf%20Othman%20Bin%20Affan%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://mokhtaragroup.com/hotels/waqf-uthman-bin-affan", gallery: ["/manus-storage/waqf-uthman-bin-affan-exterior-2026_d8b0f683.jpg", "/manus-storage/24_waqf_othman_bin_affan__room__01_2de361b4.webp", "/manus-storage/waqf-uthman-bin-affan-lobby-2026_2382ecd1.jpg"],
    galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: sourceReviewedContent({
      en: { summary: "A Northern Central Area Madinah accommodation option with 236 rooms and a published capacity of 1,150 beds. The operator lists one restaurant, a coffee shop, free Wi-Fi, 24-hour room service, six elevators, and 26 parking spaces.", highlights: ["236 rooms", "1,150 beds", "Northern Central Area"], amenities: ["Restaurant", "Coffee shop", "Free Wi-Fi", "24-hour room service", "Parking"] },
      ar: { summary: "خيار إقامة في المنطقة المركزية الشمالية بالمدينة المنورة يضم 236 غرفة وسعة منشورة تبلغ 1,150 سريراً. يذكر المشغّل مطعماً واحداً ومقهى وواي فاي مجاني وخدمة غرف على مدار الساعة وستة مصاعد و26 موقفاً للسيارات.", highlights: ["236 غرفة", "1,150 سريراً", "المنطقة المركزية الشمالية"], amenities: ["مطعم", "مقهى", "واي فاي مجاني", "خدمة غرف على مدار الساعة", "مواقف سيارات"] },
      ms: { summary: "Pilihan penginapan di Madinah di Kawasan Pusat Utara dengan 236 bilik dan kapasiti diterbitkan sebanyak 1,150 katil. Pengendali menyenaraikan sebuah restoran, kedai kopi, Wi-Fi percuma, khidmat bilik 24 jam, enam lif dan 26 ruang parkir.", highlights: ["236 bilik", "1,150 katil", "Kawasan Pusat Utara"], amenities: ["Restoran", "Kedai kopi", "Wi-Fi percuma", "Khidmat bilik 24 jam", "Parkir"] },
      ur: { summary: "شمالی مرکزی علاقے میں مدینہ کی ایک رہائشی پیشکش، جس میں 236 کمرے اور 1,150 بستروں کی شائع شدہ گنجائش ہے۔ آپریٹر ایک ریسٹورنٹ، کافی شاپ، مفت وائی فائی، 24 گھنٹے روم سروس، چھ لفٹس اور 26 پارکنگ اسپیسز کا ذکر کرتا ہے۔", highlights: ["236 کمرے", "1,150 بستر", "شمالی مرکزی علاقہ"], amenities: ["ریسٹورنٹ", "کافی شاپ", "مفت وائی فائی", "24 گھنٹے روم سروس", "پارکنگ"] },
      id: { summary: "Pilihan akomodasi Madinah di Area Pusat Utara dengan 236 kamar dan kapasitas yang dipublikasikan sebanyak 1.150 tempat tidur. Operator mencantumkan satu restoran, kedai kopi, Wi-Fi gratis, layanan kamar 24 jam, enam lift, dan 26 ruang parkir.", highlights: ["236 kamar", "1.150 tempat tidur", "Area Pusat Utara"], amenities: ["Restoran", "Kedai kopi", "Wi-Fi gratis", "Layanan kamar 24 jam", "Parkir"] },
      hi: { summary: "उत्तर केंद्रीय क्षेत्र में मदीना का एक आवास विकल्प, जिसमें 236 कमरे और 1,150 बिस्तरों की प्रकाशित क्षमता है। संचालक एक रेस्तरां, कॉफी शॉप, निःशुल्क वाई-फाई, 24 घंटे रूम सर्विस, छह लिफ्ट और 26 पार्किंग स्थान सूचीबद्ध करता है।", highlights: ["236 कमरे", "1,150 बिस्तर", "उत्तर केंद्रीय क्षेत्र"], amenities: ["रेस्तरां", "कॉफी शॉप", "निःशुल्क वाई-फाई", "24 घंटे रूम सर्विस", "पार्किंग"] },
    }),
  },
  {
    slug: "intercontinental-dar-al-hijra-madinah", name: "InterContinental Dar Al Hijra Madinah", arabicName: "فندق دار الهجرة إنتركونتيننتال المدينة", city: "madinah", category: "premium", status: "verified", proximityBand: "central", corporateReady: false,
    address: "King Fahd Road, Al Haram, Madinah 42311, Saudi Arabia", mapAddress: "InterContinental Dar Al Hijra Madinah, King Fahd Road, Al Haram, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=InterContinental%20Dar%20Al%20Hijra%20Madinah%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.ihg.com/intercontinental/hotels/us/en/madinah/medhb/hoteldetail", gallery: ["/manus-storage/intercontinental-dar-al-hijra-madinah-exterior-2026_bb5bbdf7.jpg", "/manus-storage/intercontinental-dar-al-hijra-madinah-room-2026_6abede9f.jpg", "/manus-storage/intercontinental-dar-al-hijra-madinah-lounge-2026_da77c02b.jpg", "/manus-storage/intercontinental-dar-al-hijra-suite-owner-2026-08-27_97543624.jpg", "/manus-storage/intercontinental-dar-al-hijra-guest-room-owner-2026-08-27_38c94bd2.jpg"],
    galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], nearestGate: { name: "King Fahad Gate", address: "King Fahad Gate, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }, content: centralLocationOnlyContent(),
  },
  {
    slug: "view-al-madinah-hotel", name: "View Al Madinah Hotel", arabicName: "فندق فيو المدينة", searchAliases: ["View Hotel Al Madinah", "View Al Madina Hotel", "فندق فيو المدينة المنورة"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "6119 First Ring Road – King Faisal, Al Madinah 42311, Saudi Arabia", mapAddress: "View Al Madinah Hotel, 6119 First Ring Road – King Faisal, Al Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=View%20Al%20Madinah%20Hotel%2C%206119%20First%20Ring%20Road%2C%20King%20Faisal%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.viewalmadinahhotel.com/",
    gallery: [madinahDestinationPlaceholder], galleryKind: "destination_placeholder", galleryNote: "Madinah destination image — not property photography", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
];

function centralLocationOnlyContent(): Record<Locale, HotelContent> {
  return {
    en: { summary: "A Central Area Madinah hotel with a reviewed property location. Contact Al Ghanem Travel to discuss your group’s requirements.", highlights: ["Central Area, Madinah"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
    ar: { summary: "فندق في المنطقة المركزية بالمدينة المنورة مع نقطة موقع تمت مراجعتها. تواصلوا مع الغانم ترافل لمناقشة متطلبات مجموعتكم.", highlights: ["المنطقة المركزية، المدينة المنورة"], amenities: [], rooms: [], nearby: { nabawi: "المسجد النبوي" } },
    ms: { summary: "Hotel di Kawasan Pusat Madinah dengan lokasi hartanah yang telah disemak. Hubungi Al Ghanem Travel untuk membincangkan keperluan kumpulan anda.", highlights: ["Kawasan Pusat, Madinah"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
    ur: { summary: "مرکزی علاقے میں مدینہ کا ایک ہوٹل جس کی پراپرٹی لوکیشن کا جائزہ لیا گیا ہے۔ اپنے گروپ کی ضروریات پر بات کرنے کے لیے Al Ghanem Travel سے رابطہ کریں۔", highlights: ["مرکزی علاقہ، مدینہ"], amenities: [], rooms: [], nearby: { nabawi: "مسجد نبوی" } },
    id: { summary: "Hotel di Area Pusat Madinah dengan lokasi properti yang telah ditinjau. Hubungi Al Ghanem Travel untuk membahas kebutuhan grup Anda.", highlights: ["Area Pusat, Madinah"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
    hi: { summary: "केंद्रीय क्षेत्र में मदीना का एक होटल, जिसका संपत्ति स्थान समीक्षित है। अपने समूह की आवश्यकताओं पर चर्चा करने के लिए अल घनेम ट्रैवल से संपर्क करें।", highlights: ["केंद्रीय क्षेत्र, मदीना"], amenities: [], rooms: [], nearby: { nabawi: "अल-मस्जिद अन-नबवी" } },
  };
}

function cityLocationOnlyContent(): Record<Locale, HotelContent> {
  return {
    en: { summary: "A Madinah hotel with a reviewed property location. Contact Al Ghanem Travel to discuss your group’s requirements.", highlights: ["Madinah property location"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
    ar: { summary: "فندق في المدينة المنورة مع نقطة موقع تمت مراجعتها. تواصلوا مع الغانم ترافل لمناقشة متطلبات مجموعتكم.", highlights: ["موقع منشأة في المدينة المنورة"], amenities: [], rooms: [], nearby: { nabawi: "المسجد النبوي" } },
    ms: { summary: "Hotel di Madinah dengan lokasi hartanah yang telah disemak. Hubungi Al Ghanem Travel untuk membincangkan keperluan kumpulan anda.", highlights: ["Lokasi hartanah di Madinah"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
    ur: { summary: "مدینہ کا ایک ہوٹل جس کی پراپرٹی لوکیشن کا جائزہ لیا گیا ہے۔ اپنے گروپ کی ضروریات پر بات کرنے کے لیے Al Ghanem Travel سے رابطہ کریں۔", highlights: ["مدینہ میں پراپرٹی کا مقام"], amenities: [], rooms: [], nearby: { nabawi: "مسجد نبوی" } },
    id: { summary: "Hotel di Madinah dengan lokasi properti yang telah ditinjau. Hubungi Al Ghanem Travel untuk membahas kebutuhan grup Anda.", highlights: ["Lokasi properti di Madinah"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
    hi: { summary: "मदीना का एक होटल, जिसका संपत्ति स्थान समीक्षित है। अपने समूह की आवश्यकताओं पर चर्चा करने के लिए अल घनेम ट्रैवल से संपर्क करें।", highlights: ["मदीना में संपत्ति स्थान"], amenities: [], rooms: [], nearby: { nabawi: "अल-मस्जिद अन-नबवी" } },
  };
}

/**
 * Location-only hotel records requested by the business. These remain intentionally narrow:
 * a reviewed property pin is shown, while media, facilities, ratings, and gate routes
 * stay absent until direct evidence is available.
 */
const locationOnlyHotelProfiles: HotelProfileDraft[] = [
  {
    slug: "tabah-towers-hotel", name: "Tabah Towers Hotel", arabicName: "فندق أبراج طابة", city: "madinah", category: "value", status: "verification_pending", proximityBand: "city", corporateReady: false,
    address: "2476 Saad bin Muadh Street, Madinah 42311, Saudi Arabia", mapAddress: "Tabah Towers Hotel, 2476 Saad bin Muadh Street, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Tabah%20Towers%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: ["/manus-storage/tabah-towers-exterior-2026_44c9821b.jpg", "/manus-storage/tabah-towers-room-2026_9ce1539b.jpg", "/manus-storage/tabah-towers-lobby-2026_58cfca39.jpg"], galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: {
      en: { summary: "A Madinah accommodation option on Saad bin Muadh Street. A reviewed property location is available; contact Al Ghanem Travel to discuss your group’s requirements.", highlights: ["Madinah property location"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
      ar: { summary: "خيار إقامة في المدينة المنورة على شارع سعد بن معاذ. تتوفر نقطة موقع تمت مراجعتها؛ تواصلوا مع الغانم ترافل لمناقشة متطلبات مجموعتكم.", highlights: ["موقع منشأة في المدينة المنورة"], amenities: [], rooms: [], nearby: { nabawi: "المسجد النبوي" } },
      ms: { summary: "Pilihan penginapan di Madinah di Jalan Saad bin Muadh. Lokasi hartanah yang disemak tersedia; hubungi Al Ghanem Travel untuk membincangkan keperluan kumpulan anda.", highlights: ["Lokasi hartanah di Madinah"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
      ur: { summary: "مدینہ میں سعد بن معاذ اسٹریٹ پر ایک رہائشی آپشن۔ جائزہ شدہ پراپرٹی لوکیشن دستیاب ہے؛ اپنے گروپ کی ضروریات پر بات کرنے کے لیے Al Ghanem Travel سے رابطہ کریں۔", highlights: ["مدینہ میں پراپرٹی کا مقام"], amenities: [], rooms: [], nearby: { nabawi: "مسجد نبوی" } },
      id: { summary: "Pilihan akomodasi di Madinah di Jalan Saad bin Muadh. Lokasi properti yang telah ditinjau tersedia; hubungi Al Ghanem Travel untuk membahas kebutuhan grup Anda.", highlights: ["Lokasi properti di Madinah"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
      hi: { summary: "साद बिन मुआध स्ट्रीट पर मदीना में एक आवास विकल्प। समीक्षित संपत्ति स्थान उपलब्ध है; अपने समूह की आवश्यकताओं पर चर्चा करने के लिए Al Ghanem Travel से संपर्क करें।", highlights: ["मदीना में संपत्ति का स्थान"], amenities: [], rooms: [], nearby: { nabawi: "अल-मस्जिद अन-नबवी" } },
    },
  },
  {
    slug: "silver-tabah-towers-hotel", name: "Silver Tabah Towers Hotel", arabicName: "فندق أبراج طابة الفضي", city: "madinah", category: "value", status: "verification_pending", proximityBand: "city", corporateReady: false,
    address: "6365 Hafsa Bint Omar Street, Al Naqa', Madinah 42311, Saudi Arabia", mapAddress: "Silver Tabah Towers Hotel, 6365 Hafsa Bint Omar Street, Al Naqa', Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Abraj%20Taiba%20Silver%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: ["/manus-storage/silver-tabah-towers-exterior-2026_13ba195a.jpg", "/manus-storage/silver-tabah-towers-room-2026_f9f2534e.jpg", "/manus-storage/silver-tabah-towers-lobby-2026_d59104db.jpg"], galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }],
    content: {
      en: { summary: "A Madinah accommodation option in Al Naqa'. A reviewed property location is available; contact Al Ghanem Travel to discuss your group’s requirements.", highlights: ["Madinah property location"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
      ar: { summary: "خيار إقامة في حي النقا بالمدينة المنورة. تتوفر نقطة موقع تمت مراجعتها؛ تواصلوا مع الغانم ترافل لمناقشة متطلبات مجموعتكم.", highlights: ["موقع منشأة في المدينة المنورة"], amenities: [], rooms: [], nearby: { nabawi: "المسجد النبوي" } },
      ms: { summary: "Pilihan penginapan di Al Naqa', Madinah. Lokasi hartanah yang disemak tersedia; hubungi Al Ghanem Travel untuk membincangkan keperluan kumpulan anda.", highlights: ["Lokasi hartanah di Madinah"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
      ur: { summary: "مدینہ کے النقا میں ایک رہائشی آپشن۔ جائزہ شدہ پراپرٹی لوکیشن دستیاب ہے؛ اپنے گروپ کی ضروریات پر بات کرنے کے لیے Al Ghanem Travel سے رابطہ کریں۔", highlights: ["مدینہ میں پراپرٹی کا مقام"], amenities: [], rooms: [], nearby: { nabawi: "مسجد نبوی" } },
      id: { summary: "Pilihan akomodasi di Al Naqa', Madinah. Lokasi properti yang telah ditinjau tersedia; hubungi Al Ghanem Travel untuk membahas kebutuhan grup Anda.", highlights: ["Lokasi properti di Madinah"], amenities: [], rooms: [], nearby: { nabawi: "Al-Masjid an-Nabawi" } },
      hi: { summary: "अल नक़ा, मदीना में एक आवास विकल्प। समीक्षित संपत्ति स्थान उपलब्ध है; अपने समूह की आवश्यकताओं पर चर्चा करने के लिए Al Ghanem Travel से संपर्क करें।", highlights: ["मदीना में संपत्ति का स्थान"], amenities: [], rooms: [], nearby: { nabawi: "अल-मस्जिद अन-नबवी" } },
    },
  },
  {
    slug: "valy-al-madinah-hotel", name: "Valy Al Madinah Hotel", arabicName: "فندق فالي المدينة", city: "madinah", category: "value", status: "verification_pending", proximityBand: "central", corporateReady: false,
    address: "443 Abdullah bin Haram Street, DMAA6119, Madinah 42311, Saudi Arabia", mapAddress: "Valy Al Madina Hotel, 443 Abdullah bin Haram Street, DMAA6119, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Valy%20Al%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.valyalmadina.com/",
    gallery: ["/manus-storage/valy-al-madinah-hotel-exterior-2026_e706d6e4.jpg", "/manus-storage/valy-al-madinah-hotel-room-2026_64284af8.jpg", "/manus-storage/valy-al-madinah-hotel-lobby-2026_ab1a8bc2.jpeg"], galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "makarem-burj-al-madinah", name: "Makarem Burj Al Madinah", arabicName: "فندق مكارم برج المدينة", searchAliases: ["Makarem Burj Al Madinah Hotel and Suites"], city: "madinah", category: "executive", status: "verification_pending", proximityBand: "central", corporateReady: false,
    address: "7008 Musab Bin Umair, Badhaah District, Madinah 42311, Saudi Arabia", mapAddress: "Makarem Burj Almadinah, 7008 Musab Bin Umair, Badhaah District, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Makarem%20Burj%20Al%20Madinah%2C%207008%20Musab%20Bin%20Umair%2C%20Madinah", sourceUrl: "https://makaremhotels.com/en/hotels/makarem-burj-al-madina",
    gallery: ["/manus-storage/makarem-burj-al-madinah-exterior-2026_33720bd0.jpg", "/manus-storage/makarem-burj-al-madinah-room-2026_6df6f493.jpg", "/manus-storage/makarem-burj-al-madinah-lounge-2026_4a4761d5.jpg"], galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "jayden-hotel-madinah", name: "Jayden Hotel", arabicName: "فندق جايدن", city: "madinah", category: "executive", status: "verification_pending", proximityBand: "central", corporateReady: false,
    address: "3192 Jaafar bin Abi Talib Street, Building 6111, Madinah 42311, Saudi Arabia", mapAddress: "Jayden Hotel, 3192 Jaafar bin Abi Talib Street, Building 6111, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Jayden%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://jaydenhotel.com/",
    gallery: ["/manus-storage/jayden-hotel-madinah-exterior-2026_0ad0294c.jpg", "/manus-storage/jayden-hotel-madinah-room-2026_111d52bd.jpg", "/manus-storage/jayden-hotel-madinah-lobby-2026_9e4761b9.jpg"], galleryNote: "Hotel gallery", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "sofitel-shahd-al-madinah", name: "Sofitel Shahd Al Madinah", arabicName: "فندق سوفيتل شهد المدينة", city: "madinah", category: "premium", status: "verified", proximityBand: "haram_side", corporateReady: false,
    address: "King Fahd Road Building 2943, Al Madinah, Abi Obaidah Ibn Al Jarrah 42311, Saudi Arabia", mapAddress: "Sofitel Shahd Al Madinah, Building 2943 King Fahd Road, Bada'ah, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=24.4720979%2C39.611539", sourceUrl: "https://all.accor.com/hotel/B9X5/index.en.shtml",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "dallah-taibah", name: "Dallah Taibah Hotel", arabicName: "فندق دلة طيبة", searchAliases: ["Dallah Taibah", "دلة طيبة"], city: "madinah", category: "executive", status: "verified", proximityBand: "haram_side", corporateReady: false,
    address: "3005 Abi Zar Street, Markaziah, Madinah 42311, Saudi Arabia", mapAddress: "Dallah Taibah Hotel, 3005 Abi Zar Street, Markaziah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Dallah%20Taibah%20Hotel%2C%203005%20Abi%20Zar%20Street%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/travel/hotels/dallah-taibah-hotel-hotels",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "novotel-madinah", name: "Novotel Madinah", arabicName: "فندق نوفوتيل المدينة المنورة", searchAliases: ["Novotel Al Madinah", "نوفوتيل المدينة"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "King Faisal Road, Al Manakhah District 2110, Madinah 42311, Saudi Arabia", mapAddress: "Novotel Madinah, 2110 King Faisal Road, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=24.47091%2C39.60348", sourceUrl: "https://all.accor.com/hotel/B9H5/index.en.shtml",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "kayan-international-hotel", name: "Kayan International Hotel", arabicName: "فندق كيان العالمي", searchAliases: ["Kayan Hotel", "Kayan Al Alami Hotel", "فندق كيان العالمي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "First Ring Road, King Faisal, Bada'ah, Madinah 42311, Saudi Arabia", mapAddress: "Kayan International Hotel, First Ring Road, King Faisal, Bada'ah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Kayan%20International%20Hotel%2C%20First%20Ring%20Road%2C%20King%20Faisal%2C%20Badaah%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/travel/hotels/entity/CgsI5uSS_6C446PFARAB",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "al-manakha-rotana-madinah", name: "Al Manakha Rotana Madinah", arabicName: "فندق المناخة روتانا المدينة", searchAliases: ["Al Manakha Rotana", "Rotana Al Manakha Madinah", "روتانا المناخة"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "6154 2479 Abu Ayyub Al-Ansari, Al Haram, Madinah 42311, Saudi Arabia", mapAddress: "Al Manakha Rotana Madinah, 6154 2479 Abu Ayyub Al-Ansari, Al Haram, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Manakha%20Rotana%20Madinah%2C%206154%202479%20Abu%20Ayyub%20Al-Ansari%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://www.rotana.com/rotanahotelandresorts/kingdomofsaudiarabia/madinah/almanakharotana",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "mysk-al-balad-madinah", name: "Mysk Al Balad Hotel Madinah", arabicName: "فندق مسك البلد المدينة", searchAliases: ["Mysk Al Balad", "Mysk Touch Al Balad", "مسك البلد"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "District 2767, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Mysk Al Balad Hotel Madinah, District 2767, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Mysk%20Al%20Balad%20Hotel%20Madinah%2C%20District%202767%2C%20Bani%20Khidrah%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://myskhotels.com/en/our-hotels/mysk-al-balad/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "maden-hotel-madinah", name: "Maden Hotel", arabicName: "فندق مادن", searchAliases: ["MADEN Hotel", "فندق مادن"], city: "madinah", category: "premium", status: "verified", proximityBand: "central", corporateReady: false,
    address: "King Fahd Road, Bada'ah, Madinah 41441, Saudi Arabia", mapAddress: "Maden Hotel, King Fahd Road, Bada'ah, Madinah 41441, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Maden%20Hotel%2C%20King%20Fahd%20Road%2C%20Badaah%2C%20Madinah%2041441%2C%20Saudi%20Arabia", sourceUrl: "https://madenhotels.com/en/hotels-maden-2/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "elaf-al-taqwa-madinah", name: "Elaf Al Taqwa Hotel", arabicName: "فندق إيلاف التقوى", searchAliases: ["Elaf Al Taqwa", "إيلاف التقوى"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Elaf Al Taqwa Hotel, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Elaf%20Al%20Taqwa%20Hotel%2C%20Bani%20Khidrah%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://www.elafhotels.com/en/elaf-al-taqwa",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "elaf-taiba-madinah", name: "Elaf Taiba Hotel", arabicName: "فندق إيلاف طيبة", searchAliases: ["New ELAF Taiba Hotel", "فندق إيلاف طيبة الجديد"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Bada'ah, Madinah 42311, Saudi Arabia", mapAddress: "Elaf Taiba Hotel, Bada'ah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=New%20ELAF%20Taiba%20Hotel%2C%20Badaah%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://www.elafhotels.com/en/elaf-taiba",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "taiba-front-madinah", name: "Taiba Front Hotel", arabicName: "فندق واجهة طيبة", searchAliases: ["Taiba Front Madinah Hotel", "Taiba Front Madinah", "واجهة طيبة"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Musab Bin Omair Street, Bada'ah, Madinah 42313, Saudi Arabia", mapAddress: "Taiba Front Hotel, Musab Bin Omair Street, Bada'ah, Madinah 42313, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Taiba%20Front%20Hotel%2C%20Musab%20Bin%20Omair%20Street%2C%20Badaah%2C%20Madinah%2042313%2C%20Saudi%20Arabia", sourceUrl: "https://aqeeqhotels.com/taibafronthotel/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "emaar-taibah-madinah", name: "Emaar Taibah Hotel", arabicName: "فندق إعمار طيبة", searchAliases: ["Emaar Taiba Hotel", "إعمار طيبة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "FJ83+MFG, Saad ibn Abi Waqqas Street, Al Markaziyah Al Janubiyah, Madinah 42386, Saudi Arabia", mapAddress: "Emaar Taibah Hotel, FJ83+MFG, Saad ibn Abi Waqqas Street, Al Markaziyah Al Janubiyah, Madinah 42386, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Emaar%20Taibah%20Hotel%2C%20FJ83%2BMFG%2C%20Madinah%2042386%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/travel/hotels/entity/ChoI9o728rWIkqaiARoNL2cvMTF0YzB2OGx5YxAB",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(), nearestGate: { name: "Al Salam Gate B", address: "Al Salam Gate B, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" },
  },
  {
    slug: "swiss-international-taba-al-salam", name: "Swiss International Taba Al Salam", arabicName: "فندق سويس إنترناشيونال طيبة السلام", searchAliases: ["Swiss International Taba Alsalam", "Taba Al Salam", "طابة السلام"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Zubair ibn Al Awwam Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Swiss International Taba Al Salam, Al Zubair ibn Al Awwam Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Swiss%20International%20Taba%20Al%20Salam%2C%20Al%20Zubair%20ibn%20Al%20Awwam%20Street%2C%20Al%20Manakhah%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://www.alkhomri.com.sa/en/sector-details/3",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(), nearestGate: { name: "Al Salam Gate B", address: "Al Salam Gate B, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" },
  },
  {
    slug: "emaar-maktan-madinah", name: "Emaar Maktan Hotel", arabicName: "فندق إعمار مكتان", searchAliases: ["Emaar Mektan Hotel", "Emaar Al Mektan Hotel", "Golden Tulip Al Mektan", "فندق إعمار المكتان"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "2234 Al Salam Road, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Emaar Maktan Hotel, 2234 Al Salam Road, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Emaar%20Maktan%20Hotel%2C%202234%20Al%20Salam%20Road%2C%20Al%20Manakhah%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com.gh/travel/hotels/entity/ChkItfb-wrjdjt8FGg0vZy8xMWszd3d0bTlmEAE",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "jiwar-al-madina", name: "Jiwar Al Madina Hotel", arabicName: "فندق جوار المدينة", searchAliases: ["Jiwar Al-Madina", "Jiwar Hotel", "جوار المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "2736 Al Haytham ibn Abi Sinan, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Jiwar Al Madina Hotel, 2736 Al Haytham ibn Abi Sinan, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Jiwar%20Al%20Madina%20Hotel%2C%202736%20Al%20Haytham%20ibn%20Abi%20Sinan%2C%20Bani%20Khidrah%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://www.jiwaralmadina.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "maden-al-rawda-madinah", name: "Maden Al Rawda Hotel", arabicName: "فندق مادن الروضة", searchAliases: ["Maden Alrawda Hotel", "Al Rawda Royal Inn", "مادن الروضة"], city: "madinah", category: "premium", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Markaziyah Al Shamaliyah, Madinah 42311, Saudi Arabia", mapAddress: "Maden Al Rawda Hotel, Al Markaziyah Al Shamaliyah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Maden%20Al%20Rawda%20Hotel%2C%20Al%20Markaziyah%20Al%20Shamaliyah%2C%20Madinah%2042311%2C%20Saudi%20Arabia", sourceUrl: "https://madenhotels.com/en/hotels-maden-alrawda/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "faraj-almadina-hotel", name: "Faraj Almadina Hotel", arabicName: "فندق فرج المدينة", searchAliases: ["Faraj Al Madinah Hotel", "Faraj Al Madina Hotel", "فندق فرج المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "Uthman Ibn Affan Road, Masjid Ad-Dira, Madinah 42313, Saudi Arabia", mapAddress: "Faraj Almadina Hotel, Uthman Ibn Affan Road, Masjid Ad-Dira, Madinah 42313, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Faraj%20Almadina%20Hotel%2C%20Uthman%20Ibn%20Affan%20Road%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.faraj-almadina-hotel.com/index.ar.html",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: cityLocationOnlyContent(),
  },
  {
    slug: "jawharat-al-rasheed-madinah", name: "Jawharat Al Rasheed Hotel", arabicName: "فندق جوهرة الرشيد", searchAliases: ["Jawhret Al Rashid Hotel", "Al Jawhara Hotel", "Al Jawhara Madinah", "فندق جوهرة الرشيد"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "2292 Al Salam Road, Al Haram, Madinah 42311, Saudi Arabia", mapAddress: "Jawharat Al Rasheed Hotel, 2292 Al Salam Road, Al Haram, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Jawhara%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://jawharatalrasheedhotel.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "manarat-al-taj-madinah", name: "Manarat Al Taj Hotel", arabicName: "فندق منارة التاج", searchAliases: ["Manarat Al-Taj Hotel", "فندق منارة التاج"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "FJ74+993, Al Naqa, Madinah 42311, Saudi Arabia", mapAddress: "Manarat Al Taj Hotel, FJ74+993, Al Naqa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Taj%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.traveloka.com/en-en/hotel/saudi-arabia/manarat-al-taj-hotel-9000000546994",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "manar-al-eiman-madinah", name: "Manar Al Eiman Hotel", arabicName: "فندق منار الإيمان", searchAliases: ["Manar Aleiman Hotel", "Manar Al Iman Hotel", "فندق منار الإيمان"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "FJ75+VMG, Prince Abdul Al Mohsen Bin Abdul Aziz Road, Al Haram, Madinah 42311, Saudi Arabia", mapAddress: "Manar Al Eiman Hotel, FJ75+VMG, Prince Abdul Al Mohsen Bin Abdul Aziz Road, Al Haram, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Manar%20Al%20Eiman%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Manar%20Al%20Eiman%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "bosphorus-hotel-medina", name: "Bosphorus Hotel Medina", arabicName: "فندق البوسفور المدينة", searchAliases: ["Le Bosphorus Al Madinah", "Bosphorus Hotel Madinah", "فندق البسفور المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "FJ83+RR, Al Salam Street, Al Gharbiyah, Madinah 42311, Saudi Arabia", mapAddress: "Bosphorus Hotel Medina, FJ83+RR, Al Salam Street, Al Gharbiyah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Bosphorus%20Hotel%20Medina%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://bosphorus-group.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "mirage-al-salam-madinah", name: "Mirage Al Salam Hotel", arabicName: "فندق ميراج السلام", searchAliases: ["Mirage As Salam Hotel", "Mirage Al-Salam Hotel", "فندق ميراج السلام"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "FJ84+R6, Road Near Gate Salam, Al Salam Road, Madinah, Saudi Arabia", mapAddress: "Mirage Al Salam Hotel, FJ84+R6, Road Near Gate Salam, Al Salam Road, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Mirage%20Al%20Salam%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Mirage%20Al%20Salam%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "al-mukhtara-diamond-madinah", name: "Al Mokhtara Diamond Hotel", arabicName: "فندق المختارة الماسي", searchAliases: ["Al Mukhtara Almasi Hotel", "Mokhtara Diamond Hotel", "فندق المختارة الماسي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "FJ83+MX9, Abi Hurairah Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Al Mokhtara Diamond Hotel, FJ83+MX9, Abi Hurairah Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Mukhtara%20Diamond%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Mukhtara%20Diamond%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "hayah-salam-silver-madinah", name: "Hayah Salam Silver Hotel", arabicName: "فندق حياة السلام الفضي", searchAliases: ["Hayah Al Salam Al Fadi Hotel", "Hayah Al Salam Silver Hotel", "فندق حياة السلام الفضي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "FJ83+CV, Al Naqaa, Madinah 42311, Saudi Arabia", mapAddress: "Hayah Salam Silver Hotel, FJ83+CV, Al Naqaa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Hayah%20Salam%20Silver%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Hayah%20Salam%20Silver%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "wardat-al-rayyan-madinah", name: "Wardat Al Rayyan Hotel", arabicName: "فندق وردة الريان", searchAliases: ["Warda Al Rayan Hotel", "Wardat Al Rayan", "فندق وردة الريان"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "FJ94+J83, Al Haram, Madinah 42311, Saudi Arabia", mapAddress: "Wardat Al Rayyan Hotel, FJ94+J83, Al Haram, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Wardat%20Al%20Rayyan%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Wardat%20Al%20Rayyan%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "al-jaad-madinah", name: "Al Jaad Madinah Hotel", arabicName: "فندق الجاد المدينة", searchAliases: ["Aljaad Madinah Hotel", "Jad Al Madinah Hotel", "فندق الجاد المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Bab Al Salam Road, Saad ibn Abi Waqqas Street, Al Naqaa, Madinah, Saudi Arabia", mapAddress: "Al Jaad Madinah Hotel, FJ83+HF, Bab Al Salam Road, Saad ibn Abi Waqqas Street, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Jaad%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Jaad%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "diyar-al-huda-madinah", name: "Diyar Al Huda Hotel", arabicName: "فندق ديار الهدى", searchAliases: ["Diyar Al Hoda Hotel", "Diyar Al-Huda Hotel", "فندق ديار الهدى"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Bara ibn Azib Al Awsi Street, Al Naqaa, Madinah 42311, Saudi Arabia", mapAddress: "Diyar Al Huda Hotel, FJ83+9C, Al Bara ibn Azib Al Awsi Street, Al Naqaa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Al%20Huda%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Al%20Huda%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "rawabi-al-zahra-madinah", name: "Rawabi Al Zahra Hotel", arabicName: "فندق روابي الزهراء", searchAliases: ["Rawabi Al Zahraa Hotel", "Rawabi Al Zahrah Hotel", "فندق روابي الزهراء"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Salam Road, Al Naqaa, Madinah 42311, Saudi Arabia", mapAddress: "Rawabi Al Zahra Hotel, FJ83+RH, Al Salam Road, Al Naqaa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Rawabi%20Al%20Zahra%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Rawabi%20Al%20Zahra%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "bosphorus-hotel-al-salam", name: "Bosphorus Hotel Al Salam", arabicName: "فندق البوسفور السلام", searchAliases: ["Bosphorus Al Salam Hotel", "Le Bosphorus Al Salam", "فندق البوسفور السلام"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Saad Ibn Abi Waqas Street, Al Naqaa, Madinah 42311, Saudi Arabia", mapAddress: "Bosphorus Hotel Al Salam, Saad Ibn Abi Waqas Street, Al Naqaa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Bosphorus%20Hotel%20Al%20Salam%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://bosphorus-group.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "arjwan-rose-madinah", name: "Arjwan Rose Hotel", arabicName: "فندق أرجوان روز", searchAliases: ["Arjwan Rose Hotel Madinah", "Arjwan Rose", "فندق ارجوان روز"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Salam Road, Al Naqaa, Madinah 42311, Saudi Arabia", mapAddress: "Arjwan Rose Hotel, FJ83+CCP, Al Salam Road, Al Naqaa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Arjwan%20Rose%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Arjwan%20Rose%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "bosphorus-waqf-safi-madinah", name: "Bosphorus Hotel Waqf Safi", arabicName: "فندق البوسفور وقف الصافي", searchAliases: ["Bosphorus Waqf Al Safi Hotel", "Le Bosphorus Waqf Al Safi", "فندق البسفور وقف الصافي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Zubair ibn Al Awam Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Bosphorus Hotel Waqf Safi, FJC3+4Q, Al Zubair ibn Al Awam Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Bosphorus%20Waqf%20Al%20Safi%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://bosphorus-group.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "karam-taibah-almasi-madinah", name: "Karam Taibah Almasi", arabicName: "فندق كرم طيبة الماسي", searchAliases: ["Karam Taibah Almasi Hotel", "Karam Taibah Al Masi", "فندق كرم طيبة الماسي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "6700 Saeed Bin Zaid Al-Qurashi Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Karam Taibah Almasi, FJ93+RR, 6700 Saeed Bin Zaid Al-Qurashi Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Karam%20Taibah%20Almasi%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Karam%20Taibah%20Almasi%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "holiday-villa-madinah", name: "Holiday Villa Madinah", arabicName: "فندق هوليداي فيلا المدينة", searchAliases: ["Holiday Villa Hotel Madinah", "Holiday Villa Medina", "فندق هوليداي فيلا المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Abu Dujana Street, Bada'ah, Northern Central Area, Madinah 42311, Saudi Arabia", mapAddress: "Holiday Villa Madinah, FJF4+8G, Abu Dujana Street, Bada'ah, Northern Central Area, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Holiday%20Villa%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.holidayvillahotels.com/holiday-villa-madinah/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "al-muna-kareem-madinah", name: "Al Muna Kareem Hotel", arabicName: "فندق المنى كريم", searchAliases: ["Al Muna Kareem", "Leader Al Muna Kareem Hotel", "فندق المنى كريم"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "King Faisal Road, beside Imam Bukhari Mosque, Bada'ah, Madinah, Saudi Arabia", mapAddress: "Al Muna Kareem Hotel, FJF7+47, King Faisal Road, beside Imam Bukhari Mosque, Bada'ah, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Muna%20Kareem%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.almunakareem.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "dar-al-naeem-madinah", name: "Dar Al Naeem Hotel", arabicName: "فندق دار النعيم", searchAliases: ["Dar Al-Naeem Hotel", "Dar Al Naem Hotel", "فندق دار النعيم"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Sitteen Street, King Faisal Road, Northern Central Area, Madinah 42311, Saudi Arabia", mapAddress: "Dar Al Naeem Hotel, FJF7+C3, Al Sitteen Street, King Faisal Road, Northern Central Area, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Dar%20Al%20Naeem%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Dar%20Al%20Naeem%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "zowar-international-madinah", name: "Zowar International Hotel", arabicName: "فندق زوار إنترناشيونال", searchAliases: ["Zowar Alalami Hotel", "Zowar International", "فندق زوار العالمي", "فندق زوار إنترناشيونال"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Abdul Rahman Ibn Ouf Street, Bada'ah, Madinah 42311, Saudi Arabia", mapAddress: "Zowar International Hotel, FJF5+8F, Abdul Rahman Ibn Ouf Street, Bada'ah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Zowar%20International%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Zowar%20International%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "odst-al-madinah", name: "Odst Al Madinah Hotel", arabicName: "فندق أودست المدينة", searchAliases: ["ODST AL Madinah Hotel", "Odst Almadinah Hotel", "فندق اودست المدينة", "فندق أودست المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "7 Abdul Rahman Ibn Awaf Street, Bada'ah, Madinah, Saudi Arabia", mapAddress: "Odst Al Madinah Hotel, FJF5+F7, 7 Abdul Rahman Ibn Awaf Street, Bada'ah, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Odst%20Al%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Odst%20Al%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "golden-tulip-al-ansar-madinah", name: "Golden Tulip Al Ansar", arabicName: "فندق الأنصار جولدن توليب", searchAliases: ["Al Ansar Golden Tulip", "Hotel Golden Tulip Al Ansar", "فندق الأنصار جولدن توليب"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Central Area, Bada'ah, Madinah 42311, Saudi Arabia", mapAddress: "Golden Tulip Al Ansar, FJF5+38, Central Area, Bada'ah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Ansar%20Golden%20Tulip%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://al-ansar.goldentulip.com/en-us/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "emaar-elite-madinah", name: "Emaar Elite Hotel", arabicName: "فندق إعمار إيليت", searchAliases: ["Emaar Elite Al Madina Hotel", "Emaar Elite Hotel Al Madinah", "فندق اعمار ايليت", "فندق إعمار إيليت"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Bada'ah, Madinah 42311, Saudi Arabia", mapAddress: "Emaar Elite Hotel, FJC4+FM, Bada'ah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Emaar%20Elite%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Emaar%20Elite%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "hayah-golden-madinah", name: "Hayah Golden Hotel", arabicName: "فندق الحياة الذهبي", searchAliases: ["Al Hayat Golden Hotel", "Al Hayah Golden Hotel", "Hayah Golden", "فندق الحياة الذهبي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Hayah Golden Hotel, FJ93+PV9, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Hayah%20Golden%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Hayah%20Golden%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "grand-zowar-madinah", name: "Grand Zowar Hotel", arabicName: "فندق جراند الزوار", searchAliases: ["Grand Zowar", "Grand Zowar Hotel Madinah", "فندق جراند زوار", "جراند الزوار"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Salman Al Farsi Street, Al Haram, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Grand Zowar Hotel, FJ93+76, Salman Al Farsi Street, Al Haram, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Zowar%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://almokhtaragroup.com/ar/grand-zowar",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "hayah-al-huda-madinah", name: "Hayah Al Huda Hotel", arabicName: "فندق حياة الهدى", searchAliases: ["Hayat Al Huda Hotel", "Hayah Al Huda", "فندق حياه الهدى", "فندق حياة الهدى"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "6574 Muawiyah ibn Abi Sufyan Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Hayah Al Huda Hotel, FJ93+9F, 6574 Muawiyah ibn Abi Sufyan Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Hayah%20Al%20Huda%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Hayah%20Al%20Huda%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "riyadh-al-zahra-madinah", name: "Riyadh Al Zahra Hotel", arabicName: "فندق رياض الزهراء", searchAliases: ["Riadh Al Zahra Hotel", "Riyadh Al Zahra", "فندق الرياض الزهراء", "فندق رياض الزهراء"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Zubair ibn Al Awam Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Riyadh Al Zahra Hotel, FJ93+CP, Al Zubair ibn Al Awam Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Riyadh%20Al%20Zahra%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Riyadh%20Al%20Zahra%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "waqt-al-nazeel-madinah", name: "Waqt Al Nazeel Hotel", arabicName: "فندق وقت النزيل", searchAliases: ["Waqt Al Nazeel", "فندق وقت النزيل", "وقت النزيل"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "2209 Al Bara ibn Azib Al Awsi Street, An Naqa, Madinah 42311, Saudi Arabia", mapAddress: "Waqt Al Nazeel Hotel, FJ83+JH, 2209 Al Bara ibn Azib Al Awsi Street, An Naqa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Waqt%20Al%20Nazeel%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.alzuhdigrouphotels.com/ar/hotels/8",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "araek-taiba-madinah", name: "Araek Taiba Hotel", arabicName: "فندق أرائك طيبة", searchAliases: ["Areek Taiba Hotel", "Araek Taiba", "فندق ارائك طيبة", "فندق أرائك طيبة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "6782 Saeed ibn Zaid Al Qurashi Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Araek Taiba Hotel, FJ93+VV, 6782 Saeed ibn Zaid Al Qurashi Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Araek%20Taiba%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Araek%20Taiba%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "rabwat-al-safwa-golden-madinah", name: "Rabwat Al Safwa Golden Hotel", arabicName: "فندق ربوة الصفوة الذهبي", searchAliases: ["Rabwat Al Safwah Golden Hotel", "Rabwah Al Safwa Golden Hotel", "فندق ربوة الصفوة الذهبي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Rabwat Al Safwa Golden Hotel, FJC3+2G, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Rabwat%20Al%20Safwa%20Golden%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Rabwat%20Al%20Safwa%20Golden%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "diyar-wahat-al-nazeel-madinah", name: "Diyar Wahat Al Nazeel Hotel", arabicName: "فندق ديار واحة النزيل", searchAliases: ["DIYAR WAHT AL NAZZEL HOTEL", "Diyar Wahet Nazeel", "فندق ديار واحة النزيل"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Zubair ibn Al Awam Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Diyar Wahat Al Nazeel Hotel, FJC3+6PV, Al Zubair ibn Al Awam Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Wahat%20Al%20Nazeel%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Wahat%20Al%20Nazeel%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "mias-al-madinah", name: "Mias Hotel", arabicName: "فندق مياس", searchAliases: ["Mias Al Madina Hotel", "Mias Al Madinah Hotel", "Mias Hotel", "فندق مياس المدينة", "فندق مياس"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Salam Road, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Mias Hotel, FJ94+38, Al Salam Road, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Mias%20Al%20Madina%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "http://www.miasmedina.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "al-mokhtara-al-gharbi-madinah", name: "Al Mokhtara Al Gharbi Hotel", arabicName: "فندق المختارة الغربي", searchAliases: ["Al Mukhtara Al Gharbi Hotel", "Mokhtara Al Gharbi", "فندق المختارة الغربي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Salam Street, Central West, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Al Mokhtara Al Gharbi Hotel, FJ93+7C, Al Salam Street, Central West, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Mukhtara%20Al%20Gharbi%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://mukhtarahotels.com/hotel?Hotel=677292a9727cb1f6f7400f99",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "diyar-al-madinah-madinah", name: "Diyar Al Madinah Hotel", arabicName: "فندق ديار المدينة", searchAliases: ["Diyar Al Madina Hotel", "Diyar Al Madinah", "فندق ديار المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "2538 King Faisal First Ring Road, An Naqa, Madinah 42311, Saudi Arabia", mapAddress: "Diyar Al Madinah Hotel, FJ74+GG, 2538 King Faisal First Ring Road, An Naqa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Al%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Al%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "mohamadia-al-zahra-madinah", name: "Mohamadia Al Zahra Hotel", arabicName: "فندق محمدية الزهراء", searchAliases: ["Mohammadiya Al Zahra Hotel", "Mohamadia Al Zahra", "فندق محمديه الزهراء", "فندق محمدية الزهراء"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "6082 Khuzaimah ibn Thabit Street, An Naqa, Madinah 42311, Saudi Arabia", mapAddress: "Mohamadia Al Zahra Hotel, FJ74+P5, 6082 Khuzaimah ibn Thabit Street, An Naqa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Mohamadia%20Al%20Zahra%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Mohamadia%20Al%20Zahra%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "anwar-al-zahraa-madinah", name: "Anwar Al Zahraa Hotel", arabicName: "فندق أنوار الزهراء", searchAliases: ["Anwar Al Zahra Hotel", "Anwar Al-Zahra Hotel", "فندق انوار الزهراء", "فندق أنوار الزهراء"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Haram, An Naqa, Madinah 42311, Saudi Arabia", mapAddress: "Anwar Al Zahraa Hotel, FJ74+F5, Al Haram, An Naqa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Anwar%20Al%20Zahraa%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.anwaralzahrahotel.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "diyafa-al-mukhtara-madinah", name: "Diyafa Al Mukhtara Hotel", arabicName: "فندق ضيافة المختارة", searchAliases: ["Dyafat Al Mokhtara Hotel", "Diyafah Al Mukhtara", "فندق شركة ضيافة المختارة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Sa’d ibn Abi Waqqas Street, Al Naqa’ District, West Central Area, Madinah, Saudi Arabia", mapAddress: "Diyafa Al Mukhtara Hotel, FJ73+GX, 2267 King Faisal Road, An Naqa, Madinah 42351, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Diyafa%20Al%20Mukhtara%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://mukhtarahotels.com/hotel?Hotel=6772a802727cb1f6f740106a",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "diyar-al-sater-madinah", name: "Diyar Al Sater Hotel", arabicName: "فندق ديار الساتر", searchAliases: ["DIYAR AL SATER", "Diyar Al Sater", "فندق ديار الساتر"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Madinah Al Munawwarah, Saudi Arabia", mapAddress: "Diyar Al Sater Hotel, 24.481597, 39.6173284, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=24.481597%2C39.6173284", sourceUrl: "https://www.google.com/maps/place/DIYAR+AL+SATER/@24.481597,39.6363828,15z/data=!4m13!1m2!2m1!1sDiyar+Al+Sater+Hotel,+Madinah,+Saudi+Arabia!3m9!1s0x15bdbf001f3cbe69:0xa8cb3f9ea11cb45e!5m2!4m1!1i2!8m2!3d24.481597!4d39.6173284!15sCitEaXlhciBBbCBTYXRlciBIb3RlbCwgTWFkaW5haCwgU2F1ZGkgQXJhYmlhkgEFaG90ZWzgAQA!16s%2Fg%2F11vkb72hfy",
    gallery: [madinahDestinationPlaceholder], galleryKind: "destination_placeholder", galleryNote: "Madinah destination image — not property photography", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "diyar-al-salam-madinah", name: "Diyar Al Salam Hotel", arabicName: "فندق ديار السلام", searchAliases: ["Diyar Al-Salam Hotel", "Diyar Al Salam", "فندق ديار السلام"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Salman Al Farsi Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Diyar Al Salam Hotel, FJ93+4M7, Salman Al Farsi Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Al%20Salam%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com.sa/travel/hotels/%D8%A8%D8%A6%D8%B1-%D8%B9%D8%AB%D9%85%D8%A7%D9%86-hotels/entity/ChkIyvqKio2E18kYGg0vZy8xMWI2YzRfbWM4EAE?utm_campaign=sharing&utm_medium=link&utm_source=htls",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(), nearestGate: { name: "Al Salam Gate", address: "Al Salam Gate, Al-Masjid an-Nabawi, Madinah, Saudi Arabia" },
  },
  {
    slug: "diyar-al-salam-silver-madinah", name: "Diyar Al Salam Silver Hotel", arabicName: "فندق ديار السلام الفضي", searchAliases: ["Diyar Al Salam Silver", "Diyar Al-Salam Silver Hotel", "فندق ديار السلام الفضي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Sa’d ibn Abi Waqqas Street, Al Naqa, Madinah 42311, Saudi Arabia", mapAddress: "Diyar Al Salam Silver Hotel, FJ83+MGF, Sa’d ibn Abi Waqqas Street, Al Naqa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Al%20Salam%20Silver%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Al%20Salam%20Silver%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(), nearestGate: { name: "Haram Courtyard Gate No. 316", address: "Haram Courtyard Gate No 316 Side Starting, FJ85+X47, Al Haram, Madinah 42311, Saudi Arabia" },
  },
  {
    slug: "grand-plaza-al-madinah", name: "Grand Plaza Al Madinah", arabicName: "فندق جراند بلازا المدينة المنورة", searchAliases: ["Grand Plaza Al Madina", "Al Salihiya Taibah", "فندق جراند بلازا المدينة"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "FJ87+42, Abu Ayyub Al Ansari Street, Badaah, Madinah 42311, Saudi Arabia", mapAddress: "Grand Plaza Al Madinah, FJ87+42, Abu Ayyub Al Ansari Street, Badaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Plaza%20Al%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://maysangroup.com/hotels/grand-plaza-al-madina/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "grand-plaza-badr-al-maqam", name: "Grand Plaza Badr Al Maqam", arabicName: "فندق جراند بلازا بدر المقام", searchAliases: ["Grand Plaza Badar Al Maqam", "Badr Al Maqam Hotel", "فندق جراند بلازا بدر المقام"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Madinah Al Munawwarah, Saudi Arabia", mapAddress: "Grand Plaza Badr Al Maqam, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Grand%20Plaza%20Badr%20Al%20Maqam%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://maysangroup.com/hotels/grand-plaza-badr-al-maqam/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "diyar-ajwa-tapestry-hilton", name: "Diyar Ajwa, Tapestry Collection by Hilton", arabicName: "فندق ديار عجوة، مجموعة تابستري من هيلتون", searchAliases: ["Diyar Ajwa Hilton", "Diyar Ajwa Tapestry Hilton", "فندق ديار عجوة هيلتون"], city: "madinah", category: "premium", status: "verified", proximityBand: "central", corporateReady: false,
    address: "159 Mus’ab bin Umair Street, Buddaah District, Madinah 42311, Saudi Arabia", mapAddress: "Diyar Ajwa, Tapestry Collection by Hilton, FJC5+Q9, 159 Mus’ab bin Umair Street, Buddaah District, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Ajwa%2C%20Tapestry%20Collection%20by%20Hilton%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.hilton.com/en/hotels/medinup-diyar-ajwa-tapestry-collection-by-hilton/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "the-venue-al-harithia", name: "The Venue Al Harithia Hotel", arabicName: "فندق ذا فينيو الحارثية", searchAliases: ["Maysan Al Harithia Hotel", "Frontel Al Harithia", "فندق ميسان الحارثية", "فندق فرنتيل الحارثية"], city: "madinah", category: "premium", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Badaah, Madinah Al Munawwarah, Saudi Arabia", mapAddress: "The Venue Al Harithia Hotel, Maysan Al Harithia Hotel, Badaah, Madinah Al Munawwarah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=The%20Venue%20Al%20Harithia%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://maysangroup.com/hotels/maysan-al-harithia/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "al-saha-hotel-madinah", name: "Al Saha Hotel", arabicName: "فندق الساحة", searchAliases: ["Al Saha Al Madinah", "فندق الساحة المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "3054 Zaid Ibn Thabet Street, Badaah, Madinah 42311, Saudi Arabia", mapAddress: "Al Saha Hotel, FJF7+22, 3054 Zaid Ibn Thabet Street, Badaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Saha%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Saha%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "safwat-al-madinah", name: "Safwat Almadinah Hotel", arabicName: "فندق صفوة المدينة", searchAliases: ["Safwat Al Madinah Hotel", "Safwat Al Madina Hotel", "فندق صفوة المدينة المنورة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "3025 Talha Ibn Ubaydullah Street, Badaah, Madinah 42311, Saudi Arabia", mapAddress: "Safwat Almadinah Hotel, FJF6+4X, 3025 Talha Ibn Ubaydullah Street, Badaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Safwat%20Almadinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Safwat%20Almadinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "artal-al-monawwarah", name: "Artal Al-Monawwarah Hotel", arabicName: "فندق أرتال المنورة", searchAliases: ["Artal Al Monawarah Hotel", "Artal Al Munawarah Hotel", "فندق ارتال المنورة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Badaah, Madinah 42311, Saudi Arabia", mapAddress: "Artal Al-Monawwarah Hotel, FJF7+943, Badaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Artal%20Al-Monawwarah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Artal%20Al-Monawwarah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "maysan-al-taqwa", name: "Maysan Al Taqwa Hotel", arabicName: "فندق ميسان التقوى", searchAliases: ["Maysan Altaqwa", "Maysan AL Taqwa", "فندق ميسان التقوى"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "3214 Central Area Pedestrian Walkway, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Maysan Al Taqwa Hotel, FJ77+FP, 3214 Central Area Pedestrian Walkway, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Maysan%20Al%20Taqwa%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://maysangroup.com/hotels/maysan-al-taqwa-hotel/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "ruve-al-madinah", name: "Ruve Hotel Medinah", arabicName: "فندق روف المدينة", searchAliases: ["Ruve Al Madinah Hotel", "Ruve Hotel Madinah", "فندق روڤ المدينة"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Northern Central Area, Al Haram, Madinah 42310, Saudi Arabia", mapAddress: "Ruve Hotel Medinah, FJF7+34, Northern Central Area, Al Haram, Madinah 42310, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Ruve%20Al%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Ruve%20Al%20Madinah%20Hotel%2C%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "ancyra-rose-madinah", name: "AncyrA Rose Hotel by Continent Madinah", arabicName: "فندق أنكيرا روز المدينة بإدارة كونتيننت", searchAliases: ["AncyrA Hotel by Continent", "Ancyra Hotel Madinah", "Ancyra Hotel", "فندق أنكيرا المدينة المنورة"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "First Ring Road – King Faisal, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "AncyrA Rose Hotel by Continent Madinah, FJ77+F2, First Ring Road – King Faisal, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Ancyra%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.ancyramadinahotel.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "worth-peninsula-madinah", name: "Worth Peninsula Hotel", arabicName: "فندق وورث بيننسولا", searchAliases: ["Peninsula Worth Hotel", "Worth Hotel Peninsula", "فندق بيننسولا وورث"], city: "madinah", category: "premium", status: "verified", proximityBand: "central", corporateReady: false,
    address: "King Fahd Road, Badaah, Madinah 42311, Saudi Arabia", mapAddress: "Worth Peninsula Hotel, FJF6+HGF, King Fahd Road, Badaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Peninsula%20Worth%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Peninsula%20Worth%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "tulip-inn-al-daar-rawafid", name: "Tulip Inn Al Daar Rawafid", arabicName: "فندق توليب إن الدار روافد", searchAliases: ["Tulip Inn Al Dar Rawafed", "Tulip Inn Al Dar Madinah", "توليب إن الدار"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Saeed Ibn Zaid Al Qurashi Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Tulip Inn Al Daar Rawafid, FJ93+VW, Saeed Ibn Zaid Al Qurashi Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Tulip%20Inn%20Al%20Daar%20Rawafid%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://tulip-inn-al-dar-madinah.goldentulip.com/en-us/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "maien-taiba", name: "Maien Taiba Hotel", arabicName: "فندق معين طيبة", searchAliases: ["Maien Taiba", "Maien Al Madina Taiba", "فندق ميين طيبة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "444 Abdullah bin Haram Street, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Maien Taiba Hotel, FJ77+M7, 444 Abdullah bin Haram Street, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Maien%20Taiba%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.maienalmadina.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "diyar-al-taqwa-madinah", name: "Diyar Al Taqwa Hotel", arabicName: "فندق ديار التقوى", searchAliases: ["Diyar Altaqwa Hotel", "Diyar Al Taqwa", "ديار التقوى"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Saeed Ibn Zaid Al Qurashi Street, Al Manakhah, Madinah 42311, Saudi Arabia", mapAddress: "Diyar Al Taqwa Hotel, FJ93+GW, Saeed Ibn Zaid Al Qurashi Street, Al Manakhah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Al%20Taqwa%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Diyar%20Al%20Taqwa%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "assaafa-hotel-madinah", name: "Assaafa Hotel", arabicName: "فندق السعفة", searchAliases: ["As'Saafa Hotel", "Assafa Hotel", "فندق الصفاء"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Saad bin Abi Waqas, Al Naqa', Madinah 42311, Saudi Arabia", mapAddress: "Assaafa Hotel, FJ73+W9, Saad bin Abi Waqas, Al Naqa', Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Assaafa%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://assaafahotels.com/",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "nusk-al-hijrah-madinah", name: "Nusk Al Hijrah Hotel", arabicName: "فندق نسك الهجرة", searchAliases: ["Nusk Al-Hijrah Hotel", "Nusuk Al Hijrah Hotel", "نسك الهجرة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Saad bin Ubadah, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Nusk Al Hijrah Hotel, FJ75+WV, Saad bin Ubadah, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Nusk%20Al%20Hijrah%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Nusk%20Al%20Hijrah%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "castle-hotel-madinah", name: "Castle Hotel", arabicName: "فندق كاسيل", searchAliases: ["CASTLE HOTEL", "فندق القلعة", "Castle Hotel Madinah"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Abu Ayyub Al Ansari, Bani Khidrah, Madinah 12345, Saudi Arabia", mapAddress: "Castle Hotel, FJ75+H2, Abu Ayyub Al Ansari, Bani Khidrah, Madinah 12345, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Castle%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Castle%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "plaza-inn-ohud-madinah", name: "Plaza Inn Ohud", arabicName: "فندق بلازا إن أحد", searchAliases: ["Plaza Inn Uhud", "Plaza Inn Ohud Hotel", "بلازا إن أحد"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Saad bin Abi Waqas, Al Naqa', Madinah 42311, Saudi Arabia", mapAddress: "Plaza Inn Ohud, FJ83+G8, Saad bin Abi Waqas, Al Naqa', Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Plaza%20Inn%20Ohud%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Plaza%20Inn%20Ohud%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "belvedere-hotel-madinah", name: "Belvedere Hotel", arabicName: "فندق بيلفيديري", searchAliases: ["Belvedere Hotel Madinah", "فندق بيلفيديري طمأنينة سابقاً", "فندق طمأنينة"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "Harmalah Ibn Amr, Al Uraidh, Madinah 42314, Saudi Arabia", mapAddress: "Belvedere Hotel, FJJQ+X6, Harmalah Ibn Amr, Al Uraidh, Madinah 42314, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Belvedere%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Belvedere%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "aurion-al-aqeeq-madinah", name: "AURION Hotel Al-Aqeeq", arabicName: "فندق أوريون العقيق", searchAliases: ["Aurion Al Aqeeq Hotel", "AURION Hotel Al Aqeeq", "أوريون العقيق"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "3550 Jamhour Ibn Sufyan Street, Al Jamawat, Madinah 42371, Saudi Arabia", mapAddress: "AURION Hotel Al-Aqeeq, FH7F+6V, 3550 Jamhour Ibn Sufyan Street, Al Jamawat, Madinah 42371, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Aurion%20Al%20Aqeeq%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Aurion%20Al%20Aqeeq%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "aval-hotel-madinah", name: "AVAL Hotel", arabicName: "فندق أفال", searchAliases: ["Aval Hotel Madinah", "فندق آفال", "AVAL Hotel Madinah"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "Jabbar Ibn Sakhr, Al Khalidiyah, Madinah 42317, Saudi Arabia", mapAddress: "AVAL Hotel, FM76+4C, Jabbar Ibn Sakhr, Al Khalidiyah, Madinah 42317, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=AVAL%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=AVAL%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "al-sada-al-masi-madinah", name: "Al Sada Al Masi Hotel", arabicName: "فندق السادة الماسي", searchAliases: ["Al Sada Al Masi", "Sama Al Masi Hotel", "فندق سما الماسي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "2165 Saad bin Abi Waqas, Al Naqa', Madinah 42311, Saudi Arabia", mapAddress: "Al Sada Al Masi Hotel, FH8X+5QJ, 2165 Saad bin Abi Waqas, Al Naqa', Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Sama%20Al%20Masi%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Sama%20Al%20Masi%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "maysan-rihab-al-misk-madinah", name: "Maysan Rihab Al Misk", arabicName: "فندق ميسان رحاب المسك", searchAliases: ["Maysan Rihab Al-Misk Hotel", "Rihab Al Misk Hotel", "رحاب المسك"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "6132 Anas Ibn Malik, Al Naqa', Madinah 42311, Saudi Arabia", mapAddress: "Maysan Rihab Al Misk, FJ75+Q2, 6132 Anas Ibn Malik, Al Naqa', Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Maysan%20Rihab%20Al%20Misk%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Maysan%20Rihab%20Al%20Misk%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "durrah-al-eiman-madinah", name: "Durrah Al Eiman Hotel", arabicName: "فندق درة الإيمان", searchAliases: ["Kingsgate Durra Hotel", "Kingsgate Durra", "درة الإيمان"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "7079 Abu Dujanah Al Ansari, Madinah 42311, Saudi Arabia", mapAddress: "Durrah Al Eiman Hotel, FJF4+5H, 7079 Abu Dujanah Al Ansari, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Kingsgate%20Durra%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Kingsgate%20Durra%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "saraya-taba-hotel-a-madinah", name: "Saraya Taba Hotel A", arabicName: "فندق سرايا طابة A", searchAliases: ["Saraya Taba Hotel", "Saraya Taba", "سرايا طابة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "King Faisal Road, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Saraya Taba Hotel A, FJ77+QHR, King Faisal Road, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Saraya%20Taba%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Saraya%20Taba%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "manazeli-al-madinah", name: "Manazeli Al Madinah Hotel", arabicName: "فندق منازلي المدينة", searchAliases: ["Manazeli Al Madinah", "Manazil Al Madinah Hotel", "منازلي المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Hussein Ibn Ali, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Manazeli Al Madinah Hotel, FJ86+34F, Al Hussein Ibn Ali, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Manazeli%20Al%20Madinah%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Manazeli%20Al%20Madinah%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "hayah-plaza-madinah", name: "Hayah Plaza Hotel", arabicName: "فندق الحياة بلازا", searchAliases: ["Hayah Plaza", "Al Hayah Plaza Hotel", "فندق الحياه بلازا"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "2664 Saad bin Ubadah, Madinah 42311, Saudi Arabia", mapAddress: "Hayah Plaza Hotel, FJ75+XG, 2664 Saad bin Ubadah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Hayah%20Plaza%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Hayah%20Plaza%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "qasr-al-andalus-golden-madinah", name: "Qasr Al Andalus Golden Hotel", arabicName: "فندق قصر الأندلس الذهبي", searchAliases: ["Al Andalus Golden Palace Hotel", "Qasr Al Andalus Golden", "قصر الأندلس الذهبي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "2537 Saad Ibn Muadh, Madinah 42311, Saudi Arabia", mapAddress: "Qasr Al Andalus Golden Hotel, FJF5+72, 2537 Saad Ibn Muadh, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Qasr%20Al%20Andalus%20Golden%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Qasr%20Al%20Andalus%20Golden%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "al-waha-rawdah-madinah", name: "Al Waha Rawdah Hotel", arabicName: "فندق الواحة الروضة", searchAliases: ["Al Waha Al Rawdah Hotel", "Waha Rawdah", "الواحة الروضة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Al Waha Rawdah Hotel, FJ74+GXR, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Waha%20Rawdah%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Al%20Waha%20Rawdah%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "manazel-al-aswaf-madinah", name: "Manazel Al Aswaf Hotel", arabicName: "فندق منازل الأسواف", searchAliases: ["Manazil Al Aswaf Hotel", "Al Aswaf Hotel", "منازل الأسواف"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Haytham Ibn Abi Sinan, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Manazel Al Aswaf Hotel, FJ75+HP, Al Haytham Ibn Abi Sinan, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Manazel%20Al%20Aswaf%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Manazel%20Al%20Aswaf%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "rotana-al-misk-madinah", name: "Rotana Al Misk Hotel", arabicName: "فندق روتانا المسك", searchAliases: ["Rotana Misk Hotel", "Rotana Al Misk", "روتانا المسك"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Abdulmohsen Ibn Abdulaziz, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Rotana Al Misk Hotel, FJ75+MMH, Abdulmohsen Ibn Abdulaziz, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Rotana%20Al%20Misk%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Rotana%20Al%20Misk%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "golden-madinah-hotel", name: "Golden Madinah Hotel", arabicName: "فندق المدينة الذهبي", searchAliases: ["Al Madinah Golden Hotel", "Golden Al Madinah Hotel", "المدينة الذهبي"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Abu Ayyub Al Ansari, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Golden Madinah Hotel, FJ85+4X, Abu Ayyub Al Ansari, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Golden%20Madinah%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Golden%20Madinah%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "dar-al-eiman-grand-madinah", name: "Dar Al Eiman Grand Hotel", arabicName: "فندق دار الإيمان جراند", searchAliases: ["Dar Al Iman Grand Hotel", "Dar Eiman Grand", "دار الإيمان جراند"], city: "madinah", category: "executive", status: "verified", proximityBand: "central", corporateReady: false,
    address: "2735 Saad bin Ubadah, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Dar Al Eiman Grand Hotel, FJ75+QR, 2735 Saad bin Ubadah, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Dar%20Al%20Eiman%20Grand%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Dar%20Al%20Eiman%20Grand%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "nusk-al-madinah-hotel", name: "Nusk Al Madinah Hotel", arabicName: "فندق نسك المدينة", searchAliases: ["Nusk Madinah Hotel", "Nusk Al Madinah", "نسك المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Saad bin Ubadah, Bani Khidrah, Madinah 42316, Saudi Arabia", mapAddress: "Nusk Al Madinah Hotel, FJ75+QR, Saad bin Ubadah, Bani Khidrah, Madinah 42316, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Nusk%20Al%20Madinah%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Nusk%20Al%20Madinah%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "nusk-al-eman-hotel", name: "Nusk Al Eman Hotel", arabicName: "فندق نسك الإيمان", searchAliases: ["Nusk Al Iman Hotel", "Nusk Al Eiman Hotel", "Nusk Al Eman", "Ramada Al Qibla", "رمادا القبلة", "نسك الإيمان"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Abu Ayyub Al-Ansari, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Nusk Al Eman Hotel, 24.465418, 39.609299, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=24.465418%2C39.609299", sourceUrl: "https://nuskaleman.com/",
    gallery: ["/manus-storage/nusk-al-eman-exterior_4d999c54.jpg"], galleryNote: "Hotel exterior image", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "rama-al-madinah-hotel", name: "Rama Al Madinah Hotel", arabicName: "فندق راما المدينة", searchAliases: ["Rama Madinah Hotel", "Rama Al Madina Hotel", "راما المدينه"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Prince Abdulmohsen Ibn Abdulaziz Road, Bani Khidrah, Madinah 42311, Saudi Arabia", mapAddress: "Rama Al Madinah Hotel, FJ75+HR, Prince Abdulmohsen Ibn Abdulaziz Road, Bani Khidrah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Rama%20Al%20Madinah%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Rama%20Al%20Madinah%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "jiwar-taiba-madinah", name: "Jiwar Taiba Hotel", arabicName: "فندق جوار طيبة", searchAliases: ["Jowar Taiba Hotel", "Jiwar Taibah", "جوار طيبة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Al Naqa', Madinah 42311, Saudi Arabia", mapAddress: "Jiwar Taiba Hotel, FJ74+FRM, Al Naqa', Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Jowar%20Taiba%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Jowar%20Taiba%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "luluat-al-diyafa-madinah", name: "Luluat Al Diyafa Hotel", arabicName: "فندق لؤلؤة الضيافة", searchAliases: ["Luluat Al Diyafah Hotel", "Luluat Al Deyafah", "لؤلؤة الضيافة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "6236 Al Hasan ibn Ali ibn Abi Talib, An Naqa, Madinah 42311, Saudi Arabia", mapAddress: "Luluat Al Diyafa Hotel, FJ83+3R, 6236 Al Hasan ibn Ali ibn Abi Talib, An Naqa, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=%D9%81%D9%86%D8%AF%D9%82%20%D9%84%D8%A4%D9%84%D8%A4%D8%A9%20%D8%A7%D9%84%D8%B6%D9%8A%D8%A7%D9%81%D8%A9%20%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9%20%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9", sourceUrl: "https://www.google.com/maps/search/?api=1&query=%D9%81%D9%86%D8%AF%D9%82%20%D9%84%D8%A4%D9%84%D8%A4%D8%A9%20%D8%A7%D9%84%D8%B6%D9%8A%D8%A7%D9%81%D8%A9%20%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D9%86%D8%A9%20%D8%A7%D9%84%D9%85%D9%86%D9%88%D8%B1%D8%A9",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "abraj-al-diyafah-madinah", name: "Abraj Al Diyafah Hotel", arabicName: "فندق أبراج الضيافة", searchAliases: ["Abraj Al Diyafa Hotel", "Diyafa Tower Hotel", "أبراج الضيافة"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "Diyafa Tower, Madinah, Saudi Arabia", mapAddress: "Abraj Al Diyafah Hotel, FJJ8+X5, Diyafa Tower, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Abraj%20Al%20Diyafah%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Abraj%20Al%20Diyafah%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "lulu-al-arab-madinah", name: "Hotel Lulu Al Arab", arabicName: "فندق لولو العرب", searchAliases: ["Lulu Al Arab Hotel", "Lulu Al Arab", "لولو العرب"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "2705 Asim ibn Sufyan, As Sih, Madinah 42313, Saudi Arabia", mapAddress: "Hotel Lulu Al Arab, FJ92+55, 2705 Asim ibn Sufyan, As Sih, Madinah 42313, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Hotel%20Lulu%20Al%20Arab%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Hotel%20Lulu%20Al%20Arab%20Madinah%2C%20Saudi%20Arabia",
    gallery: [madinahDestinationPlaceholder], galleryKind: "destination_placeholder", galleryNote: "Madinah destination image — not property photography", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "luluat-quba-madinah", name: "Luluat Quba Hotel", arabicName: "فندق لؤلؤة قباء", searchAliases: ["Luluat Quba", "Luluat Quba Hotel", "لؤلؤة قباء"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "Prince Abdulmohsen Ibn Abdulaziz Street, Qurban, Madinah, Saudi Arabia", mapAddress: "Luluat Quba Hotel, FJ66+28Q, Prince Abdulmohsen Ibn Abdulaziz Street, Qurban, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Luluat%20Quba%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Luluat%20Quba%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [madinahDestinationPlaceholder], galleryKind: "destination_placeholder", galleryNote: "Madinah destination image — not property photography", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "zaha-taiba-madinah", name: "Zaha Taiba Hotel", arabicName: "فندق زها طيبة", searchAliases: ["ZAHA TAIBA HOTEL", "Zaha Taiba", "زها طيبة"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "3328 Abu Dharr Al Ghifari, Al Masani, Madinah 42313, Saudi Arabia", mapAddress: "Zaha Taiba Hotel, FJH7+QR, 3328 Abu Dharr Al Ghifari, Al Masani, Madinah 42313, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Zaha%20Taiba%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Zaha%20Taiba%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "afaq-al-masi-madinah", name: "Afaq Al Masi Hotel", arabicName: "فندق آفاق الماسي", searchAliases: ["Afaaq Al Masi Hotel", "Afaq Al Masi", "آفاق الماسي"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "6984 Omar ibn Abdulaziz Road, Qurban, Madinah 42316, Saudi Arabia", mapAddress: "Afaq Al Masi Hotel, CJXC+PW, 6984 Omar ibn Abdulaziz Road, Qurban, Madinah 42316, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Afaq%20Al%20Masi%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Afaq%20Al%20Masi%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "afaq-al-salam-golden-madinah", name: "Afaq Al Salam Golden Hotel", arabicName: "فندق آفاق السلام الذهبي", searchAliases: ["Afaq Al Salam Golden", "Afaq Al Salam", "فندق افاق السلام الذهبي", "آفاق السلام الذهبي"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "9342 Salamah ibn Ghayadh, Madinah 42315, Saudi Arabia", mapAddress: "Afaq Al Salam Golden Hotel, FH8X+J3, 9342 Salamah ibn Ghayadh, Madinah 42315, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Afaq%20Al%20Salam%20Golden%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Afaq%20Al%20Salam%20Golden%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "cladium-hotel-madinah", name: "Cladium Hotel", arabicName: "فندق كلاديوم", searchAliases: ["Cladium", "كلاديوم"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "Al Arqam ibn Abi Al Arqam Street, Bani Muawiyah, Madinah, Saudi Arabia", mapAddress: "Cladium Hotel, FJCM+F5R, Al Arqam ibn Abi Al Arqam Street, Bani Muawiyah, Madinah, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Cladium%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Cladium%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "shaza-al-baraka-madinah", name: "Shaza Al Baraka Hotel", arabicName: "فندق شذا البركة", searchAliases: ["Shaza Baraka Hotel", "Shatha Al Baraka Hotel", "فندق شذاالبركه", "شذا البركة"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "Rabiah ibn Khuwailid Al Ahmasi, As Suqya, Madinah 42315, Saudi Arabia", mapAddress: "Shaza Al Baraka Hotel, FH6X+X9, Rabiah ibn Khuwailid Al Ahmasi, As Suqya, Madinah 42315, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Shaza%20Baraka%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Shaza%20Baraka%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "zaha-al-munawara-madinah", name: "Zaha Al Munawara Hotel", arabicName: "فندق زها المنورة", searchAliases: ["Zaha Al Munawarah Hotel", "Zaha Al Munawara", "فندق زها المنوره", "زها المنورة"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "Al Salam Road, As Suqya, Al Nazil, Madinah 42315, Saudi Arabia", mapAddress: "Zaha Al Munawara Hotel, FH8X+PQ, Al Salam Road, As Suqya, Al Nazil, Madinah 42315, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Zaha%20Al%20Munawara%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Zaha%20Al%20Munawara%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "shaza-regency-plaza-madinah", name: "Shaza Regency Plaza Hotel", arabicName: "فندق شذا ريجنسي بلازا", searchAliases: ["Shaza Regency Plaza", "شذا ريجنسي بلازا"], city: "madinah", category: "value", status: "verified", proximityBand: "central", corporateReady: false,
    address: "King Faisal Road, Badaah, Madinah 42311, Saudi Arabia", mapAddress: "Shaza Regency Plaza Hotel, FJF6+G3, King Faisal Road, Badaah, Madinah 42311, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Shaza%20Regency%20Plaza%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Shaza%20Regency%20Plaza%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "rabwat-al-safwa-7-madinah", name: "Rabwat Al Safwa 7 Hotel", arabicName: "فندق ربوة الصفوة 7", searchAliases: ["Rabwat Al Safwa 7", "Rabwah Al Safwa 7 Hotel", "ربوة الصفوة 7"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "7182 Abdulaziz Al Habti, Bani Abd Al Ashhal, Madinah 42313, Saudi Arabia", mapAddress: "Rabwat Al Safwa 7 Hotel, FJHF+PQ, 7182 Abdulaziz Al Habti, Bani Abd Al Ashhal, Madinah 42313, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Rabwat%20Al%20Safwa%207%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Rabwat%20Al%20Safwa%207%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "abraj-al-marzam-madinah", name: "Abraj Al Marzam Hotel", arabicName: "فندق أبراج المرزم", searchAliases: ["Abraj Almarzam Hotel", "Al Marzam Hotel", "أبراج المرزم"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "7922 Airport Road, Bani Harithah, Madinah 42312, Saudi Arabia", mapAddress: "Abraj Al Marzam Hotel, FJPM+99, 7922 Airport Road, Bani Harithah, Madinah 42312, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Abraj%20Al%20Marzam%20Hotel%20Madinah%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com/maps/search/?api=1&query=Abraj%20Al%20Marzam%20Hotel%20Madinah%2C%20Saudi%20Arabia",
    gallery: [], galleryNote: "", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: centralLocationOnlyContent(),
  },
  {
    slug: "the-seasons-hotel-madinah", name: "The Seasons Hotel", arabicName: "فندق ذا سيزونز", searchAliases: ["The Seasons Hotels", "Seasons Hotel Madinah", "فندق السيزونز", "فندق ذا سيزونز المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "Abi Zur Al Ghafari Street, Bani Harithah, Madinah 42313, Saudi Arabia", mapAddress: "The Seasons Hotel, Abi Zur Al Ghafari Street, Bani Harithah, Madinah 42313, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=The%20Seasons%20Hotel%2C%20Abi%20Zur%20Al%20Ghafari%20Street%2C%20Bani%20Harithah%2C%20Madinah%2042313%2C%20Saudi%20Arabia", sourceUrl: "https://www.google.com.gh/travel/hotels/bani-harithah-hotels/entity/ChoIus3e8Y3W_uzOARoNL2cvMTFzZHhsbXFqZBAB",
    gallery: [madinahDestinationPlaceholder], galleryKind: "destination_placeholder", galleryNote: "Madinah destination image — not property photography", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: cityLocationOnlyContent(),
  },
  {
    slug: "season-star-hotel-madinah", name: "Season Star Hotel Madinah", arabicName: "فندق سيزون ستار المدينة", searchAliases: ["Season Star Hotel", "Season Star Madinah", "فندق سيزون ستار", "سيزون ستار المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "2712 King Abdul Aziz Road, Al Madinah 42314, Saudi Arabia", mapAddress: "Season Star Hotel Madinah, 2712 King Abdul Aziz Road, Al Madinah 42314, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=Season%20Star%20Hotel%20Madinah%2C%202712%20King%20Abdul%20Aziz%20Road%2C%20Madinah%2042314%2C%20Saudi%20Arabia", sourceUrl: "https://www.seasonstarhotelmadinah.com/",
    gallery: [madinahDestinationPlaceholder], galleryKind: "destination_placeholder", galleryNote: "Madinah destination image — not property photography", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: cityLocationOnlyContent(),
  },
  {
    slug: "surestay-by-best-western-madinah", name: "SureStay by Best Western Madinah", arabicName: "فندق شورستاي باي بست ويسترن المدينة", searchAliases: ["SureStay Madinah", "Best Western Madinah", "فندق شورستاي المدينة", "بست ويسترن المدينة"], city: "madinah", category: "value", status: "verified", proximityBand: "city", corporateReady: false,
    address: "Bani Harithah, Al Madinah 42313, Saudi Arabia", mapAddress: "SureStay by Best Western Madinah, Bani Harithah, Al Madinah 42313, Saudi Arabia", googleMapsPlaceUrl: "https://www.google.com/maps/search/?api=1&query=SureStay%20by%20Best%20Western%20Madinah%2C%20Bani%20Harithah%2C%20Madinah%2042313%2C%20Saudi%20Arabia", sourceUrl: "https://www.bestwestern.com/en_US/book/hotels-in-madinah/surestay-by-best-western-madinah/propertyCode.76939.html",
    gallery: [madinahDestinationPlaceholder], galleryKind: "destination_placeholder", galleryNote: "Madinah destination image — not property photography", nearbySites: [{ key: "nabawi", address: "Al-Masjid an-Nabawi, Madinah, Saudi Arabia" }], content: cityLocationOnlyContent(),
  },
];

/** The historical Oberoi identity was removed, while listed planning records are superseded by first-party verified profiles above. */
const unpublishedPlanningSlugs = new Set(["oberoi-madinah", "dar-al-iman-intercontinental", "anwar-al-madinah-movenpick", "hilton-madinah", "millennium-madinah", "golden-tulip-madinah", "radisson-blu-madinah", "crowne-plaza-madinah", "doubletree-by-hilton-madinah", "al-mokhtara-international", "al-waqf-serviced-apartments", "al-aqiq-madinah", "dallah-taibah"]);

/** The public directory is hotels-only. These apartment records remain in the supplied planning source for internal review. */
export const publicServicedApartmentSlugs = new Set([
  "al-shorfa-serviced-apartments",
  "al-diyafah-serviced-apartments",
  "al-awali-serviced-apartments",
  "al-aqiq-awali-apartments",
  "retaj-awali-apartments",
]);

const mapListingOnlySlugs = new Set(["emaar-taibah-madinah", "swiss-international-taba-al-salam", "manar-al-eiman-madinah", "mirage-al-salam-madinah", "al-mukhtara-diamond-madinah", "hayah-salam-silver-madinah", "wardat-al-rayyan-madinah", "al-jaad-madinah", "diyar-al-huda-madinah", "rawabi-al-zahra-madinah", "arjwan-rose-madinah", "al-saha-hotel-madinah", "safwat-al-madinah", "artal-al-monawwarah", "ruve-al-madinah", "worth-peninsula-madinah", "diyar-al-taqwa-madinah", "nusk-al-hijrah-madinah", "castle-hotel-madinah", "plaza-inn-ohud-madinah", "belvedere-hotel-madinah", "aurion-al-aqeeq-madinah", "aval-hotel-madinah", "al-sada-al-masi-madinah", "maysan-rihab-al-misk-madinah", "durrah-al-eiman-madinah", "saraya-taba-hotel-a-madinah", "manazeli-al-madinah", "hayah-plaza-madinah", "qasr-al-andalus-golden-madinah", "al-waha-rawdah-madinah", "manazel-al-aswaf-madinah", "rotana-al-misk-madinah", "golden-madinah-hotel", "dar-al-eiman-grand-madinah", "nusk-al-madinah-hotel", "rama-al-madinah-hotel", "jiwar-taiba-madinah", "luluat-al-diyafa-madinah", "abraj-al-diyafah-madinah", "lulu-al-arab-madinah", "luluat-quba-madinah", "zaha-taiba-madinah", "afaq-al-masi-madinah", "afaq-al-salam-golden-madinah", "cladium-hotel-madinah", "shaza-al-baraka-madinah", "zaha-al-munawara-madinah", "shaza-regency-plaza-madinah", "rabwat-al-safwa-7-madinah", "abraj-al-marzam-madinah", "the-seasons-hotel-madinah", "season-star-hotel-madinah", "karam-taibah-almasi-madinah", "dar-al-naeem-madinah", "zowar-international-madinah", "odst-al-madinah", "emaar-elite-madinah", "hayah-golden-madinah", "hayah-al-huda-madinah", "riyadh-al-zahra-madinah", "araek-taiba-madinah", "rabwat-al-safwa-golden-madinah", "diyar-wahat-al-nazeel-madinah", "mias-al-madinah", "diyar-al-madinah-madinah", "mohamadia-al-zahra-madinah"]);
const reviewedRouteDates: Partial<Record<string, string>> = {
  "emaar-taibah-madinah": "2026-08-20",
  "swiss-international-taba-al-salam": "2026-08-20",
  "dar-al-taqwa-madinah": "2026-08-21",
  "new-madinah-hotel": "2026-08-21",
  "intercontinental-dar-al-hijra-madinah": "2026-08-21",
  "millennium-madinah": "2026-08-21",
  "diyar-al-salam-madinah": "2026-08-21",
  "diyar-al-salam-silver-madinah": "2026-08-21",
  "anwar-al-madinah-movenpick": "2026-08-21",
  "dar-al-iman-intercontinental": "2026-08-21",
  "hilton-madinah": "2026-08-21",
  "crowne-plaza-madinah": "2026-08-21",
};

function attachVerification(profile: HotelProfileDraft): HotelProfile {
  const isOfficialProfile = profile.status === "verified";
  const isMapListingProfile = mapListingOnlySlugs.has(profile.slug) || profile.slug === "diyar-al-sater-madinah" || profile.slug === "diyar-al-salam-madinah" || profile.slug === "diyar-al-salam-silver-madinah";
  return {
    ...profile,
    verification: {
      evidenceLevel: isMapListingProfile ? "map_listing" : isOfficialProfile ? "official_property" : "planning_record",
      reviewedOn: isOfficialProfile ? "2026-08-18" : undefined,
      routeReviewedOn: profile.nearestGate ? reviewedRouteDates[profile.slug] ?? "2026-08-17" : undefined,
      locationStatus: profile.nearestGate ? "named_gate_verified" : profile.mapAddress ? "property_point_reviewed" : "not_published",
      editorialNote: isOfficialProfile ? "First-party property facts reviewed; public route and imagery remain limited to substantiated material." : "Planning record retained for catalogue coverage; publish only after first-party fact and location review.",
    },
  };
}

function appendSuppliedGallery(profile: HotelProfileDraft): HotelProfileDraft {
  const supplied = suppliedHotelGalleries[profile.slug];
  if (!supplied?.length) return profile;
  return { ...profile, gallery: Array.from(new Set([...profile.gallery, ...supplied])) };
}

const baseHotelProfiles = [...verifiedHotelProfiles, ...sourceReviewedHotelProfiles, ...locationOnlyHotelProfiles, ...madinahPlanningHotels.filter(record => !unpublishedPlanningSlugs.has(record.slug)).map(planningProfile)]
  .filter(profile => !publicServicedApartmentSlugs.has(profile.slug))
  .map(appendSuppliedGallery);

/** Stable, identity-reviewed gallery baseline used for regression assertions and editorial audit. */
export const canonicalHotelProfiles: HotelProfile[] = baseHotelProfiles.map(attachVerification);

/** Public catalogue gallery: retains every canonical image and appends the reviewed direct property-image expansion. */
export const hotelProfiles: HotelProfile[] = appendCuratedGalleryExpansion(canonicalHotelProfiles);

const publicSummaryLead: Record<Locale, RegExp> = {
  en: /^(?:A source-reviewed Madinah hotel profile based on[^.]*\. |A Madinah hotel profile based on information published on the hotel’s official website\. )/,
  ar: /^(?:ملف فندقي تمت مراجعته من مصدر رسمي[^.]*\. |ملف فندق في المدينة المنورة يعتمد على المعلومات المنشورة في الموقع الرسمي للفندق\. )/,
  ms: /^(?:Profil hotel Madinah yang disemak daripada sumber rasmi[^.]*\. |Profil hotel Madinah berdasarkan maklumat yang diterbitkan di laman web rasmi hotel\. )/,
  ur: /^(?:مدینہ ہوٹل کا یہ پروفائل[^۔]*۔|مدینہ ہوٹل کا پروفائل، ہوٹل کی سرکاری ویب سائٹ پر شائع شدہ معلومات کی بنیاد پر۔)/,
  id: /^(?:Profil hotel Madinah yang ditinjau berdasarkan (?:sumber resmi dari situs properti|halaman properti resmi IHG)\. |Profil hotel Madinah berdasarkan informasi yang diterbitkan di situs resmi hotel\. )/,
  hi: /^(?:यह मदीना होटल प्रोफ़ाइल(?: IHG के आधिकारिक संपत्ति पृष्ठ| संपत्ति की आधिकारिक वेबसाइट) के स्रोत-समीक्षित विवरण पर आधारित है। |मदीना होटल प्रोफ़ाइल, होटल की आधिकारिक वेबसाइट पर प्रकाशित जानकारी पर आधारित है। )/,
};

const publicSummaryTail: Record<Locale, RegExp> = {
  en: /(?: A property-pin and gate route remain pending independent map review\.| A reviewed entrance-to-gate route remains pending\.)$/,
  ar: /(?: تبقى نقطة الموقع ومسار البوابة قيد المراجعة المستقلة\.| يبقى مسار المدخل إلى البوابة قيد المراجعة المستقلة\.)$/,
  ms: /(?: Pin hartanah dan laluan pintu masuk masih menunggu semakan peta bebas\.| Laluan masuk ke pintu masih menunggu semakan bebas\.)$/,
  ur: /(?: پراپرٹی پن اور گیٹ روٹ آزاد نقشہ جائزے کے منتظر ہیں۔| داخلی راستے سے گیٹ تک کا جائزہ شدہ روٹ ابھی باقی ہے۔)$/,
  id: /(?: Pin properti dan rute gerbang masih menunggu tinjauan peta independen\.| Rute masuk ke gerbang yang ditinjau masih tertunda\.)$/,
  hi: /(?: संपत्ति पिन और गेट मार्ग स्वतंत्र मानचित्र समीक्षा की प्रतीक्षा में हैं।| प्रवेश से गेट तक का समीक्षित मार्ग अभी लंबित है।)$/,
};

export function getHotelContent(hotel: HotelProfile, locale: Locale) {
  const content = hotel.content[locale];
  return { ...content, summary: content.summary.replace(publicSummaryLead[locale], "").replace(publicSummaryTail[locale], "").trim() };
}

export function getPublicLocationState(hotel: HotelProfile) {
  if (hotel.nearestGate && hotel.verification.locationStatus === "named_gate_verified") return "gate_route" as const;
  if (hotel.mapAddress && hotel.verification.locationStatus === "property_point_reviewed") return "property_location" as const;
  return "on_request" as const;
}

export function getPublicLocationUrl(hotel: HotelProfile) {
  if (getPublicLocationState(hotel) !== "property_location" || !hotel.mapAddress) return undefined;
  return hotel.googleMapsPlaceUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.mapAddress)}`;
}

const officialArabicHotelNames: Partial<Record<string, string>> = {
  "dar-al-taqwa-madinah": "فندق دار التقوى المدينة",
  "biltmore-al-madinah": "فندق بيلتمور المدينة",
  "new-madinah-hotel": "فندق المدينة الجديدة",
  "saja-by-warwick-madinah": "فندق سجى ورويك المدينة",
  "golden-tulip-al-zahabi": "فندق جولدن توليب الذهبي",
  "dar-al-iman-intercontinental": "فندق دار الإيمان إنتركونتيننتال",
  "anwar-al-madinah-movenpick": "فندق أنوار المدينة موفنبيك",
  "hilton-madinah": "فندق هيلتون المدينة",
  "millennium-madinah": "فندق ميلينيوم العقيق",
  "dallah-taibah": "فندق دلة طيبة",
  "radisson-hotel-madinah": "فندق راديسون المدينة",
  "crowne-plaza-madinah": "فندق كراون بلازا المدينة",
  "doubletree-by-hilton-madinah-gate": "فندق دبل تري باي هيلتون المدينة جيت",
  "al-mokhtara-international": "فندق المختارة العالمي",
  "al-ritz-al-madinah": "فندق الريتز المدينة",
  "al-waqf-serviced-apartments": "فندق وقف عثمان بن عفان",
  "al-aqiq-madinah": "فندق ميلينيوم العقيق",
  "le-meridien-madinah": "فندق لو ميريديان المدينة",
  "eman-royal": "فندق الإيمان رويال",
  "ramada-madinah-al-qibla": "فندق رمادا المدينة الحمراء",
  "al-nokhba-madinah": "فندق مادن (النخبة رويال إن)",
  "rawdah-al-aqiq": "فندق روضة العقيق",
};

/** Displays Arabic name first in Arabic while preserving the official English identifier. */
export function getHotelDisplayName(hotel: HotelProfile, locale: Locale) {
  if (locale !== "ar") return hotel.name;
  const arabicName = hotel.arabicName || officialArabicHotelNames[hotel.slug];
  return arabicName ? `${arabicName} — ${hotel.name}` : hotel.name;
}

/** Normalizes Arabic and Latin hotel names so visitors can search with a full or partial name. */
export function normalizeHotelSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLocaleLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns name-only matches, intentionally avoiding unverified amenity or descriptive-text results. */
export function searchHotelsByName(hotels: HotelProfile[], query: string) {
  const normalizedQuery = normalizeHotelSearchText(query);
  if (!normalizedQuery) return [];
  return hotels.filter(hotel => {
    const names = [hotel.name, hotel.arabicName, ...(hotel.searchAliases ?? []), officialArabicHotelNames[hotel.slug], hotel.slug.replaceAll("-", " ")]
      .filter((name): name is string => Boolean(name));
    return names.some(name => normalizeHotelSearchText(name).includes(normalizedQuery));
  });
}

type MosqueDirection = "north" | "south" | "east" | "west" | "north-west" | "south-west";

/**
 * These sectors were calculated from the reviewed Google Maps property point against
 * the Al-Masjid an-Nabawi pin, not from commercial-zone wording.
 */
const mosqueDirectionBySlug: Partial<Record<string, MosqueDirection>> = {
  "dar-al-taqwa-madinah": "north",
  "pullman-zamzam-madinah": "south",
  "dar-al-iman-intercontinental": "north",
  "anwar-al-madinah-movenpick": "north-west",
  "hilton-madinah": "north",
  "dallah-taibah": "north",
  "biltmore-al-madinah": "north",
  "new-madinah-hotel": "south",
  "saja-by-warwick-madinah": "north",
  "golden-tulip-al-zahabi": "north",
  "radisson-hotel-madinah": "south",
  "crowne-plaza-madinah": "south",
  "doubletree-by-hilton-madinah-gate": "east",
  "al-mokhtara-international": "north-west",
  "al-ritz-al-madinah": "north",
  "al-waqf-serviced-apartments": "north",
  "al-aqiq-madinah": "north",
  "le-meridien-madinah": "west",
  "eman-royal": "north",
  "ramada-madinah-al-qibla": "south-west",
  "rawdah-al-aqiq": "west",
};

const mosqueDirectionLabels: Record<Locale, Record<MosqueDirection, { central: string; city: string }>> = {
  en: { north: { central: "Central Area — North of Al-Masjid an-Nabawi", city: "North of Al-Masjid an-Nabawi" }, south: { central: "Central Area — South of Al-Masjid an-Nabawi", city: "South of Al-Masjid an-Nabawi" }, east: { central: "Central Area — East of Al-Masjid an-Nabawi", city: "East of Al-Masjid an-Nabawi" }, west: { central: "Central Area — West of Al-Masjid an-Nabawi", city: "West of Al-Masjid an-Nabawi" }, "north-west": { central: "Central Area — North-west of Al-Masjid an-Nabawi", city: "North-west of Al-Masjid an-Nabawi" }, "south-west": { central: "Central Area — South-west of Al-Masjid an-Nabawi", city: "South-west of Al-Masjid an-Nabawi" } },
  ar: { north: { central: "المنطقة المركزية — شمال المسجد النبوي", city: "شمال المسجد النبوي" }, south: { central: "المنطقة المركزية — جنوب المسجد النبوي", city: "جنوب المسجد النبوي" }, east: { central: "المنطقة المركزية — شرق المسجد النبوي", city: "شرق المسجد النبوي" }, west: { central: "المنطقة المركزية — غرب المسجد النبوي", city: "غرب المسجد النبوي" }, "north-west": { central: "المنطقة المركزية — شمال غرب المسجد النبوي", city: "شمال غرب المسجد النبوي" }, "south-west": { central: "المنطقة المركزية — جنوب غرب المسجد النبوي", city: "جنوب غرب المسجد النبوي" } },
  ms: { north: { central: "Kawasan Pusat — Utara Masjid Nabawi", city: "Utara Masjid Nabawi" }, south: { central: "Kawasan Pusat — Selatan Masjid Nabawi", city: "Selatan Masjid Nabawi" }, east: { central: "Kawasan Pusat — Timur Masjid Nabawi", city: "Timur Masjid Nabawi" }, west: { central: "Kawasan Pusat — Barat Masjid Nabawi", city: "Barat Masjid Nabawi" }, "north-west": { central: "Kawasan Pusat — Barat Laut Masjid Nabawi", city: "Barat Laut Masjid Nabawi" }, "south-west": { central: "Kawasan Pusat — Barat Daya Masjid Nabawi", city: "Barat Daya Masjid Nabawi" } },
  ur: { north: { central: "مرکزی علاقہ — مسجد نبوی کے شمال میں", city: "مسجد نبوی کے شمال میں" }, south: { central: "مرکزی علاقہ — مسجد نبوی کے جنوب میں", city: "مسجد نبوی کے جنوب میں" }, east: { central: "مرکزی علاقہ — مسجد نبوی کے مشرق میں", city: "مسجد نبوی کے مشرق میں" }, west: { central: "مرکزی علاقہ — مسجد نبوی کے مغرب میں", city: "مسجد نبوی کے مغرب میں" }, "north-west": { central: "مرکزی علاقہ — مسجد نبوی کے شمال مغرب میں", city: "مسجد نبوی کے شمال مغرب میں" }, "south-west": { central: "مرکزی علاقہ — مسجد نبوی کے جنوب مغرب میں", city: "مسجد نبوی کے جنوب مغرب میں" } },
  id: { north: { central: "Area Pusat — Utara Masjid Nabawi", city: "Utara Masjid Nabawi" }, south: { central: "Area Pusat — Selatan Masjid Nabawi", city: "Selatan Masjid Nabawi" }, east: { central: "Area Pusat — Timur Masjid Nabawi", city: "Timur Masjid Nabawi" }, west: { central: "Area Pusat — Barat Masjid Nabawi", city: "Barat Masjid Nabawi" }, "north-west": { central: "Area Pusat — Barat Laut Masjid Nabawi", city: "Barat Laut Masjid Nabawi" }, "south-west": { central: "Area Pusat — Barat Daya Masjid Nabawi", city: "Barat Daya Masjid Nabawi" } },
  hi: { north: { central: "केंद्रीय क्षेत्र — अल-मस्जिद अन-नबवी के उत्तर", city: "अल-मस्जिद अन-नबवी के उत्तर" }, south: { central: "केंद्रीय क्षेत्र — अल-मस्जिद अन-नबवी के दक्षिण", city: "अल-मस्जिद अन-नबवी के दक्षिण" }, east: { central: "केंद्रीय क्षेत्र — अल-मस्जिद अन-नबवी के पूर्व", city: "अल-मस्जिद अन-नबवी के पूर्व" }, west: { central: "केंद्रीय क्षेत्र — अल-मस्जिद अन-नबवी के पश्चिम", city: "अल-मस्जिद अन-नबवी के पश्चिम" }, "north-west": { central: "केंद्रीय क्षेत्र — अल-मस्जिद अन-नबवी के उत्तर-पश्चिम", city: "अल-मस्जिद अन-नबवी के उत्तर-पश्चिम" }, "south-west": { central: "केंद्रीय क्षेत्र — अल-मस्जिद अन-नबवी के दक्षिण-पश्चिम", city: "अल-मस्जिद अन-नबवी के दक्षिण-पश्चिम" } },
};

const genericAreaLabels: Record<Locale, { central: string; city: string }> = {
  en: { central: "Central Area, Madinah", city: "Madinah location" },
  ar: { central: "المنطقة المركزية، المدينة المنورة", city: "موقع في المدينة المنورة" },
  ms: { central: "Kawasan Pusat, Madinah", city: "Lokasi di Madinah" },
  ur: { central: "مرکزی علاقہ، مدینہ", city: "مدینہ میں مقام" },
  id: { central: "Area Pusat, Madinah", city: "Lokasi di Madinah" },
  hi: { central: "केंद्रीय क्षेत्र, मदीना", city: "मदीना स्थान" },
};

const verificationPendingAreaLabels: Record<Locale, string> = {
  en: "Location to be confirmed",
  ar: "الموقع قيد التأكيد",
  ms: "Lokasi menunggu pengesahan",
  ur: "مقام کی تصدیق باقی ہے",
  id: "Lokasi menunggu konfirmasi",
  hi: "स्थान की पुष्टि लंबित है",
};

export function getHotelAreaLabel(hotel: HotelProfile, locale: Locale) {
  if (hotel.status === "verification_pending") return verificationPendingAreaLabels[locale];
  const direction = mosqueDirectionBySlug[hotel.slug];
  const isCentral = hotel.proximityBand === "haram_side" || hotel.proximityBand === "central";
  if (direction) return mosqueDirectionLabels[locale][direction][isCentral ? "central" : "city"];
  return genericAreaLabels[locale][isCentral ? "central" : "city"];
}

export type PortfolioFilters = { query: string; category: "all" | HotelProfile["category"]; city: "all" | HotelProfile["city"]; proximity: "all" | HotelProfile["proximityBand"]; corporateOnly: boolean; galleryOnly: boolean; minimumRooms: number };

const categoryPriority: Record<HotelProfile["category"], number> = { premium: 0, executive: 1, value: 2 };
const statusPriority: Record<HotelProfile["status"], number> = { verified: 0, verification_pending: 1, planning_record: 2 };
const evidencePriority: Record<VerificationMetadata["evidenceLevel"], number> = { official_property: 0, map_listing: 1, planning_record: 2 };
const priorityHotelSlugs = [
  "grand-plaza-al-madinah",
  "grand-plaza-badr-al-maqam",
  "al-rehab-madinah",
  "novotel-madinah",
  "nusk-al-eman-hotel",
  "nusk-al-madinah-hotel",
  "manar-al-eiman-madinah",
  "sidrat-al-madina",
  "sidra-alia-al-dahabi-madinah",
  "jiwar-taiba-madinah",
  "taqwa-manazil-madina",
  "karam-al-sada-madinah",
] as const;
const directoryPriority = new Map<string, number>(priorityHotelSlugs.map((slug, index) => [slug, index]));

export function sortHotelsForDirectory(hotels: HotelProfile[], locale: Locale) {
  return [...hotels].sort((left, right) => {
    const priorities = [
      (directoryPriority.get(left.slug) ?? priorityHotelSlugs.length) - (directoryPriority.get(right.slug) ?? priorityHotelSlugs.length),
      categoryPriority[left.category] - categoryPriority[right.category],
      statusPriority[left.status] - statusPriority[right.status],
      evidencePriority[left.verification.evidenceLevel] - evidencePriority[right.verification.evidenceLevel],
      Number(right.gallery.length > 0) - Number(left.gallery.length > 0),
      Number(right.corporateReady) - Number(left.corporateReady),
    ];
    const difference = priorities.find(value => value !== 0);
    return difference ?? getHotelDisplayName(left, locale).localeCompare(getHotelDisplayName(right, locale), locale);
  });
}

export function filterHotels(hotels: HotelProfile[], filters: PortfolioFilters, locale: Locale) {
  const query = normalizeHotelSearchText(filters.query);
  return sortHotelsForDirectory(hotels.filter(hotel => {
    const content = getHotelContent(hotel, locale);
    const localizedHaystack = normalizeHotelSearchText(`${content.summary} ${content.highlights.join(" ")} ${content.amenities.join(" ")}`);
    const hasMatchingName = !query || searchHotelsByName([hotel], filters.query).length > 0;
    const hasMatchingLocalizedContent = !query || localizedHaystack.includes(query);
    return (hasMatchingName || hasMatchingLocalizedContent) && (filters.category === "all" || hotel.category === filters.category) && (filters.city === "all" || hotel.city === filters.city) && (filters.proximity === "all" || hotel.proximityBand === filters.proximity) && (!filters.corporateOnly || hotel.corporateReady) && (!filters.galleryOnly || hotel.gallery.length > 0) && hotel.content[locale].rooms.length >= filters.minimumRooms;
  }), locale);
}

const rawPortfolioLabels = {
  en: { title: "Madinah Hotel Directory", eyebrow: "MADINAH HOTEL DIRECTORY", body: "A source-reviewed directory for corporate religious-travel planning, presenting hotel, room, amenity, location, and route information for consideration. Availability and commercial terms are confirmed directly with Al Ghanem Travel.", search: "Search hotel or amenity", all: "All categories", premium: "Premium", executive: "Executive", value: "Value", verified: "OFFICIAL-SOURCE PROFILE", pending: "SOURCE REVIEW IN PROGRESS", view: "View hotel profile", rooms: "Room information", amenities: "Corporate facilities", map: "Walking route to Al-Masjid an-Nabawi", city: "Madinah Al Munawwarah", coming: "Makkah hotel profiles will be added after source, imagery, and commercial details are reviewed.", gallery: "Hotel gallery", details: "Hotel overview", source: "Official hotel website", inquiry: "Enquire about this hotel", routeNote: "Walking distance is generated by Google Maps and may change with the selected route and access conditions.", nearby: "Nearby landmarks", corporate: "Corporate facilities", galleryFilter: "Hotel gallery", haramSide: "Near Al-Masjid an-Nabawi", minimumRooms: "2+ room categories", profile: "hotel profile", profiles: "hotel profiles", galleryNote: "The images shown are original illustrative material prepared for Al Ghanem Travel. Official hotel images will be used only when partner-authorized or licensed.", illustrativeAccommodation: "Illustrative accommodation interior", illustrativeMeeting: "Illustrative meeting space", illustrativeFacade: "Illustrative hotel facade", mapLoading: "Loading the map and walking route…", mapUnavailable: "The embedded map is temporarily unavailable.", mapAction: "Open walking directions", routeShown: "Walking route displayed.", routeUnavailable: "The map is available, but live walking directions are temporarily unavailable.", propertyUnavailable: "The map is available, but the hotel location could not be resolved automatically.", destinationUnavailable: "The map is available, but the destination could not be resolved automatically." },
  ar: { title: "دليل فنادق المدينة المنورة", eyebrow: "دليل فنادق المدينة المنورة", body: "دليل يعتمد على مصادر رسمية للتخطيط لإقامات الشركات والسفر الديني، ويعرض بيانات الفنادق والغرف والمرافق والموقع ومسارات المشي للمراجعة. يتم تأكيد التوافر والشروط التجارية مباشرة مع الغانم ترافل.", search: "ابحث عن فندق أو مرفق", all: "كل الفئات", premium: "فاخر", executive: "تنفيذي", value: "اقتصادي", verified: "ملف بمصدر رسمي", pending: "تحت مراجعة المصدر", view: "عرض ملف الفندق", rooms: "معلومات الغرف", amenities: "مرافق للشركات", map: "مسار المشي إلى المسجد النبوي", city: "المدينة المنورة", coming: "تُضاف ملفات فنادق مكة بعد مراجعة المصدر والصور والتفاصيل التجارية.", gallery: "معرض صور الفندق", details: "بيانات الفندق", source: "الموقع الرسمي للفندق", inquiry: "استفسر عن هذا الفندق", routeNote: "تُحتسب مسافة المشي بواسطة خرائط Google وقد تتغير حسب المسار وظروف الوصول.", nearby: "معالم قريبة", corporate: "مرافق للشركات", galleryFilter: "معرض صور الفندق", haramSide: "قريب من المسجد النبوي", minimumRooms: "فئتان للغرف أو أكثر", profile: "ملف فندق", profiles: "ملفات فنادق", galleryNote: "الصور المعروضة مواد توضيحية أصلية أُعدت للغانم ترافل. تُستخدم صور الفندق الرسمية فقط بعد الحصول على تفويض من الشريك أو ترخيص للاستخدام.", illustrativeAccommodation: "صورة توضيحية لداخل الإقامة", illustrativeMeeting: "صورة توضيحية لمساحة اجتماعات", illustrativeFacade: "صورة توضيحية لواجهة الفندق", mapLoading: "جارٍ تحميل الخريطة ومسار المشي…", mapUnavailable: "الخريطة المضمنة غير متاحة مؤقتاً.", mapAction: "فتح مسار المشي", routeShown: "تم عرض مسار المشي.", routeUnavailable: "الخريطة متاحة، لكن تعذر الحصول على مسار المشي حالياً.", propertyUnavailable: "الخريطة متاحة، لكن تعذر تحديد موقع الفندق تلقائياً.", destinationUnavailable: "الخريطة متاحة، لكن تعذر تحديد وجهة المسار تلقائياً." },
  ms: { title: "Direktori Hotel Madinah", eyebrow: "DIREKTORI HOTEL MADINAH", body: "Direktori berpandukan sumber rasmi untuk perancangan penginapan korporat dan perjalanan ibadah, yang membentangkan maklumat hotel, bilik, kemudahan, lokasi dan laluan untuk semakan. Ketersediaan dan syarat komersial disahkan terus bersama Al Ghanem Travel.", search: "Cari hotel atau kemudahan", all: "Semua kategori", premium: "Premium", executive: "Eksekutif", value: "Nilai", verified: "PROFIL SUMBER RASMI", pending: "SEMAKAN SUMBER SEDANG DIBUAT", view: "Lihat profil hotel", rooms: "Maklumat bilik", amenities: "Kemudahan korporat", map: "Laluan berjalan ke Al-Masjid an-Nabawi", city: "Madinah Al Munawwarah", coming: "Profil hotel Makkah akan ditambah selepas sumber, imej dan butiran komersial disemak.", gallery: "Galeri ilustrasi", details: "Gambaran hotel", source: "Laman web rasmi hotel", inquiry: "Tanya tentang hotel ini", routeNote: "Jarak berjalan dijana oleh Google Maps dan boleh berubah mengikut laluan serta keadaan akses.", nearby: "Mercu tanda berdekatan", corporate: "Kemudahan korporat", galleryFilter: "Galeri ilustrasi", haramSide: "Dekat Al-Masjid an-Nabawi", minimumRooms: "2+ kategori bilik", profile: "profil hotel", profiles: "profil hotel", galleryNote: "Imej yang dipaparkan ialah bahan ilustrasi asal untuk Al Ghanem Travel. Imej rasmi hotel hanya digunakan dengan kebenaran rakan kongsi atau lesen yang sah.", illustrativeAccommodation: "Ruang penginapan ilustrasi", illustrativeMeeting: "Ruang mesyuarat ilustrasi", illustrativeFacade: "Fasad hotel ilustrasi", mapLoading: "Memuatkan peta dan laluan berjalan…", mapUnavailable: "Peta terbenam tidak tersedia buat sementara waktu.", mapAction: "Buka arah berjalan", routeShown: "Laluan berjalan dipaparkan.", routeUnavailable: "Peta tersedia, tetapi arah berjalan langsung tidak tersedia buat sementara waktu.", propertyUnavailable: "Peta tersedia, tetapi lokasi hotel tidak dapat ditentukan secara automatik.", destinationUnavailable: "Peta tersedia, tetapi destinasi tidak dapat ditentukan secara automatik." },
  ur: { title: "مدینہ ہوٹل ڈائریکٹری", eyebrow: "مدینہ ہوٹل ڈائریکٹری", body: "کارپوریٹ مذہبی سفر اور رہائش کی منصوبہ بندی کے لیے سرکاری ذرائع پر مبنی ڈائریکٹری، جس میں ہوٹل، کمرے، سہولیات، مقام اور راستے کی معلومات پیش کی جاتی ہیں۔ دستیابی اور تجارتی شرائط کی تصدیق براہ راست Al Ghanem Travel سے کی جاتی ہے۔", search: "ہوٹل یا سہولت تلاش کریں", all: "تمام زمرے", premium: "پریمیم", executive: "ایگزیکٹو", value: "ویلیو", verified: "سرکاری ماخذ پروفائل", pending: "ماخذ کا جائزہ جاری ہے", view: "ہوٹل پروفائل دیکھیں", rooms: "کمرے کی معلومات", amenities: "کارپوریٹ سہولیات", map: "مسجد نبوی تک پیدل راستہ", city: "مدینہ منورہ", coming: "مکہ ہوٹل پروفائلز ماخذ، تصاویر اور تجارتی تفصیلات کے جائزے کے بعد شامل کیے جائیں گے۔", gallery: "توضیحی گیلری", details: "ہوٹل کا جائزہ", source: "ہوٹل کی سرکاری ویب سائٹ", inquiry: "اس ہوٹل کے بارے میں استفسار کریں", routeNote: "پیدل فاصلہ Google Maps سے تیار ہوتا ہے اور راستے و رسائی کی صورتحال کے مطابق تبدیل ہوسکتا ہے۔", nearby: "قریبی مقامات", corporate: "کارپوریٹ سہولیات", galleryFilter: "توضیحی گیلری", haramSide: "مسجد نبوی کے قریب", minimumRooms: "2+ روم کیٹیگریز", profile: "ہوٹل پروفائل", profiles: "ہوٹل پروفائلز", galleryNote: "دکھائی گئی تصاویر Al Ghanem Travel کے لیے تیار کردہ اصل توضیحی مواد ہیں۔ ہوٹل کی سرکاری تصاویر صرف پارٹنر کی اجازت یا درست لائسنس کے ساتھ استعمال کی جائیں گی۔", illustrativeAccommodation: "توضیحی رہائشی اندرونی منظر", illustrativeMeeting: "توضیحی میٹنگ جگہ", illustrativeFacade: "توضیحی ہوٹل کا بیرونی منظر", mapLoading: "نقشہ اور پیدل راستہ لوڈ ہورہا ہے…", mapUnavailable: "ایمبیڈڈ نقشہ عارضی طور پر دستیاب نہیں ہے۔", mapAction: "پیدل راستہ کھولیں", routeShown: "پیدل راستہ دکھا دیا گیا ہے۔", routeUnavailable: "نقشہ دستیاب ہے، لیکن براہ راست پیدل سمتیں عارضی طور پر دستیاب نہیں ہیں۔", propertyUnavailable: "نقشہ دستیاب ہے، لیکن ہوٹل کا مقام خودکار طور پر نہیں مل سکا۔", destinationUnavailable: "نقشہ دستیاب ہے، لیکن منزل خودکار طور پر نہیں مل سکی۔" },
  id: { title: "Direktori Hotel Madinah", eyebrow: "DIREKTORI HOTEL MADINAH", body: "Direktori berbasis sumber resmi untuk perencanaan akomodasi korporat dan perjalanan ibadah, yang menyajikan informasi hotel, kamar, fasilitas, lokasi, dan rute untuk ditinjau. Ketersediaan serta ketentuan komersial dikonfirmasi langsung bersama Al Ghanem Travel.", search: "Cari hotel atau fasilitas", all: "Semua kategori", premium: "Premium", executive: "Eksekutif", value: "Nilai", verified: "PROFIL SUMBER RESMI", pending: "PENINJAUAN SUMBER BERLANGSUNG", view: "Lihat profil hotel", rooms: "Informasi kamar", amenities: "Fasilitas korporat", map: "Rute jalan kaki ke Al-Masjid an-Nabawi", city: "Madinah Al Munawwarah", coming: "Profil hotel Makkah akan ditambahkan setelah sumber, gambar, dan detail komersial ditinjau.", gallery: "Galeri ilustratif", details: "Ikhtisar hotel", source: "Situs resmi hotel", inquiry: "Tanyakan hotel ini", routeNote: "Jarak jalan kaki dibuat oleh Google Maps dan dapat berubah sesuai rute serta kondisi akses.", nearby: "Landmark terdekat", corporate: "Fasilitas korporat", galleryFilter: "Galeri ilustratif", haramSide: "Dekat Al-Masjid an-Nabawi", minimumRooms: "2+ kategori kamar", profile: "profil hotel", profiles: "profil hotel", galleryNote: "Gambar yang ditampilkan adalah materi ilustratif asli untuk Al Ghanem Travel. Gambar resmi hotel hanya digunakan dengan otorisasi mitra atau lisensi yang sah.", illustrativeAccommodation: "Interior akomodasi ilustratif", illustrativeMeeting: "Ruang rapat ilustratif", illustrativeFacade: "Fasad hotel ilustratif", mapLoading: "Memuat peta dan rute jalan kaki…", mapUnavailable: "Peta tersemat untuk sementara tidak tersedia.", mapAction: "Buka petunjuk jalan kaki", routeShown: "Rute jalan kaki ditampilkan.", routeUnavailable: "Peta tersedia, tetapi petunjuk jalan kaki langsung sementara tidak tersedia.", propertyUnavailable: "Peta tersedia, tetapi lokasi hotel tidak dapat ditemukan secara otomatis.", destinationUnavailable: "Peta tersedia, tetapi tujuan tidak dapat ditemukan secara otomatis." },
  hi: { title: "मदीना होटल निर्देशिका", eyebrow: "मदीना होटल निर्देशिका", body: "कॉर्पोरेट आवास और धार्मिक यात्रा योजना के लिए आधिकारिक स्रोतों पर आधारित निर्देशिका, जिसमें होटल, कक्ष, सुविधाएं, स्थान और मार्ग की जानकारी समीक्षा के लिए प्रस्तुत की गई है। उपलब्धता और व्यावसायिक शर्तों की पुष्टि सीधे अल घनेम ट्रैवल के साथ की जाती है।", search: "होटल या सुविधा खोजें", all: "सभी श्रेणियां", premium: "प्रीमियम", executive: "एग्जीक्यूटिव", value: "वैल्यू", verified: "आधिकारिक-स्रोत प्रोफ़ाइल", pending: "स्रोत समीक्षा जारी है", view: "होटल प्रोफ़ाइल देखें", rooms: "कक्ष जानकारी", amenities: "कॉर्पोरेट सुविधाएं", map: "अल-मस्जिद अन-नबवी तक पैदल मार्ग", city: "मदीना अल मुनव्वरा", coming: "मक्का होटल प्रोफ़ाइल स्रोत, चित्र और व्यावसायिक विवरण की समीक्षा के बाद जोड़े जाएंगे।", gallery: "चित्रात्मक गैलरी", details: "होटल अवलोकन", source: "होटल की आधिकारिक वेबसाइट", inquiry: "इस होटल के बारे में पूछें", routeNote: "पैदल दूरी Google Maps द्वारा तैयार की जाती है और मार्ग तथा पहुंच की स्थितियों के अनुसार बदल सकती है।", nearby: "निकटवर्ती स्थल", corporate: "कॉर्पोरेट सुविधाएं", galleryFilter: "चित्रात्मक गैलरी", haramSide: "अल-मस्जिद अन-नबवी के निकट", minimumRooms: "2+ कक्ष श्रेणियां", profile: "होटल प्रोफ़ाइल", profiles: "होटल प्रोफ़ाइल", galleryNote: "दिखाई गई छवियां अल घनेम ट्रैवल के लिए तैयार मूल चित्रात्मक सामग्री हैं। होटल की आधिकारिक छवियां केवल भागीदार की अनुमति या वैध लाइसेंस के साथ उपयोग की जाएंगी।", illustrativeAccommodation: "चित्रात्मक आवास इंटीरियर", illustrativeMeeting: "चित्रात्मक बैठक स्थान", illustrativeFacade: "चित्रात्मक होटल मुखौटा", mapLoading: "मानचित्र और पैदल मार्ग लोड हो रहा है…", mapUnavailable: "एम्बेड किया गया मानचित्र अस्थायी रूप से उपलब्ध नहीं है।", mapAction: "पैदल दिशा-निर्देश खोलें", routeShown: "पैदल मार्ग प्रदर्शित है।", routeUnavailable: "मानचित्र उपलब्ध है, लेकिन लाइव पैदल दिशा-निर्देश अस्थायी रूप से उपलब्ध नहीं हैं।", propertyUnavailable: "मानचित्र उपलब्ध है, लेकिन होटल का स्थान स्वचालित रूप से नहीं मिल सका।", destinationUnavailable: "मानचित्र उपलब्ध है, लेकिन गंतव्य स्वचालित रूप से नहीं मिल सका।" },
} as const;

const portfolioLabelOverrides = {
  en: { body: "A practical directory for corporate accommodation and religious-travel programmes in Madinah. Our team confirms availability and arrangements directly with you.", verified: "HOTEL PROFILE", pending: "DETAILS IN PREPARATION", coming: "Makkah accommodation profiles will be added as they become available for our corporate accommodation service.", gallery: "HOTEL GALLERY", source: "Hotel details", galleryFilter: "HOTEL GALLERY", galleryNote: "Hotel imagery is shown when available.", illustrativeAccommodation: "Hotel image", illustrativeMeeting: "Hotel space", illustrativeFacade: "Hotel exterior" },
  ar: { body: "دليل عملي لإقامة الشركات وبرامج السفر الديني في المدينة المنورة. ويؤكد فريق الغانم ترافل التوافر والترتيبات معكم مباشرة.", verified: "ملف الفندق", pending: "التفاصيل قيد الإعداد", coming: "تُضاف ملفات إقامة مكة عند إتاحتها ضمن خدمة إقامة الشركات.", gallery: "معرض صور الفندق", source: "بيانات الفندق", galleryFilter: "معرض صور الفندق", galleryNote: "تُعرض صور الفندق عند توافرها.", illustrativeAccommodation: "صورة الفندق", illustrativeMeeting: "مساحة الفندق", illustrativeFacade: "واجهة الفندق" },
  ms: { body: "Direktori praktikal untuk penginapan korporat dan program perjalanan ibadah di Madinah. Pasukan Al Ghanem Travel mengesahkan ketersediaan dan aturan bersama anda secara langsung.", verified: "PROFIL HOTEL", pending: "BUTIRAN SEDANG DISEDIAKAN", coming: "Profil penginapan Makkah akan ditambah apabila tersedia untuk perkhidmatan penginapan korporat kami.", gallery: "GALERI HOTEL", source: "Butiran hotel", galleryFilter: "GALERI HOTEL", galleryNote: "Imej hotel dipaparkan apabila tersedia.", illustrativeAccommodation: "Imej hotel", illustrativeMeeting: "Ruang hotel", illustrativeFacade: "Bahagian luar hotel" },
  ur: { body: "مدینہ میں کارپوریٹ رہائش اور دینی سفری پروگراموں کے لیے ایک عملی ڈائریکٹری۔ Al Ghanem Travel کی ٹیم دستیابی اور انتظامات کی آپ کے ساتھ براہ راست تصدیق کرتی ہے۔", verified: "ہوٹل پروفائل", pending: "تفصیلات تیار کی جارہی ہیں", coming: "مکہ رہائش پروفائلز کارپوریٹ رہائش کی خدمت کے لیے دستیاب ہونے پر شامل کیے جائیں گے۔", gallery: "ہوٹل گیلری", source: "ہوٹل کی تفصیلات", galleryFilter: "ہوٹل گیلری", galleryNote: "ہوٹل کی تصاویر دستیاب ہونے پر دکھائی جاتی ہیں۔", illustrativeAccommodation: "ہوٹل کی تصویر", illustrativeMeeting: "ہوٹل کی جگہ", illustrativeFacade: "ہوٹل کا بیرونی منظر" },
  id: { body: "Direktori praktis untuk akomodasi perusahaan dan program perjalanan ibadah di Madinah. Tim Al Ghanem Travel mengonfirmasi ketersediaan dan pengaturan langsung bersama Anda.", verified: "PROFIL HOTEL", pending: "DETAIL SEDANG DISIAPKAN", coming: "Profil akomodasi Makkah akan ditambahkan saat tersedia untuk layanan akomodasi perusahaan kami.", gallery: "GALERI HOTEL", source: "Detail hotel", galleryFilter: "GALERI HOTEL", galleryNote: "Gambar hotel ditampilkan saat tersedia.", illustrativeAccommodation: "Gambar hotel", illustrativeMeeting: "Ruang hotel", illustrativeFacade: "Eksterior hotel" },
  hi: { body: "मदीना में कॉर्पोरेट आवास और धार्मिक यात्रा कार्यक्रमों के लिए एक व्यावहारिक निर्देशिका। Al Ghanem Travel की टीम आपके साथ उपलब्धता और व्यवस्थाओं की सीधे पुष्टि करती है।", verified: "होटल प्रोफ़ाइल", pending: "विवरण तैयार किए जा रहे हैं", coming: "मक्का आवास प्रोफ़ाइल हमारी कॉर्पोरेट आवास सेवा के लिए उपलब्ध होने पर जोड़ी जाएंगी।", gallery: "होटल गैलरी", source: "होटल विवरण", galleryFilter: "होटल गैलरी", galleryNote: "होटल की छवियां उपलब्ध होने पर दिखाई जाती हैं।", illustrativeAccommodation: "होटल छवि", illustrativeMeeting: "होटल स्थान", illustrativeFacade: "होटल का बाहरी दृश्य" },
};

export const portfolioLabels = Object.fromEntries(
  Object.entries(rawPortfolioLabels).map(([locale, labels]) => [
    locale,
    { ...labels, ...portfolioLabelOverrides[locale as keyof typeof portfolioLabelOverrides] },
  ]),
) as typeof rawPortfolioLabels;

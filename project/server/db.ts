import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  corporateInquiries,
  customerReviews,
  cities,
  hotels,
  hotelEditorialNotes,
  hotelGalleries,
  hotelAmenities,
  hotelRooms,
  hotelTranslations,
  siteSettings,
  InsertUser,
  type CorporateInquiry,
  type CustomerReview,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import type { PartnerHotelImport } from "./partnerHotelImport";
import type { HotelAuthorizedImage, HotelContentDraft, HotelContentRemove } from "./hotelContentAdmin";
import { defaultPublicSiteSettings, publicSiteSettingsInput, type PublicSiteSettings } from "./siteSettings";
import { storagePut } from "./storage";
import { publicCompanyIdentity } from "./reviewPublishing";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateExternalAdmin(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for external authentication.");
  const normalizedEmail = email.toLowerCase();
  const openId = `external:${normalizedEmail}`;
  await db
    .insert(users)
    .values({ openId, name: normalizedEmail, email: normalizedEmail, loginMethod: "local", role: "admin", lastSignedIn: new Date() })
    .onDuplicateKeyUpdate({ set: { name: normalizedEmail, email: normalizedEmail, loginMethod: "local", role: "admin", lastSignedIn: new Date() } });
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  if (!rows[0]) throw new Error("External administrator record could not be resolved.");
  return rows[0];
}

export type NewCorporateInquiry = Omit<
  typeof corporateInquiries.$inferInsert,
  "id" | "createdAt" | "ownerNotifiedAt" | "emailStatus"
>;

export async function createCorporateInquiry(input: NewCorporateInquiry): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for inquiry storage.");

  const result = await db.insert(corporateInquiries).values(input);
  return Number(result[0].insertId);
}

export async function updateInquiryNotificationStatus(
  id: number,
  update: Pick<CorporateInquiry, "ownerNotifiedAt" | "emailStatus">
) {
  const db = await getDb();
  if (!db) return;
  await db.update(corporateInquiries).set(update).where(eq(corporateInquiries.id, id));
}

export async function listRecentCorporateInquiries(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(corporateInquiries)
    .orderBy(desc(corporateInquiries.createdAt))
    .limit(limit);
}

export type NewCustomerReview = Omit<
  typeof customerReviews.$inferInsert,
  "id" | "createdAt" | "updatedAt" | "moderationStatus" | "moderationNote" | "reviewedByUserId" | "reviewedAt" | "ownerNotifiedAt"
>;

export async function createCustomerReview(input: NewCustomerReview): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for review storage.");
  const result = await db.insert(customerReviews).values(input);
  return Number(result[0].insertId);
}

export async function updateReviewNotificationStatus(id: number, ownerNotifiedAt: Date | null) {
  const db = await getDb();
  if (!db) return;
  await db.update(customerReviews).set({ ownerNotifiedAt }).where(eq(customerReviews.id, id));
}

export async function listApprovedCustomerReviews(limit = 12) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      id: customerReviews.id,
      companyName: customerReviews.companyName,
      reviewBody: customerReviews.reviewBody,
      rating: customerReviews.rating,
      locale: customerReviews.locale,
      serviceType: customerReviews.serviceType,
      displayCompanyName: customerReviews.displayCompanyName,
      publishConsent: customerReviews.publishConsent,
      createdAt: customerReviews.createdAt,
    })
    .from(customerReviews)
    .where(eq(customerReviews.moderationStatus, "approved"))
    .orderBy(desc(customerReviews.createdAt))
    .limit(limit);

  return rows
    .filter(review => review.publishConsent)
    .map(review => ({
      ...review,
      companyName: publicCompanyIdentity({
        moderationStatus: "approved",
        publishConsent: review.publishConsent,
        displayCompanyName: review.displayCompanyName,
        companyName: review.companyName,
      }),
    }));
}

export async function listPendingCustomerReviews(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(customerReviews)
    .where(eq(customerReviews.moderationStatus, "pending"))
    .orderBy(desc(customerReviews.createdAt))
    .limit(limit);
}

export async function moderateCustomerReview(
  id: number,
  update: Pick<CustomerReview, "moderationStatus" | "moderationNote" | "reviewedByUserId" | "reviewedAt">
) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for review moderation.");
  await db.update(customerReviews).set(update).where(eq(customerReviews.id, id));
}

export async function importVerifiedPartnerHotel(input: PartnerHotelImport) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for partner hotel import.");

  await db.insert(cities).values({ slug: input.city.slug, launchStatus: input.city.launchStatus }).onDuplicateKeyUpdate({
    set: { launchStatus: input.city.launchStatus },
  });
  const city = await db.select({ id: cities.id }).from(cities).where(eq(cities.slug, input.city.slug)).limit(1);
  const cityId = city[0]?.id;
  if (!cityId) throw new Error("City import could not be resolved.");

  await db.insert(hotels).values({
    cityId,
    slug: input.hotel.slug,
    category: input.hotel.category,
    latitude: input.hotel.latitude !== undefined ? String(input.hotel.latitude) : null,
    longitude: input.hotel.longitude !== undefined ? String(input.hotel.longitude) : null,
    officialWebsiteUrl: input.hotel.officialWebsiteUrl ?? null,
    corporateReady: input.hotel.corporateReady,
    portfolioStatus: input.hotel.portfolioStatus,
  }).onDuplicateKeyUpdate({
    set: {
      cityId,
      category: input.hotel.category,
      latitude: input.hotel.latitude !== undefined ? String(input.hotel.latitude) : null,
      longitude: input.hotel.longitude !== undefined ? String(input.hotel.longitude) : null,
      officialWebsiteUrl: input.hotel.officialWebsiteUrl ?? null,
      corporateReady: input.hotel.corporateReady,
      portfolioStatus: input.hotel.portfolioStatus,
    },
  });
  const hotel = await db.select({ id: hotels.id }).from(hotels).where(eq(hotels.slug, input.hotel.slug)).limit(1);
  const hotelId = hotel[0]?.id;
  if (!hotelId) throw new Error("Hotel import could not be resolved.");

  for (const translation of input.translations) {
    await db.insert(hotelTranslations).values({ hotelId, ...translation }).onDuplicateKeyUpdate({
      set: { name: translation.name, shortDescription: translation.shortDescription, longDescription: translation.longDescription, address: translation.address, metaTitle: translation.metaTitle ?? null, metaDescription: translation.metaDescription ?? null },
    });
  }
  return { cityId, hotelId, translationsImported: input.translations.length };
}

export async function listAdminHotelContent(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: hotels.id, slug: hotels.slug, category: hotels.category, sourceStatus: hotels.sourceStatus, portfolioStatus: hotels.portfolioStatus, citySlug: cities.slug, officialWebsiteUrl: hotels.officialWebsiteUrl, googleMapsPlaceUrl: hotels.googleMapsPlaceUrl, updatedAt: hotels.updatedAt }).from(hotels).innerJoin(cities, eq(hotels.cityId, cities.id)).orderBy(desc(hotels.updatedAt)).limit(limit);
}

export async function getAdminHotelContent(hotelId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for hotel content administration.");
  const rows = await db.select({ id: hotels.id, slug: hotels.slug, category: hotels.category, officialWebsiteUrl: hotels.officialWebsiteUrl, googleMapsPlaceUrl: hotels.googleMapsPlaceUrl, latitude: hotels.latitude, longitude: hotels.longitude, directoryZone: hotels.directoryZone, sourceStatus: hotels.sourceStatus, sourceNote: hotels.sourceNote, accessMode: hotels.accessMode, portfolioStatus: hotels.portfolioStatus, locationVerifiedAt: hotels.locationVerifiedAt, routeVerifiedAt: hotels.routeVerifiedAt, nearestGateName: hotels.nearestGateName, nearestGateAddress: hotels.nearestGateAddress, nearestGateMapsUrl: hotels.nearestGateMapsUrl, corporateReady: hotels.corporateReady }).from(hotels).where(eq(hotels.id, hotelId)).limit(1);
  const record = rows[0];
  if (!record) throw new Error("Hotel record was not found.");
  const translations = await db.select({ locale: hotelTranslations.locale, name: hotelTranslations.name, shortDescription: hotelTranslations.shortDescription, longDescription: hotelTranslations.longDescription, address: hotelTranslations.address }).from(hotelTranslations).where(eq(hotelTranslations.hotelId, hotelId));
  const gallery = await db.select({ id: hotelGalleries.id, imageUrl: hotelGalleries.imageUrl, altText: hotelGalleries.altText, reviewStatus: hotelGalleries.reviewStatus, createdAt: hotelGalleries.createdAt }).from(hotelGalleries).where(eq(hotelGalleries.hotelId, hotelId)).orderBy(hotelGalleries.displayOrder, hotelGalleries.createdAt);
  return { ...record, translations, gallery };
}

export async function listPublishedHotelContent() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ id: hotels.id, slug: hotels.slug, category: hotels.category, citySlug: cities.slug, googleMapsPlaceUrl: hotels.googleMapsPlaceUrl, locationVerifiedAt: hotels.locationVerifiedAt, routeVerifiedAt: hotels.routeVerifiedAt, nearestGateName: hotels.nearestGateName, nearestGateAddress: hotels.nearestGateAddress, directoryZone: hotels.directoryZone, sourceStatus: hotels.sourceStatus, accessMode: hotels.accessMode, corporateReady: hotels.corporateReady, locale: hotelTranslations.locale, name: hotelTranslations.name, shortDescription: hotelTranslations.shortDescription, longDescription: hotelTranslations.longDescription, address: hotelTranslations.address, imageUrl: hotelGalleries.imageUrl }).from(hotels).innerJoin(cities, eq(hotels.cityId, cities.id)).leftJoin(hotelTranslations, eq(hotelTranslations.hotelId, hotels.id)).leftJoin(hotelGalleries, and(eq(hotelGalleries.hotelId, hotels.id), eq(hotelGalleries.reviewStatus, "approved"))).where(eq(hotels.portfolioStatus, "published"));
  const records = new Map<number, { id: number; slug: string; category: "premium" | "executive" | "value"; citySlug: string; googleMapsPlaceUrl: string | null; locationVerifiedAt: Date | null; routeVerifiedAt: Date | null; nearestGateName: string | null; nearestGateAddress: string | null; directoryZone: string | null; sourceStatus: "planning" | "official" | "partner_verified"; accessMode: "walkable" | "transfer_advised" | null; corporateReady: boolean; translations: Array<{ locale: string; name: string; shortDescription: string | null; longDescription: string | null; address: string | null }>; gallery: string[] }>();
  for (const row of rows) {
    const record = records.get(row.id) ?? { ...row, translations: [], gallery: [] };
    if (row.locale && row.name && !record.translations.some(item => item.locale === row.locale)) record.translations.push({ locale: row.locale, name: row.name, shortDescription: row.shortDescription, longDescription: row.longDescription, address: row.address });
    if (row.imageUrl && !record.gallery.includes(row.imageUrl)) record.gallery.push(row.imageUrl);
    records.set(row.id, record);
  }
  return Array.from(records.values());
}

export async function saveAdminHotelContent(input: HotelContentDraft, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for hotel content administration.");
  await db.insert(cities).values({ slug: input.city.slug, launchStatus: input.city.launchStatus }).onDuplicateKeyUpdate({ set: { launchStatus: input.city.launchStatus } });
  const city = await db.select({ id: cities.id }).from(cities).where(eq(cities.slug, input.city.slug)).limit(1);
  const cityId = city[0]?.id;
  if (!cityId) throw new Error("City record could not be resolved.");
  const asDate = (value?: string) => value ? new Date(`${value}T00:00:00.000Z`) : null;
  await db.insert(hotels).values({ cityId, slug: input.hotel.slug, category: input.hotel.category, latitude: input.hotel.latitude === undefined ? null : String(input.hotel.latitude), longitude: input.hotel.longitude === undefined ? null : String(input.hotel.longitude), officialWebsiteUrl: input.hotel.officialWebsiteUrl ?? null, googleMapsPlaceUrl: input.hotel.googleMapsPlaceUrl ?? null, locationVerifiedAt: asDate(input.hotel.locationVerifiedAt), routeVerifiedAt: asDate(input.hotel.routeVerifiedAt), nearestGateName: input.hotel.nearestGateName ?? null, nearestGateAddress: input.hotel.nearestGateAddress ?? null, nearestGateMapsUrl: input.hotel.nearestGateMapsUrl ?? null, directoryZone: input.hotel.directoryZone ?? null, sourceStatus: input.hotel.sourceStatus, sourceNote: input.hotel.sourceNote ?? null, accessMode: input.hotel.accessMode ?? null, portfolioStatus: input.hotel.portfolioStatus, corporateReady: input.hotel.corporateReady }).onDuplicateKeyUpdate({ set: { cityId, category: input.hotel.category, latitude: input.hotel.latitude === undefined ? null : String(input.hotel.latitude), longitude: input.hotel.longitude === undefined ? null : String(input.hotel.longitude), officialWebsiteUrl: input.hotel.officialWebsiteUrl ?? null, googleMapsPlaceUrl: input.hotel.googleMapsPlaceUrl ?? null, locationVerifiedAt: asDate(input.hotel.locationVerifiedAt), routeVerifiedAt: asDate(input.hotel.routeVerifiedAt), nearestGateName: input.hotel.nearestGateName ?? null, nearestGateAddress: input.hotel.nearestGateAddress ?? null, nearestGateMapsUrl: input.hotel.nearestGateMapsUrl ?? null, directoryZone: input.hotel.directoryZone ?? null, sourceStatus: input.hotel.sourceStatus, sourceNote: input.hotel.sourceNote ?? null, accessMode: input.hotel.accessMode ?? null, portfolioStatus: input.hotel.portfolioStatus, corporateReady: input.hotel.corporateReady } });
  const hotel = await db.select({ id: hotels.id }).from(hotels).where(eq(hotels.slug, input.hotel.slug)).limit(1);
  const hotelId = hotel[0]?.id;
  if (!hotelId) throw new Error("Hotel record could not be resolved.");
  for (const translation of input.translations) await db.insert(hotelTranslations).values({ hotelId, ...translation }).onDuplicateKeyUpdate({ set: { name: translation.name, shortDescription: translation.shortDescription, longDescription: translation.longDescription, address: translation.address, metaTitle: translation.metaTitle ?? null, metaDescription: translation.metaDescription ?? null } });
  await db.insert(hotelEditorialNotes).values({ hotelId, locale: "en", note: input.editorialNote, sourceStatus: input.hotel.sourceStatus, createdByUserId: userId });
  return { hotelId, translationsSaved: input.translations.length };
}

export async function uploadAuthorizedHotelImage(input: HotelAuthorizedImage, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for hotel media administration.");
  const hotel = await db.select({ id: hotels.id }).from(hotels).where(eq(hotels.id, input.hotelId)).limit(1);
  if (!hotel[0]) throw new Error("Hotel record was not found.");
  const binary = Buffer.from(input.base64.replace(/^data:[^;]+;base64,/, ""), "base64");
  const { key, url } = await storagePut(`hotel-content/${input.hotelId}/${input.fileName}`, binary, input.contentType);
  await db.insert(hotelGalleries).values({ hotelId: input.hotelId, imageUrl: url, storageKey: key, altText: input.altText, rightsStatus: "partner_authorized", rightsEvidence: "Corporate pre-authorized media upload via the protected Al Ghanem Travel owner workspace.", reviewStatus: "approved", uploadedByUserId: userId });
  return { url, storageKey: key };
}

export async function removeAdminHotelImage(imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for hotel media administration.");
  const rows = await db.select({ id: hotelGalleries.id, storageKey: hotelGalleries.storageKey }).from(hotelGalleries).where(eq(hotelGalleries.id, imageId)).limit(1);
  const image = rows[0];
  if (!image) throw new Error("Hotel image was not found.");
  await db.delete(hotelGalleries).where(eq(hotelGalleries.id, image.id));
  return { success: true as const, storageKey: image.storageKey };
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const db = await getDb();
  if (!db) return defaultPublicSiteSettings;
  const rows = await db.select({ content: siteSettings.content }).from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  const stored = rows[0]?.content;
  const parsed = publicSiteSettingsInput.safeParse({ ...defaultPublicSiteSettings, ...(stored && typeof stored === "object" ? stored : {}) });
  return parsed.success ? parsed.data : defaultPublicSiteSettings;
}

export async function savePublicSiteSettings(input: PublicSiteSettings, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for site settings.");
  await db.insert(siteSettings).values({ id: 1, content: input, updatedByUserId: userId }).onDuplicateKeyUpdate({ set: { content: input, updatedByUserId: userId } });
  return getPublicSiteSettings();
}

export async function removeAdminHotelContent(input: HotelContentRemove) {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured for hotel content administration.");
  return db.transaction(async tx => {
    const rows = await tx.select({ id: hotels.id, slug: hotels.slug }).from(hotels).where(eq(hotels.id, input.hotelId)).limit(1);
    const record = rows[0];
    if (!record) throw new Error("Hotel record was not found.");
    if (record.slug !== input.confirmationSlug) throw new Error("Confirmation slug does not match the hotel record.");
    await tx.delete(hotelGalleries).where(eq(hotelGalleries.hotelId, record.id));
    await tx.delete(hotelEditorialNotes).where(eq(hotelEditorialNotes.hotelId, record.id));
    await tx.delete(hotelAmenities).where(eq(hotelAmenities.hotelId, record.id));
    await tx.delete(hotelRooms).where(eq(hotelRooms.hotelId, record.id));
    await tx.delete(hotelTranslations).where(eq(hotelTranslations.hotelId, record.id));
    await tx.delete(hotels).where(eq(hotels.id, record.id));
    return { success: true as const, slug: record.slug };
  });
}

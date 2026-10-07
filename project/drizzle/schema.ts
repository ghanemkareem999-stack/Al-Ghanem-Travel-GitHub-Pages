import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** A single editable record for public site defaults controlled by administrators. */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").primaryKey(),
  content: json("content").notNull(),
  updatedByUserId: int("updatedByUserId"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;

export const cities = mysqlTable(
  "cities",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    countryCode: varchar("countryCode", { length: 2 }).notNull().default("SA"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    launchStatus: mysqlEnum("launchStatus", ["active", "coming_soon", "hidden"])
      .notNull()
      .default("coming_soon"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("cities_slug_unique").on(table.slug)]
);

export const hotels = mysqlTable(
  "hotels",
  {
    id: int("id").autoincrement().primaryKey(),
    cityId: int("cityId").notNull(),
    slug: varchar("slug", { length: 128 }).notNull(),
    category: mysqlEnum("category", ["premium", "executive", "value"])
      .notNull()
      .default("executive"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    officialWebsiteUrl: varchar("officialWebsiteUrl", { length: 512 }),
    googleMapsPlaceUrl: varchar("googleMapsPlaceUrl", { length: 1024 }),
    locationVerifiedAt: timestamp("locationVerifiedAt"),
    routeVerifiedAt: timestamp("routeVerifiedAt"),
    nearestGateName: varchar("nearestGateName", { length: 255 }),
    nearestGateAddress: text("nearestGateAddress"),
    nearestGateMapsUrl: varchar("nearestGateMapsUrl", { length: 1024 }),
    directoryZone: varchar("directoryZone", { length: 64 }),
    sourceStatus: mysqlEnum("sourceStatus", ["planning", "official", "partner_verified"])
      .notNull()
      .default("planning"),
    sourceNote: text("sourceNote"),
    distanceEstimate: varchar("distanceEstimate", { length: 64 }),
    walkingEstimate: varchar("walkingEstimate", { length: 64 }),
    vehicleEstimate: varchar("vehicleEstimate", { length: 64 }),
    accessMode: mysqlEnum("accessMode", ["walkable", "transfer_advised"]),
    portfolioStatus: mysqlEnum("portfolioStatus", ["draft", "verified", "published"])
      .notNull()
      .default("draft"),
    corporateReady: boolean("corporateReady").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("hotels_slug_unique").on(table.slug)]
);

export const hotelTranslations = mysqlTable(
  "hotelTranslations",
  {
    id: int("id").autoincrement().primaryKey(),
    hotelId: int("hotelId").notNull(),
    locale: varchar("locale", { length: 8 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    shortDescription: text("shortDescription"),
    longDescription: text("longDescription"),
    address: text("address"),
    metaTitle: varchar("metaTitle", { length: 255 }),
    metaDescription: text("metaDescription"),
  },
  table => [uniqueIndex("hotel_locale_unique").on(table.hotelId, table.locale)]
);

export const hotelRooms = mysqlTable("hotelRooms", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: int("hotelId").notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  occupancy: int("occupancy").notNull().default(2),
  sizeSqm: int("sizeSqm"),
  bedConfiguration: varchar("bedConfiguration", { length: 255 }),
  localeContent: json("localeContent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const hotelAmenities = mysqlTable("hotelAmenities", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: int("hotelId").notNull(),
  code: varchar("code", { length: 64 }).notNull(),
  localeContent: json("localeContent"),
});

export const hotelGalleries = mysqlTable("hotelGalleries", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: int("hotelId").notNull(),
  imageUrl: varchar("imageUrl", { length: 1024 }).notNull(),
  storageKey: varchar("storageKey", { length: 1024 }),
  altText: text("altText"),
  rightsStatus: mysqlEnum("rightsStatus", ["partner_authorized", "licensed", "generated"])
    .notNull(),
  rightsEvidence: text("rightsEvidence"),
  reviewStatus: mysqlEnum("reviewStatus", ["pending_review", "approved"])
    .notNull()
    .default("pending_review"),
  uploadedByUserId: int("uploadedByUserId"),
  displayOrder: int("displayOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Internal notes are never part of the public hotel profile or customer-review system. */
export const hotelEditorialNotes = mysqlTable("hotelEditorialNotes", {
  id: int("id").autoincrement().primaryKey(),
  hotelId: int("hotelId").notNull(),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  note: text("note").notNull(),
  sourceStatus: mysqlEnum("sourceStatus", ["planning", "official", "partner_verified"])
    .notNull()
    .default("planning"),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const corporateInquiries = mysqlTable("corporateInquiries", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 64 }).notNull(),
  country: varchar("country", { length: 120 }).notNull(),
  preferredCity: varchar("preferredCity", { length: 64 }).notNull(),
  preferredHotels: text("preferredHotels"),
  roomCount: int("roomCount").notNull(),
  guestCount: int("guestCount").notNull(),
  checkIn: varchar("checkIn", { length: 16 }),
  checkOut: varchar("checkOut", { length: 16 }),
  stayDuration: varchar("stayDuration", { length: 64 }),
  notes: text("notes"),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  ownerNotifiedAt: timestamp("ownerNotifiedAt"),
  emailStatus: mysqlEnum("emailStatus", ["deferred", "sent", "failed"])
    .notNull()
    .default("deferred"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Customer feedback is collected for moderation only. No row is publicly visible
 * until an administrator approves it, and the company identity is displayed only
 * when the respondent explicitly grants that permission.
 */
export const customerReviews = mysqlTable("customerReviews", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 64 }),
  serviceType: varchar("serviceType", { length: 64 }),
  rating: int("rating").notNull(),
  reviewBody: text("reviewBody").notNull(),
  locale: varchar("locale", { length: 8 }).notNull().default("en"),
  experienceConfirmed: boolean("experienceConfirmed").notNull().default(false),
  publishConsent: boolean("publishConsent").notNull().default(false),
  displayCompanyName: boolean("displayCompanyName").notNull().default(false),
  moderationStatus: mysqlEnum("moderationStatus", ["pending", "approved", "rejected"])
    .notNull()
    .default("pending"),
  moderationNote: text("moderationNote"),
  reviewedByUserId: int("reviewedByUserId"),
  reviewedAt: timestamp("reviewedAt"),
  ownerNotifiedAt: timestamp("ownerNotifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type City = typeof cities.$inferSelect;
export type Hotel = typeof hotels.$inferSelect;
export type HotelGallery = typeof hotelGalleries.$inferSelect;
export type HotelEditorialNote = typeof hotelEditorialNotes.$inferSelect;
export type CorporateInquiry = typeof corporateInquiries.$inferSelect;
export type CustomerReview = typeof customerReviews.$inferSelect;

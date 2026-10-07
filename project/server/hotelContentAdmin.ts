import { z } from "zod";

const locale = z.enum(["en", "ar", "ms", "ur", "id", "hi"]);
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();

export const hotelContentDraftInput = z.object({
  city: z.object({ slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(64), launchStatus: z.enum(["active", "coming_soon", "hidden"]).default("coming_soon") }),
  hotel: z.object({
    slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(128),
    category: z.enum(["premium", "executive", "value"]),
    officialWebsiteUrl: z.string().url().max(512).optional(),
    googleMapsPlaceUrl: z.string().url().max(1024).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    directoryZone: z.enum(["central_north", "central_east", "central_south", "central_west", "northern_transfer", "other_districts"]).optional(),
    sourceStatus: z.enum(["planning", "official", "partner_verified"]),
    sourceNote: z.string().trim().max(4000).optional(),
    accessMode: z.enum(["walkable", "transfer_advised"]).optional(),
    locationVerifiedAt: dateString,
    routeVerifiedAt: dateString,
    nearestGateName: z.string().trim().max(255).optional(),
    nearestGateAddress: z.string().trim().max(4000).optional(),
    nearestGateMapsUrl: z.string().url().max(1024).optional(),
    portfolioStatus: z.enum(["draft", "verified", "published"]),
    corporateReady: z.boolean().default(false),
  }).superRefine((hotel, context) => {
    if ((hotel.latitude === undefined) !== (hotel.longitude === undefined)) context.addIssue({ code: "custom", message: "Latitude and longitude must be supplied together.", path: ["latitude"] });
    if (hotel.nearestGateName && (!hotel.nearestGateAddress || !hotel.routeVerifiedAt)) context.addIssue({ code: "custom", message: "A named gate requires its address and route-review date.", path: ["nearestGateName"] });
    if (hotel.portfolioStatus === "published" && hotel.sourceStatus === "planning") context.addIssue({ code: "custom", message: "A published hotel requires official or partner-verified evidence.", path: ["sourceStatus"] });
    if (hotel.portfolioStatus === "published" && (!hotel.googleMapsPlaceUrl || !hotel.locationVerifiedAt)) context.addIssue({ code: "custom", message: "A published hotel requires a reviewed Google Maps place URL and location-review date.", path: ["googleMapsPlaceUrl"] });
  }),
  translations: z.array(z.object({ locale, name: z.string().trim().min(2).max(255), shortDescription: z.string().trim().min(20).max(1000), longDescription: z.string().trim().min(40).max(8000), address: z.string().trim().min(6).max(4000), metaTitle: z.string().trim().max(255).optional(), metaDescription: z.string().trim().max(500).optional() })).min(1).max(6),
  editorialNote: z.string().trim().min(8).max(4000),
}).superRefine((value, context) => {
  if (!value.translations.some(item => item.locale === "en")) context.addIssue({ code: "custom", message: "An English translation is required.", path: ["translations"] });
  if (new Set(value.translations.map(item => item.locale)).size !== value.translations.length) context.addIssue({ code: "custom", message: "Each locale may appear only once.", path: ["translations"] });
});

export const hotelAuthorizedImageInput = z.object({
  hotelId: z.number().int().positive(),
  fileName: z.string().trim().regex(/^[a-zA-Z0-9._-]+$/).max(128),
  contentType: z.enum(["image/webp", "image/jpeg", "image/png"]),
  base64: z.string().min(16).max(8_000_000),
  altText: z.string().trim().min(8).max(500),
});

export const hotelContentRemoveInput = z.object({
  hotelId: z.number().int().positive(),
  confirmationSlug: z.string().trim().regex(/^[a-z0-9-]+$/).max(128),
});

export const hotelGalleryRemoveInput = z.object({
  imageId: z.number().int().positive(),
});

export function isPublicPortfolioStatus(status: "draft" | "verified" | "published") {
  return status === "published";
}

export type HotelContentDraft = z.infer<typeof hotelContentDraftInput>;
export type HotelAuthorizedImage = z.infer<typeof hotelAuthorizedImageInput>;
export type HotelContentRemove = z.infer<typeof hotelContentRemoveInput>;
export type HotelGalleryRemove = z.infer<typeof hotelGalleryRemoveInput>;

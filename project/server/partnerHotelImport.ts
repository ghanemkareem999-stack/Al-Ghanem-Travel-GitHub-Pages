import { z } from "zod";

const locale = z.enum(["en", "ar", "ms", "ur", "id", "hi"]);

export const partnerHotelImportSchema = z.object({
  city: z.object({
    slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(64),
    launchStatus: z.enum(["active", "coming_soon", "hidden"]).default("coming_soon"),
  }),
  hotel: z.object({
    slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(128),
    category: z.enum(["premium", "executive", "value"]),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    officialWebsiteUrl: z.string().url().max(512).optional(),
    corporateReady: z.boolean().default(false),
    portfolioStatus: z.literal("verified"),
  }),
  translations: z.array(z.object({
    locale,
    name: z.string().trim().min(2).max(255),
    shortDescription: z.string().trim().min(20).max(1000),
    longDescription: z.string().trim().min(40).max(8000),
    address: z.string().trim().min(6).max(4000),
    metaTitle: z.string().trim().max(255).optional(),
    metaDescription: z.string().trim().max(500).optional(),
  })).min(1).max(6),
}).superRefine((value, context) => {
  if (!value.translations.some(item => item.locale === "en")) {
    context.addIssue({ code: "custom", message: "An English translation is required for verified partner ingestion.", path: ["translations"] });
  }
  const locales = value.translations.map(item => item.locale);
  if (new Set(locales).size !== locales.length) {
    context.addIssue({ code: "custom", message: "Each locale may appear only once.", path: ["translations"] });
  }
});

export type PartnerHotelImport = z.infer<typeof partnerHotelImportSchema>;

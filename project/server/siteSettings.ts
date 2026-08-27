import { z } from "zod";

export const defaultPublicSiteSettings = {
  homepageWelcomeEyebrow: "Al Ghanem Travel",
  homepageWelcomeTitle: "Accommodation for groups and religious-travel programmes.",
  homepageWelcomeBody: "Corporate accommodation and religious-travel programmes, coordinated through Al Ghanem Travel.",
  contactEmail: "alghanemtravel@gmail.com",
  primaryWhatsAppUrl: "https://wa.me/message/KQURHNYUTPXPK1",
  secondaryWhatsAppDisplay: "+20 10 42923435",
  secondaryWhatsAppUrl: "https://wa.me/201042923435",
  facebookUrl: "https://www.facebook.com/share/1BmzDcDGTK/",
  defaultSeoTitle: "Al Ghanem Travel | Islamic Tourism & Travel Services",
  defaultSeoDescription: "Corporate accommodation and religious-travel programmes for Madinah Al Munawwarah.",
} as const;

const whatsappUrl = z.string().url().refine(value => new URL(value).hostname === "wa.me", "Use a wa.me WhatsApp URL.");

export const publicSiteSettingsInput = z.object({
  homepageWelcomeEyebrow: z.string().trim().min(2).max(120),
  homepageWelcomeTitle: z.string().trim().min(2).max(255),
  homepageWelcomeBody: z.string().trim().min(10).max(1000),
  contactEmail: z.string().trim().email().max(320),
  primaryWhatsAppUrl: whatsappUrl,
  secondaryWhatsAppDisplay: z.string().trim().min(7).max(64),
  secondaryWhatsAppUrl: whatsappUrl,
  facebookUrl: z.string().url().max(512),
  defaultSeoTitle: z.string().trim().min(10).max(255),
  defaultSeoDescription: z.string().trim().min(20).max(500),
});

export type PublicSiteSettings = z.infer<typeof publicSiteSettingsInput>;

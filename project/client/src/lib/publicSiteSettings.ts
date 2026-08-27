import { businessContacts } from "@/lib/contact";

export type PublicSiteSettings = {
  homepageWelcomeEyebrow: string;
  homepageWelcomeTitle: string;
  homepageWelcomeBody: string;
  contactEmail: string;
  primaryWhatsAppUrl: string;
  secondaryWhatsAppDisplay: string;
  secondaryWhatsAppUrl: string;
  facebookUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
};

export function resolvePublicContacts(settings?: Pick<PublicSiteSettings, "contactEmail" | "primaryWhatsAppUrl" | "secondaryWhatsAppDisplay" | "secondaryWhatsAppUrl" | "facebookUrl">) {
  const email = settings?.contactEmail || businessContacts.email;
  return {
    primaryWhatsAppUrl: settings?.primaryWhatsAppUrl || businessContacts.primaryWhatsAppUrl,
    secondaryWhatsAppDisplay: settings?.secondaryWhatsAppDisplay || businessContacts.secondaryWhatsAppDisplay,
    secondaryWhatsAppUrl: settings?.secondaryWhatsAppUrl || businessContacts.secondaryWhatsAppUrl,
    email,
    corporateEmailHref: `mailto:${email}?subject=Corporate%20Accommodation%20Enquiry`,
    facebookUrl: settings?.facebookUrl || businessContacts.facebookUrl,
  };
}

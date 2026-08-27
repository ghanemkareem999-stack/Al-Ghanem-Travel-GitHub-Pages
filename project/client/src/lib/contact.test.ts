import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { businessContacts, getHotelWhatsAppInquiryUrl } from "./contact";
import { infoCopy } from "./infoCopy";

const clientSourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readClientSource = (relativePath: string) => readFileSync(resolve(clientSourceRoot, relativePath), "utf8");

describe("business contact configuration", () => {
  it("keeps the approved non-call contact channels consistent", () => {
    expect(businessContacts).not.toHaveProperty("primaryPhoneHref");
    expect(businessContacts).not.toHaveProperty("primaryPhoneDisplay");
    expect(businessContacts.primaryWhatsAppUrl).toBe("https://wa.me/message/KQURHNYUTPXPK1");
    expect(businessContacts.secondaryWhatsAppUrl).toBe("https://wa.me/201042923435");
    expect(businessContacts.facebookUrl).toBe("https://www.facebook.com/share/1BmzDcDGTK/");
    expect(businessContacts.corporateEmailHref).toContain("alghanemtravel@gmail.com");
    expect(businessContacts.corporateEmailHref).toContain("Corporate%20Accommodation%20Enquiry");
  });

  it("removes public call actions while retaining WhatsApp, email, and inquiry paths", () => {
    const siteShell = readClientSource("components/SiteShell.tsx");
    const contactPage = readClientSource("pages/InformationPage.tsx");
    const inquiryPage = readClientSource("pages/CorporateInquiry.tsx");

    expect(siteShell).toContain("resolvePublicContacts(siteSettings.data)");
    expect(siteShell).toContain("contacts.secondaryWhatsAppUrl");
    expect(siteShell).toContain("contacts.secondaryWhatsAppDisplay");
    expect(siteShell).not.toContain("Additional WhatsApp");
    expect(siteShell).toContain("contacts.corporateEmailHref");
    expect(siteShell).toContain("const whatsappChatUrl = contacts.primaryWhatsAppUrl");
    expect(siteShell).not.toContain("href={contacts.primaryWhatsAppUrl}");
    expect(siteShell).not.toContain("WhatsApp — Saudi");
    expect(siteShell).toContain('href="/inquiry"');
    expect(contactPage).not.toContain("businessContacts.primaryWhatsAppUrl");
    expect(contactPage).toContain('href="/inquiry"');
    expect(inquiryPage).not.toContain("businessContacts.primaryWhatsAppUrl");
    expect(inquiryPage).toContain("const contacts = resolvePublicContacts(siteSettings.data)");
    expect(inquiryPage).toContain("contacts.secondaryWhatsAppUrl");
    expect(inquiryPage).toContain("contacts.corporateEmailHref");
  });

  it("does not expose the Saudi number in public contact copy", () => {
    for (const contactCopy of Object.values(infoCopy)) {
      const details = contactCopy.contact.sections.find(section => section.body.includes("+966 56 375 6320"));
      expect(details).toBeUndefined();
    }
  });

  it("uses the concise WhatsApp label rather than an additional-contact label in every public locale", () => {
    expect(Object.values(infoCopy).map(copy => copy.contact.sections[1]?.body).join(" ")).not.toMatch(/Additional WhatsApp|واتساب إضافي|WhatsApp tambahan|اضافی واٹس ایپ|अतिरिक्त WhatsApp/);
  });

  it("builds a hotel-specific WhatsApp message through the approved secondary WhatsApp channel", () => {
    const url = getHotelWhatsAppInquiryUrl("ar", "فندق الحياة الذهبي");
    expect(url).toMatch(/^https:\/\/wa\.me\/201042923435\?text=/);
    expect(decodeURIComponent(url)).toContain("فندق الحياة الذهبي");
    expect(url).not.toContain("563756320");
  });
});

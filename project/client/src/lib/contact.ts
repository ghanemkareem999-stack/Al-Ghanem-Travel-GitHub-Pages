export const businessContacts = {
  primaryWhatsAppUrl: "https://wa.me/message/KQURHNYUTPXPK1",
  secondaryWhatsAppDisplay: "+20 10 42923435",
  secondaryWhatsAppUrl: "https://wa.me/201042923435",
  email: "alghanemtravel@gmail.com",
  corporateEmailHref: "mailto:alghanemtravel@gmail.com?subject=Corporate%20Accommodation%20Enquiry",
  facebookUrl: "https://www.facebook.com/share/1BmzDcDGTK/",
} as const;

type HotelInquiryLocale = "ar" | "en" | "ms" | "ur" | "id" | "hi";

const hotelInquiryMessages: Record<HotelInquiryLocale, (hotelName: string) => string> = {
  ar: (hotelName) => `السلام عليكم الغانم ترافل، أود الاستفسار عن فندق ${hotelName}.`,
  en: (hotelName) => `Hello Al Ghanem Travel, I would like to enquire about ${hotelName}.`,
  ms: (hotelName) => `Salam Al Ghanem Travel, saya ingin bertanya tentang ${hotelName}.`,
  ur: (hotelName) => `السلام علیکم الغانم ترافل، میں ${hotelName} کے بارے میں معلومات چاہتا ہوں۔`,
  id: (hotelName) => `Halo Al Ghanem Travel, saya ingin menanyakan ${hotelName}.`,
  hi: (hotelName) => `नमस्ते अल घनेम ट्रैवल, मुझे ${hotelName} के बारे में जानकारी चाहिए।`,
};

export function getHotelWhatsAppInquiryUrl(locale: HotelInquiryLocale, hotelName: string) {
  return `${businessContacts.secondaryWhatsAppUrl}?text=${encodeURIComponent(hotelInquiryMessages[locale](hotelName))}`;
}

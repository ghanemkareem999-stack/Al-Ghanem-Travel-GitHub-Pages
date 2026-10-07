import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/HotelDetail.tsx", "utf8");

describe("HotelDetail gallery layout", () => {
  it("passes every approved gallery image into the interactive hotel gallery", () => {
    expect(source).toContain('import HotelGalleryLightbox from "@/components/HotelGalleryLightbox"');
    expect(source).toContain('images={displayGallery}');
    expect(source).toContain('galleryLabel={isDestinationPlaceholder ? destinationGalleryLabel : propertyGalleryLabel}');
  });

  it("uses neutral hotel-specific alt text instead of fixed illustrative labels", () => {
    expect(source).toContain("function hotelGalleryAlt");
    expect(source).toContain('getImageAlt={(image, index) => hotelGalleryAlt(locale, displayName, image, index, isDestinationPlaceholder)}');
    expect(source).not.toContain("alt={text.illustrativeAccommodation}");
    expect(source).not.toContain("alt={text.illustrativeMeeting}");
    expect(source).not.toContain("alt={text.illustrativeFacade}");
  });

  it("discloses generic destination imagery rather than presenting it as hotel photography", () => {
    expect(source).toContain('const isDestinationPlaceholder = hotel.galleryKind === "destination_placeholder"');
    expect(source).toContain("Madinah destination image — not hotel property photography");
    expect(source).toContain("placeholderMediaDisclosure");
  });

  it("uses a balanced title size for Arabic bilingual hotel names before their English identifier wraps awkwardly", () => {
    expect(source).toContain('locale === "ar" && displayName.includes(" — ") && displayName.length > 24');
    expect(source).toContain('hasLongDisplayName ? "text-[2.25rem] sm:text-5xl md:text-5xl"');
    expect(source).toContain('break-words font-serif leading-[1.1]');
  });

  it("keeps multiword English hotel names intact when displayed beside an Arabic hotel name", () => {
    expect(source).toContain('const hasArabicBilingualName = locale === "ar" && Boolean(hotel.arabicName)');
    expect(source).toContain('dir="ltr" className="block max-w-full text-left sm:inline-block sm:whitespace-nowrap"');
    expect(source).toContain('aria-hidden="true" className="hidden sm:inline"');
  });

  it("opens a hotel-specific WhatsApp enquiry with the selected property name pre-filled", () => {
    expect(source).toContain('import { getHotelWhatsAppInquiryUrl } from "@/lib/contact"');
    expect(source).toContain("const hotelWhatsAppInquiryUrl = getHotelWhatsAppInquiryUrl(locale, displayName)");
    expect(source).toContain('href={hotelWhatsAppInquiryUrl}');
    expect(source).toContain('target="_blank"');
  });

  it("provides a safe back-navigation control to the localized hotel directory", () => {
    expect(source).toContain('import BackNavigation from "@/components/BackNavigation"');
    expect(source).toContain('<BackNavigation fallback="/hotels" />');
  });
});

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/Home.tsx", "utf8");

describe("Home Madinah directory feature card", () => {
  it("uses an accessible whole-card link for the active Madinah hotel directory card", () => {
    expect(source).toContain('<Link href="/hotels" aria-label={t.city.action} className="group relative block');
    expect(source).toContain('focus-visible:ring-4 focus-visible:ring-[#dfc27f]/60');
    expect(source).toContain('group-hover:scale-110');
  });

  it("includes the live hotel name search in the primary hero", () => {
    expect(source).toContain("<HotelSearch hotels={searchableHotels} />");
  });

  it("places the official WhatsApp, email, and Facebook channels prominently inside the primary hero without a public telephone action", () => {
    expect(source).toContain("const quickContactCopy");
    expect(source).toContain("const contacts = resolvePublicContacts(siteSettings.data)");
    expect(source).toContain('href={contacts.primaryWhatsAppUrl}');
    expect(source).toContain('href={contacts.corporateEmailHref}');
    expect(source).toContain('href={contacts.facebookUrl}');
    expect(source).toContain("{contacts.email}");
    expect(source).toContain("{copy.whatsapp}");
    expect(source.indexOf("<HeroQuickContact copy={quickContact} contacts={contacts} />")).toBeLessThan(source.indexOf("<HotelSearch hotels={searchableHotels} />"));
    expect(source).toContain('className="absolute inset-x-4 top-4 z-20 grid grid-cols-3');
    expect(source).not.toMatch(/href=\{contacts\.primaryPhoneHref\}|href="tel:/);
  });

  it("keeps the trust statement professional without a licensing or formal-approval claim", () => {
    expect(source).toContain("17 years of experience · Dedicated travel service");
    expect(source).not.toMatch(/Licensed travel service|مرخّصة|berlesen|لائسنس یافتہ|berlisensi|लाइसेंस/);
  });

  it("surfaces only approved customer reviews directly after the early trust section", () => {
    expect(source).toContain("const approvedReviews = trpc.reviews.approved.useQuery()");
    expect(source).toContain('<section id="reviews"');
    expect(source.indexOf('<section id="reviews"')).toBeGreaterThan(source.indexOf("trustStatement"));
    expect(source.indexOf('<section id="reviews"')).toBeLessThan(source.indexOf('<section id="approach"'));
    expect(source).toContain("approvedReviews.data.slice(0, 3)");
    expect(source).toContain("reviewText.approvedEmpty");
  });

  it("promotes the hotel directory CTA before the corporate inquiry CTA in the hero", () => {
    const directoryCta = source.indexOf('<Link href="/hotels" className="group inline-flex min-h-[112px]');
    const inquiryCta = source.indexOf('<Link href="/inquiry" className="group inline-flex min-h-[112px]');
    expect(directoryCta).toBeGreaterThan(-1);
    expect(inquiryCta).toBeGreaterThan(directoryCta);
  });

  it("places the Madinah and Makkah destination cards directly after the primary hero before the trust and reviews sections", () => {
    const destinations = source.indexOf('aria-labelledby="destination-cards"');
    const trust = source.indexOf('bg-[#f4f0e6] md:grid-cols-4');
    const reviews = source.indexOf('<section id="reviews"');
    expect(destinations).toBeGreaterThan(source.indexOf("<HotelSearch hotels={searchableHotels} />"));
    expect(destinations).toBeLessThan(trust);
    expect(destinations).toBeLessThan(reviews);
    expect(source).toContain('h2 id="destination-cards"');
  });

  it("labels the directory and corporate-request paths with clear visitor-facing context", () => {
    expect(source).toContain('prompt: "اختاروا المسار المناسب لكم"');
    expect(source).toContain('catalogueLabel: "دليل وكتالوج فنادق المدينة"');
    expect(source).toContain('catalogueHint: "تصفحوا الفنادق والصور وابحثوا باسم الفندق"');
    expect(source).toContain('inquiryLabel: "طلب إقامة للشركات والمجموعات"');
    expect(source).toContain('<Hotel size={18} aria-hidden="true" />');
    expect(source).toContain('<Building2 size={18} aria-hidden="true" />');
  });

  it("makes the empty review card a single clear review-submission link with a visible rating cue", () => {
    expect(source).toContain('<Link href="/reviews#share" aria-label={reviewText.footerAction}');
    expect(source).toContain('<Star size={16} fill="currentColor" />');
    expect(source).toContain('<MessageSquareQuote size={16} />');
  });
});

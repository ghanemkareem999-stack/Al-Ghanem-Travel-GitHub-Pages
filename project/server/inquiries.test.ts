import { describe, expect, it } from "vitest";
import { corporateInquiryInput, formatInquiryForOwner } from "./inquiries";

describe("corporate inquiry formatter", () => {
  it("includes every submitted booking field in the owner alert", () => {
    const content = formatInquiryForOwner({
      companyName: "North Star Travel",
      contactName: "Amina Kareem",
      email: "amina@example.com",
      phone: "+966501234567",
      country: "Malaysia",
      preferredCity: "madinah",
      preferredHotels: "Verified partner properties near Al-Masjid an-Nabawi",
      roomCount: 12,
      guestCount: 24,
      checkIn: "2026-11-01",
      checkOut: "2026-11-08",
      stayDuration: "7 nights",
      notes: "Accessible rooms requested.",
      locale: "ms",
    });

    expect(content).toContain("Company: North Star Travel");
    expect(content).toContain("Rooms requested: 12");
    expect(content).toContain("Additional requirements: Accessible rooms requested.");
    expect(content).toContain("Website language: ms");
  });

  it("rejects a populated hidden website field used by simple form bots", () => {
    expect(() => corporateInquiryInput.parse({
      companyName: "North Star Travel", contactName: "Amina Kareem", email: "amina@example.com", phone: "+966501234567", country: "Malaysia", preferredCity: "madinah", roomCount: 12, guestCount: 24, locale: "ms", website: "https://spam.example",
    })).toThrow();
  });

  it("accepts the short first-contact brief and leaves additional details for follow-up", () => {
    expect(corporateInquiryInput.parse({ contactName: "Amina Kareem", phone: "+966501234567", preferredCity: "madinah", checkIn: "2026-11-01", checkOut: "2026-11-08", locale: "ar" })).toMatchObject({ contactName: "Amina Kareem", preferredCity: "madinah" });
  });
});

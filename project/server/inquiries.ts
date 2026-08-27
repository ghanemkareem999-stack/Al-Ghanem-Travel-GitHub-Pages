import { z } from "zod";

export const corporateInquiryInput = z.object({
  companyName: z.string().trim().max(255).optional(),
  contactName: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(320).optional(),
  phone: z.string().trim().min(7).max(64),
  country: z.string().trim().max(120).optional(),
  preferredCity: z.enum(["madinah", "makkah"]),
  preferredHotels: z.string().trim().max(4000).optional(),
  roomCount: z.number().int().min(1).max(2000).optional(),
  guestCount: z.number().int().min(1).max(10000).optional(),
  checkIn: z.string().trim().max(16).optional(),
  checkOut: z.string().trim().max(16).optional(),
  stayDuration: z.string().trim().max(64).optional(),
  notes: z.string().trim().max(8000).optional(),
  locale: z.enum(["en", "ar", "ms", "ur", "id", "hi"]),
  website: z.string().max(0).optional(),
});

export type CorporateInquiryInput = z.infer<typeof corporateInquiryInput>;

const fieldLabels: Array<[keyof CorporateInquiryInput, string]> = [
  ["companyName", "Company"],
  ["contactName", "Contact person"],
  ["email", "Email"],
  ["phone", "Phone / WhatsApp"],
  ["country", "Country"],
  ["preferredCity", "Preferred city"],
  ["preferredHotels", "Preferred properties"],
  ["roomCount", "Rooms requested"],
  ["guestCount", "Guests"],
  ["checkIn", "Check-in"],
  ["checkOut", "Check-out"],
  ["stayDuration", "Long-stay requirement"],
  ["notes", "Additional requirements"],
  ["locale", "Website language"],
];

export function formatInquiryForOwner(input: CorporateInquiryInput): string {
  return fieldLabels
    .map(([field, label]) => `${label}: ${input[field] || "Not supplied"}`)
    .join("\n");
}

import { z } from "zod";

export const reviewLocale = z.enum(["en", "ar", "ms", "ur", "id", "hi"]);

export const customerReviewInput = z.object({
  companyName: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().min(7).max(64).optional(),
  rating: z.number().int().min(1).max(5),
  reviewBody: z.string().trim().min(20).max(3000),
  locale: reviewLocale,
  experienceConfirmed: z.literal(true),
  publishConsent: z.literal(true),
  displayCompanyName: z.boolean(),
  website: z.string().max(0).optional(),
});

export const reviewModerationInput = z.object({
  reviewId: z.number().int().positive(),
  moderationStatus: z.enum(["approved", "rejected"]),
  moderationNote: z.string().trim().max(1000).optional(),
});

export type CustomerReviewInput = z.infer<typeof customerReviewInput>;

export function formatReviewForOwner(input: CustomerReviewInput): string {
  return [
    `Company: ${input.companyName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "Not supplied"}`,
    `Rating: ${input.rating}/5`,
    `Language: ${input.locale}`,
    `Display company name: ${input.displayCompanyName ? "Yes" : "No"}`,
    "Review:",
    input.reviewBody,
  ].join("\n");
}

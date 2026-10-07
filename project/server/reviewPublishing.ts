export type PublishableReview = {
  moderationStatus: "pending" | "approved" | "rejected";
  publishConsent: boolean;
  displayCompanyName: boolean;
  companyName: string;
};

export function publicCompanyIdentity(review: PublishableReview): string | null {
  if (review.moderationStatus !== "approved" || !review.publishConsent) return null;
  return review.displayCompanyName ? review.companyName : null;
}

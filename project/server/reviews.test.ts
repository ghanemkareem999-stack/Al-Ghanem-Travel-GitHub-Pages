import { describe, expect, it } from "vitest";
import { customerReviewInput, formatReviewForOwner, reviewModerationInput } from "./reviews";
import { publicCompanyIdentity } from "./reviewPublishing";

const genuineReview = {
  companyName: "North Star Travel",
  email: "amina@example.com",
  phone: "+966501234567",
  rating: 5,
  reviewBody: "Our group accommodation coordination was clear, respectful, and well managed from the first request to arrival.",
  locale: "en" as const,
  experienceConfirmed: true as const,
  publishConsent: true as const,
  displayCompanyName: false,
};

describe("customer review moderation contract", () => {
  it("requires a genuine-experience confirmation, publishing permission, and a substantive review", () => {
    expect(customerReviewInput.parse(genuineReview)).toMatchObject({ rating: 5, displayCompanyName: false });
    expect(() => customerReviewInput.parse({ ...genuineReview, experienceConfirmed: false })).toThrow();
    expect(() => customerReviewInput.parse({ ...genuineReview, publishConsent: false })).toThrow();
    expect(() => customerReviewInput.parse({ ...genuineReview, reviewBody: "Excellent" })).toThrow();
  });

  it("includes private verification fields in the owner moderation alert", () => {
    const content = formatReviewForOwner(genuineReview);
    expect(content).toContain("Company: North Star Travel");
    expect(content).toContain("Display company name: No");
    expect(content).toContain("Rating: 5/5");
    expect(content).not.toContain("Contact:");
    expect(content).not.toContain("Service:");
  });

  it("publishes identity only for an approved, consented review that permits company display", () => {
    const base = { moderationStatus: "approved" as const, publishConsent: true, displayCompanyName: false, companyName: "North Star Travel" };
    expect(publicCompanyIdentity(base)).toBeNull();
    expect(publicCompanyIdentity({ ...base, displayCompanyName: true })).toBe("North Star Travel");
    expect(publicCompanyIdentity({ ...base, moderationStatus: "pending" })).toBeNull();
    expect(publicCompanyIdentity({ ...base, publishConsent: false })).toBeNull();
  });

  it("permits only an explicit approve or reject moderation transition", () => {
    expect(reviewModerationInput.parse({ reviewId: 1, moderationStatus: "approved" }).moderationStatus).toBe("approved");
    expect(reviewModerationInput.parse({ reviewId: 1, moderationStatus: "rejected", moderationNote: "Unable to verify the experience." }).moderationStatus).toBe("rejected");
    expect(() => reviewModerationInput.parse({ reviewId: 1, moderationStatus: "pending" })).toThrow();
  });

  it("rejects a populated hidden website field used by automated form submissions", () => {
    expect(() => customerReviewInput.parse({
      companyName: "North Star Travel", email: "amina@example.com", rating: 5,
      reviewBody: "Clear, attentive support for our completed corporate accommodation programme.", locale: "en",
      experienceConfirmed: true, publishConsent: true, displayCompanyName: false, website: "https://spam.example",
    })).toThrow();
  });
});

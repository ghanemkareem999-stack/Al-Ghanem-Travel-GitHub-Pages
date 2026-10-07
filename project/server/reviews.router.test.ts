import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

type StoredReview = {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  serviceType: string | null;
  rating: number;
  reviewBody: string;
  locale: string;
  publishConsent: boolean;
  displayCompanyName: boolean;
  moderationStatus: "pending" | "approved" | "rejected";
  moderationNote: string | null;
  reviewedByUserId: number | null;
  reviewedAt: Date | null;
  createdAt: Date;
};

const state = vi.hoisted(() => ({ reviews: [] as StoredReview[] }));

vi.mock("./db", () => ({
  createCorporateInquiry: vi.fn(),
  importVerifiedPartnerHotel: vi.fn(),
  listRecentCorporateInquiries: vi.fn(),
  updateInquiryNotificationStatus: vi.fn(),
  createCustomerReview: vi.fn(),
  updateReviewNotificationStatus: vi.fn(),
  listPendingCustomerReviews: vi.fn(async () => state.reviews.filter(review => review.moderationStatus === "pending")),
  moderateCustomerReview: vi.fn(async (id: number, update: Partial<StoredReview>) => {
    const review = state.reviews.find(candidate => candidate.id === id);
    if (review) Object.assign(review, update);
  }),
  listApprovedCustomerReviews: vi.fn(async () => state.reviews
    .filter(review => review.moderationStatus === "approved" && review.publishConsent)
    .map(review => ({
      id: review.id,
      companyName: review.displayCompanyName ? review.companyName : null,
      reviewBody: review.reviewBody,
      rating: review.rating,
      locale: review.locale,
      serviceType: review.serviceType,
      displayCompanyName: review.displayCompanyName,
      createdAt: review.createdAt,
    }))),
}));

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn(async () => true) }));
vi.mock("./inquiryEmail", () => ({ sendCorporateInquiryEmail: vi.fn(async () => "deferred") }));

import { appRouter } from "./routers";

function adminContext(): TrpcContext {
  return {
    user: { id: 7, openId: "review-admin", name: "Review Admin", email: "admin@example.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
  } as TrpcContext;
}

describe("review router moderation workflow", () => {
  beforeEach(() => {
    state.reviews = [
      { id: 1, companyName: "North Star Travel", contactName: "Amina", email: "amina@example.com", phone: "+966501234567", serviceType: "Group accommodation", rating: 5, reviewBody: "Clear accommodation support from enquiry through arrival.", locale: "en", publishConsent: true, displayCompanyName: false, moderationStatus: "pending", moderationNote: null, reviewedByUserId: null, reviewedAt: null, createdAt: new Date("2026-08-17") },
      { id: 2, companyName: "Atlas Travel", contactName: "Omar", email: "omar@example.com", phone: null, serviceType: "Long stay", rating: 4, reviewBody: "Professional coordination for our group stay in Madinah.", locale: "ar", publishConsent: true, displayCompanyName: true, moderationStatus: "pending", moderationNote: null, reviewedByUserId: null, reviewedAt: null, createdAt: new Date("2026-08-18") },
    ];
  });

  it("moves a pending review to approved and publishes only the permitted fields", async () => {
    const admin = appRouter.createCaller(adminContext());
    expect(await admin.reviews.pending()).toHaveLength(2);

    await admin.reviews.moderate({ reviewId: 1, moderationStatus: "approved", moderationNote: "Verified with the corporate contact." });

    const publicReviews = await appRouter.createCaller({ user: null } as TrpcContext).reviews.approved();
    expect(publicReviews).toHaveLength(1);
    expect(publicReviews[0]).toMatchObject({ id: 1, companyName: null, rating: 5 });
    expect(publicReviews[0]).not.toHaveProperty("email");
    expect(publicReviews[0]).not.toHaveProperty("phone");
    expect(state.reviews[0]).toMatchObject({ moderationStatus: "approved", reviewedByUserId: 7 });
  });

  it("moves a pending review to rejected and keeps it out of public approved feedback", async () => {
    const admin = appRouter.createCaller(adminContext());
    await admin.reviews.moderate({ reviewId: 2, moderationStatus: "rejected", moderationNote: "Submitter requested withdrawal." });

    expect(await admin.reviews.pending()).toHaveLength(1);
    expect(await appRouter.createCaller({ user: null } as TrpcContext).reviews.approved()).toEqual([]);
    expect(state.reviews[1]).toMatchObject({ moderationStatus: "rejected", reviewedByUserId: 7 });
  });
});

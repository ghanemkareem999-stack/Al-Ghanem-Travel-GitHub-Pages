import { COOKIE_NAME } from "@shared/const";
import {
  createCorporateInquiry,
  createCustomerReview,
  importVerifiedPartnerHotel,
  listAdminHotelContent,
  listPublishedHotelContent,
  listApprovedCustomerReviews,
  listPendingCustomerReviews,
  listRecentCorporateInquiries,
  moderateCustomerReview,
  updateReviewNotificationStatus,
  updateInquiryNotificationStatus,
  saveAdminHotelContent,
  getAdminHotelContent,
  removeAdminHotelContent,
  removeAdminHotelImage,
  uploadAuthorizedHotelImage,
  getPublicSiteSettings,
  savePublicSiteSettings,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { sendCorporateInquiryEmail } from "./inquiryEmail";
import { corporateInquiryInput, formatInquiryForOwner } from "./inquiries";
import { partnerHotelImportSchema } from "./partnerHotelImport";
import { hotelAuthorizedImageInput, hotelContentDraftInput, hotelContentRemoveInput, hotelGalleryRemoveInput } from "./hotelContentAdmin";
import { publicSiteSettingsInput } from "./siteSettings";
import { customerReviewInput, formatReviewForOwner, reviewModerationInput } from "./reviews";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  inquiries: router({
    create: publicProcedure.input(corporateInquiryInput).mutation(async ({ input }) => {
      const { website: _honeypot, ...inquiryInput } = input;
      const normalizedInquiry = {
        ...inquiryInput,
        companyName: inquiryInput.companyName || inquiryInput.contactName,
        email: inquiryInput.email || "Not provided",
        country: inquiryInput.country || "Not provided",
        roomCount: inquiryInput.roomCount ?? 1,
        guestCount: inquiryInput.guestCount ?? 1,
      };
      const inquiryId = await createCorporateInquiry({
        ...normalizedInquiry,
        preferredHotels: normalizedInquiry.preferredHotels || null,
        checkIn: normalizedInquiry.checkIn || null,
        checkOut: normalizedInquiry.checkOut || null,
        stayDuration: normalizedInquiry.stayDuration || null,
        notes: normalizedInquiry.notes || null,
      });
      const content = formatInquiryForOwner(normalizedInquiry);
      const ownerNotified = await notifyOwner({
        title: `New B2B inquiry — ${input.companyName}`,
        content,
      }).catch(() => false);
      const emailStatus = await sendCorporateInquiryEmail(inquiryId, input, content);
      await updateInquiryNotificationStatus(inquiryId, {
        ownerNotifiedAt: ownerNotified ? new Date() : null,
        emailStatus,
      });
      return { inquiryId, ownerNotified, emailStatus };
    }),
    recent: adminProcedure.query(async () => listRecentCorporateInquiries()),
  }),
  reviews: router({
    submit: publicProcedure.input(customerReviewInput).mutation(async ({ input }) => {
      const reviewId = await createCustomerReview({
        companyName: input.companyName,
        contactName: null,
        email: input.email,
        phone: input.phone || null,
        serviceType: null,
        rating: input.rating,
        reviewBody: input.reviewBody,
        locale: input.locale,
        experienceConfirmed: input.experienceConfirmed,
        publishConsent: input.publishConsent,
        displayCompanyName: input.displayCompanyName,
      });
      const ownerNotified = await notifyOwner({
        title: `Customer review awaiting moderation — ${input.companyName}`,
        content: formatReviewForOwner(input),
      }).catch(() => false);
      await updateReviewNotificationStatus(reviewId, ownerNotified ? new Date() : null);
      return { reviewId, moderationStatus: "pending" as const, ownerNotified };
    }),
    approved: publicProcedure.query(async () => listApprovedCustomerReviews()),
    pending: adminProcedure.query(async () => listPendingCustomerReviews()),
    moderate: adminProcedure.input(reviewModerationInput).mutation(async ({ ctx, input }) => {
      await moderateCustomerReview(input.reviewId, {
        moderationStatus: input.moderationStatus,
        moderationNote: input.moderationNote || null,
        reviewedByUserId: ctx.user.id,
        reviewedAt: new Date(),
      });
      return { success: true } as const;
    }),
  }),
  catalogue: router({
    importVerifiedPartnerHotel: adminProcedure.input(partnerHotelImportSchema).mutation(async ({ input }) => {
      return importVerifiedPartnerHotel(input);
    }),
    list: adminProcedure.query(async () => listAdminHotelContent()),
    get: adminProcedure.input(hotelContentRemoveInput.pick({ hotelId: true })).query(async ({ input }) => getAdminHotelContent(input.hotelId)),
    published: publicProcedure.query(async () => listPublishedHotelContent()),
    saveDraft: adminProcedure.input(hotelContentDraftInput).mutation(async ({ ctx, input }) => saveAdminHotelContent(input, ctx.user.id)),
    uploadAuthorizedImage: adminProcedure.input(hotelAuthorizedImageInput).mutation(async ({ ctx, input }) => uploadAuthorizedHotelImage(input, ctx.user.id)),
    removeImage: adminProcedure.input(hotelGalleryRemoveInput).mutation(async ({ input }) => removeAdminHotelImage(input.imageId)),
    remove: adminProcedure.input(hotelContentRemoveInput).mutation(async ({ input }) => removeAdminHotelContent(input)),
  }),
  siteSettings: router({
    get: publicProcedure.query(async () => getPublicSiteSettings()),
    save: adminProcedure.input(publicSiteSettingsInput).mutation(async ({ ctx, input }) => savePublicSiteSettings(input, ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;

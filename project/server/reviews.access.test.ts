import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

describe("customer review moderation access", () => {
  const caller = appRouter.createCaller({ user: null } as TrpcContext);

  it("does not expose the pending moderation queue to public visitors", async () => {
    await expect(caller.reviews.pending()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not let a public visitor approve or reject a review", async () => {
    await expect(caller.reviews.moderate({ reviewId: 1, moderationStatus: "approved" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("catalogue administration", () => {
  it("rejects hotel-content management access for non-administrators", async () => {
    const ctx = { user: { id: 7, openId: "member", email: "member@example.com", name: "Member", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } } as unknown as TrpcContext;
    await expect(appRouter.createCaller(ctx).catalogue.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(ctx).catalogue.get({ hotelId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(appRouter.createCaller(ctx).catalogue.remove({ hotelId: 1, confirmationSlug: "example-madinah" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

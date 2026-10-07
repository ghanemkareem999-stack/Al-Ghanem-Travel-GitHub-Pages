import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

describe("corporate inquiry access", () => {
  it("rejects a public visitor before any B2B inquiry record can be listed", async () => {
    const caller = appRouter.createCaller({ user: null } as TrpcContext);

    await expect(caller.inquiries.recent()).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });
});

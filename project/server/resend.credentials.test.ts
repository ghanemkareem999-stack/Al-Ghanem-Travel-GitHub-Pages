import { describe, expect, it } from "vitest";

describe("Resend credential", () => {
  const senderConfigured = Boolean(process.env.RESEND_FROM_EMAIL);
  const validate = senderConfigured ? it : it.skip;

  validate("authenticates against the Resend domains endpoint once a verified sender is configured", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey).toMatch(/^re_/);

    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "Al-Ghanem-Travel/1.0 credential-check",
      },
    });

    expect(response.ok).toBe(true);
  }, 15_000);
});

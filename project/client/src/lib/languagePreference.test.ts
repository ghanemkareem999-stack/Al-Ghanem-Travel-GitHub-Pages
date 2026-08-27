import { describe, expect, it } from "vitest";
import { languageChoicePath, shouldPromptForLanguage } from "./languagePreference";

describe("first-visit language preference", () => {
  it("prompts only on the unprefixed home route when no choice is stored", () => {
    expect(shouldPromptForLanguage("/", false)).toBe(true);
    expect(shouldPromptForLanguage("/", true)).toBe(false);
    expect(shouldPromptForLanguage("/ar", false)).toBe(false);
    expect(shouldPromptForLanguage("/en/hotels", false)).toBe(false);
  });

  it("creates a locale-prefixed route while preserving a direct path", () => {
    expect(languageChoicePath("ar", "/")).toBe("/ar");
    expect(languageChoicePath("id", "/en/hotels?zone=central")).toBe("/id/hotels?zone=central");
  });
});

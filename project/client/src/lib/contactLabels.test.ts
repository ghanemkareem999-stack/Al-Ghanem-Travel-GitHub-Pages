import { describe, expect, it } from "vitest";
import { infoCopy } from "./infoCopy";
import { inquiryCopy } from "./inquiryCopy";
import { locales } from "./i18n";

describe("secondary WhatsApp labels", () => {
  it("uses a concise country-neutral WhatsApp label in every supported language", () => {
    const prohibited = /Egypt|مصر|Mesir/;
    locales.forEach(locale => {
      expect(inquiryCopy[locale].whatsapp2).not.toMatch(prohibited);
      expect(infoCopy[locale].contact.sections[1]?.body).not.toMatch(prohibited);
    });
    expect(inquiryCopy.ar.whatsapp2).toBe("واتساب");
    expect(inquiryCopy.en.whatsapp2).toBe("WhatsApp");
    expect(inquiryCopy.en.whatsapp2).not.toMatch(/Additional|additional/);
  });
});

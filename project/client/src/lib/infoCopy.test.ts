import { describe, expect, it } from "vitest";
import { locales } from "./i18n";
import { infoCopy } from "./infoCopy";

describe("public company messaging", () => {
  it("keeps the experience section free of licensing and certification claims", () => {
    const prohibited = /licensed|licensing|licence|license|certif|approval|ترخيص|مرخّص|اعتماد|لائسنس|berlesen|perizinan|lisensi|लाइसेंस/i;
    locales.forEach(locale => {
      const publicAboutText = infoCopy[locale].about.sections.map(section => `${section.heading} ${section.body}`).join(" ");
      expect(publicAboutText).not.toMatch(prohibited);
    });
  });
});

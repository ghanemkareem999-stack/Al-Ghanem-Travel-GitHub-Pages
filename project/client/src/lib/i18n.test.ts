import { describe, expect, it } from "vitest";
import { localeMeta, locales, translations } from "./i18n";

describe("Al Ghanem Travel internationalization", () => {
  it("ships all six requested locales with complete primary navigation copy", () => {
    expect(locales).toEqual(["en", "ar", "ms", "ur", "id", "hi"]);
    locales.forEach(locale => {
      expect(translations[locale].nav.home).toBeTruthy();
      expect(translations[locale].hero.title).toBeTruthy();
      expect(translations[locale].cta.action).toBeTruthy();
      expect(translations[locale].city.madinahDetail).toBeTruthy();
      expect(translations[locale].city.makkahDetail).toBeTruthy();
    });
  });

  it("uses RTL only for Arabic and Urdu", () => {
    expect(localeMeta.ar.dir).toBe("rtl");
    expect(localeMeta.ur.dir).toBe("rtl");
    expect(localeMeta.en.dir).toBe("ltr");
    expect(localeMeta.ms.dir).toBe("ltr");
    expect(localeMeta.id.dir).toBe("ltr");
    expect(localeMeta.hi.dir).toBe("ltr");
  });

  it("keeps the footer ownership statement without a hard-coded calendar year in every locale", () => {
    locales.forEach(locale => {
      expect(translations[locale].footer.rights).toContain("©");
      expect(translations[locale].footer.rights).not.toMatch(/\b20\d{2}\b/);
    });
  });
});

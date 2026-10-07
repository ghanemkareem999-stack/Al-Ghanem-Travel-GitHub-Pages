import { describe, expect, it } from "vitest";
import { translations } from "./i18n";
import { portfolioLabels } from "./portfolio";
import { seoCopy } from "./seoCopy";

describe("official brand-name consistency", () => {
  it("uses the confirmed Arabic brand name and excludes the incorrect Arabic and Urdu variants", () => {
    const publicArabicText = [
      translations.ar.footer.rights,
      portfolioLabels.ar.body,
      portfolioLabels.ar.galleryNote,
      seoCopy.ar.home.title,
      seoCopy.ar.portfolio.title,
      seoCopy.ar.portfolio.description,
      seoCopy.ar.inquiry.title,
      seoCopy.ur.home.title,
      seoCopy.ur.portfolio.title,
      seoCopy.ur.portfolio.description,
      seoCopy.ur.inquiry.title,
    ].join(" ");

    expect(publicArabicText).toContain("الغانم ترافل");
    expect(publicArabicText).not.toMatch(/الغنيم|الغنیم/);
    expect(seoCopy.ur.home.title).toContain("Al Ghanem Travel");
    expect(JSON.stringify(translations)).not.toMatch(/الغنيم|الغنیم/);
  });

  it("keeps public hotel-directory copy professional and free from internal source-review or licensing language", () => {
    const publicDirectoryCopy = Object.values(portfolioLabels).flatMap(labels => [
      labels.body,
      labels.verified,
      labels.pending,
      labels.coming,
      labels.gallery,
      labels.galleryFilter,
      labels.galleryNote,
    ]).join(" ");

    expect(publicDirectoryCopy).not.toMatch(/source review|official-source|partner-authorized|licensed|مراجعة المصدر|ملف بمصدر رسمي|ترخيص|توضيحية/i);
    expect(portfolioLabels.ar.body).toContain("الغانم ترافل");
    expect(portfolioLabels.ar.gallery).toBe("معرض صور الفندق");
  });
});

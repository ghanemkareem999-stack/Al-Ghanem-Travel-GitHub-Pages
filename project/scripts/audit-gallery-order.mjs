import { writeFileSync } from "node:fs";
import { hotelProfiles } from "../client/src/lib/portfolio.ts";

const exteriorFirst = /exterior|facade|entrance|front|sign|tower|building|street|view/i;
const interiorFirst = /room|bedroom|guest|lobby|reception|lounge|corridor|interior|atrium|restaurant|dining|bathroom/i;
const findings = hotelProfiles.map(profile => {
  const first = profile.gallery[0] ?? "";
  return {
    slug: profile.slug,
    name: profile.name,
    galleryCount: profile.gallery.length,
    firstImage: first,
    firstLooksExterior: exteriorFirst.test(first),
    firstLooksInterior: interiorFirst.test(first),
  };
}).filter(item => item.galleryCount > 0 && !item.firstLooksExterior);

const report = {
  generatedAt: new Date().toISOString(),
  totalProfiles: hotelProfiles.length,
  profilesWithGallery: hotelProfiles.filter(profile => profile.gallery.length > 0).length,
  profilesNeedingManualReview: findings.length,
  findings,
};
writeFileSync("/home/ubuntu/al-ghanem-travel/docs/generated/gallery-order-audit-2026-08-27.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));

import { hotelProfiles } from "../client/src/lib/portfolio";

const inventory = hotelProfiles.map(hotel => ({
  slug: hotel.slug,
  publicName: hotel.name,
  arabicName: hotel.arabicName ?? null,
  status: hotel.status,
  sourceUrl: hotel.sourceUrl ?? null,
  mapAddress: hotel.mapAddress ?? null,
  galleryCount: hotel.gallery.length,
  gallery: hotel.gallery,
}));

process.stdout.write(`${JSON.stringify(inventory, null, 2)}\n`);

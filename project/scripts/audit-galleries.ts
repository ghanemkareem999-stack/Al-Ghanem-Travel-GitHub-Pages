import { hotelProfiles } from "../client/src/lib/portfolio";

for (const hotel of hotelProfiles
  .filter(hotel => hotel.gallery.length < 3)
  .sort((left, right) => left.gallery.length - right.gallery.length || left.name.localeCompare(right.name))) {
  console.log(`${hotel.slug}\t${hotel.gallery.length}\t${hotel.name}`);
}

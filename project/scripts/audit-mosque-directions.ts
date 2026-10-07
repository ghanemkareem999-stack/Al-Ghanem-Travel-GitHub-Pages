import { makeRequest, type PlacesSearchResult } from "../server/_core/map";

type Candidate = { slug: string; query: string };
type Point = { lat: number; lng: number };

const mosqueQuery = "Al-Masjid an-Nabawi, Madinah, Saudi Arabia";
const hotels: Candidate[] = [
  { slug: "dar-al-taqwa-madinah", query: "Dar Al Taqwa Hotel Madinah, Saudi Arabia" },
  { slug: "pullman-zamzam-madinah", query: "Pullman Zamzam Madinah, Saudi Arabia" },
  { slug: "dar-al-iman-intercontinental", query: "InterContinental Dar Al Iman Madinah, Saudi Arabia" },
  { slug: "anwar-al-madinah-movenpick", query: "Anwar Al Madinah Movenpick, Saudi Arabia" },
  { slug: "hilton-madinah", query: "Madinah Hilton, Saudi Arabia" },
  { slug: "dallah-taibah", query: "Dallah Taibah Hotel Madinah, Saudi Arabia" },
  { slug: "millennium-madinah", query: "Millennium Al Aqeeq Hotel Madinah, Saudi Arabia" },
  { slug: "biltmore-al-madinah", query: "The Biltmore Al Madinah Hotel, Saudi Arabia" },
  { slug: "new-madinah-hotel", query: "New Madinah Hotel, Saudi Arabia" },
  { slug: "saja-by-warwick-madinah", query: "Saja Al Madinah Hotel, Saudi Arabia" },
  { slug: "golden-tulip-al-zahabi", query: "Golden Tulip Al Zahabi Madinah, Saudi Arabia" },
  { slug: "radisson-hotel-madinah", query: "Radisson Hotel Madinah, Saudi Arabia" },
  { slug: "crowne-plaza-madinah", query: "Crowne Plaza Madinah, Saudi Arabia" },
  { slug: "doubletree-by-hilton-madinah-gate", query: "DoubleTree by Hilton Madinah Gate, Saudi Arabia" },
  { slug: "al-mokhtara-international", query: "Al Mukhtara International Hotel Madinah, Saudi Arabia" },
  { slug: "al-ritz-al-madinah", query: "Al Ritz Al Madinah Hotel, Saudi Arabia" },
  { slug: "al-waqf-serviced-apartments", query: "Waqf Othman Bin Affan Hotel Madinah, Saudi Arabia" },
  { slug: "al-aqiq-madinah", query: "Al Aqeeq Hotel Madinah, Saudi Arabia" },
  { slug: "le-meridien-madinah", query: "Le Meridien Medina, Saudi Arabia" },
  { slug: "eman-royal", query: "Eman Royal Hotel Madinah, Saudi Arabia" },
  { slug: "ramada-madinah-al-qibla", query: "Ramada Al Hamra Madinah, Saudi Arabia" },
  { slug: "al-nokhba-madinah", query: "Royal Inn Hotel Madinah, Saudi Arabia" },
  { slug: "rawdah-al-aqiq", query: "Rawdah Al Aqeeq Hotel Madinah, Saudi Arabia" },
];

function metresBetween(point: Point, origin: Point) {
  return {
    northSouth: Math.round((point.lat - origin.lat) * 111_320),
    eastWest: Math.round((point.lng - origin.lng) * 101_400),
  };
}

function sector(point: Point, origin: Point) {
  const { northSouth, eastWest } = metresBetween(point, origin);
  const north = northSouth >= 0;
  const east = eastWest >= 0;
  const major = Math.abs(northSouth) > Math.abs(eastWest) * 1.35
    ? (north ? "north" : "south")
    : Math.abs(eastWest) > Math.abs(northSouth) * 1.35
      ? (east ? "east" : "west")
      : `${north ? "north" : "south"}-${east ? "east" : "west"}`;
  return { major, northSouth, eastWest };
}

async function search(query: string) {
  const result = await makeRequest<PlacesSearchResult>("/maps/api/place/textsearch/json", { query });
  if (result.status !== "OK" || !result.results[0]) throw new Error(`${query}: ${result.status}`);
  return result.results[0];
}

async function main() {
  const mosque = await search(mosqueQuery);
  const origin = mosque.geometry.location;
  const rows: Array<Record<string, unknown>> = [];

  for (const hotel of hotels) {
    try {
      const result = await search(hotel.query);
      rows.push({
        slug: hotel.slug,
        matchedName: result.name,
        formattedAddress: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        ...sector(result.geometry.location, origin),
      });
    } catch (error) {
      rows.push({ slug: hotel.slug, error: error instanceof Error ? error.message : String(error) });
    }
  }

  console.log(JSON.stringify({ reference: { name: mosque.name, address: mosque.formatted_address, ...origin }, rows }, null, 2));
}

void main();

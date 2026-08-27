import { makeRequest, type PlacesSearchResult } from "../server/_core/map";
import { madinahPlanningHotels } from "../shared/madinahPlanning";

type Point = { lat: number; lng: number };

function offset(point: Point, origin: Point) {
  const northSouth = Math.round((point.lat - origin.lat) * 111_320);
  const eastWest = Math.round((point.lng - origin.lng) * 101_400);
  const direction = Math.abs(northSouth) > Math.abs(eastWest) * 1.35
    ? (northSouth >= 0 ? "north" : "south")
    : Math.abs(eastWest) > Math.abs(northSouth) * 1.35
      ? (eastWest >= 0 ? "east" : "west")
      : `${northSouth >= 0 ? "north" : "south"}-${eastWest >= 0 ? "east" : "west"}`;
  return { direction, northSouth, eastWest };
}

async function textSearch(query: string) {
  const response = await makeRequest<PlacesSearchResult>("/maps/api/place/textsearch/json", { query });
  if (response.status !== "OK" || !response.results[0]) throw new Error(response.status);
  return response.results[0];
}

async function main() {
  const mosque = await textSearch("Al-Masjid an-Nabawi, Madinah, Saudi Arabia");
  const rows = [];

  for (const hotel of madinahPlanningHotels) {
    try {
      const match = await textSearch(`${hotel.name} hotel, Madinah, Saudi Arabia`);
      rows.push({
        slug: hotel.slug,
        requestedName: hotel.name,
        currentZone: hotel.zone,
        matchedName: match.name,
        formattedAddress: match.formatted_address,
        lat: match.geometry.location.lat,
        lng: match.geometry.location.lng,
        ...offset(match.geometry.location, mosque.geometry.location),
      });
    } catch (error) {
      rows.push({ slug: hotel.slug, requestedName: hotel.name, currentZone: hotel.zone, error: error instanceof Error ? error.message : String(error) });
    }
  }

  console.log(JSON.stringify({ reference: mosque.geometry.location, rows }, null, 2));
}

void main();

import { prisma } from "./db";
import { getGeoProvider, type LatLng, type TransportMode, type GeoProvider } from "./geo";

const COMMUTE_MODES: TransportMode[] = ["walking", "cycling", "driving", "transit"];
const TRANSIT_AMENITY_NAMES = ["Bus Stop", "LUAS Stop", "DART Station"];

export async function refreshNeighbourhood(houseId: string, injectedGeo?: GeoProvider) {
  const house = await prisma.house.findUnique({ where: { id: houseId } });
  if (!house) throw new Error("House not found");

  const geo = injectedGeo ?? getGeoProvider();
  // Use stored coordinates if available (from Daft API), otherwise geocode
  const houseLoc = (house.lat && house.lng)
    ? { lat: house.lat, lng: house.lng }
    : await geo.geocode(house.address);

  // --- Amenities (walking only, with walkability threshold) ---
  const amenities = await prisma.preferredAmenity.findMany({ where: { enabled: true } });
  await prisma.nearbyAmenity.deleteMany({ where: { houseId } });

  for (const am of amenities) {
    try {
      const query = process.env.GEO_PROVIDER === "google" && am.googleType ? am.googleType : am.osmTag;
      const places = await geo.nearbySearch(houseLoc, query, 2000);
      if (places.length === 0) continue;
      const closest = places.sort((a, b) => dist(houseLoc, a) - dist(houseLoc, b))[0];
      const walk = await geo.route(houseLoc, closest, "walking");
      await prisma.nearbyAmenity.create({
        data: { houseId, amenityId: am.id, name: closest.name, distanceMetres: walk.distanceMetres, walkingMinutes: walk.durationMinutes, lat: closest.lat, lng: closest.lng, address: closest.address },
      });
    } catch { /* skip */ }
    if (process.env.GEO_PROVIDER !== "google") await sleep(1100);
  }

  // --- Commute (all 4 modes per workplace) ---
  const profile = await prisma.buyerProfile.findFirst();
  await prisma.commuteEstimate.deleteMany({ where: { houseId } });
  const workplaces = [
    { label: profile?.name1, address: profile?.workplaceAddress1 },
    { label: profile?.name2, address: profile?.workplaceAddress2 },
  ].filter(w => w.address);

  for (const wp of workplaces) {
    try {
      const workLoc = await geo.geocode(wp.address!);
      for (const mode of COMMUTE_MODES) {
        const r = await geo.route(houseLoc, workLoc, mode);
        await prisma.commuteEstimate.create({
          data: { houseId, workplaceLabel: `${wp.label}'s workplace`, workplaceAddress: wp.address!, mode, distanceMetres: r.distanceMetres, durationMinutes: r.durationMinutes, routeSummary: r.summary },
        });
        if (process.env.GEO_PROVIDER !== "google") await sleep(1100);
      }
    } catch { /* skip */ }
  }

  return prisma.house.findUnique({
    where: { id: houseId },
    include: { nearbyAmenities: { include: { amenity: true } }, commuteEstimates: true },
  });
}

/** Check if any transit stop is walkable for a house */
export async function getTransitAccessibility(houseId: string) {
  const amenities = await prisma.nearbyAmenity.findMany({
    where: { houseId },
    include: { amenity: true },
  });
  const transitAmenities = amenities.filter(a => TRANSIT_AMENITY_NAMES.includes(a.amenity.name));
  const walkable = transitAmenities.filter(a => a.distanceMetres <= a.amenity.maxWalkingMetres);
  if (walkable.length > 0) return { hasWalkableTransit: true, nearest: walkable[0] };
  const nearest = transitAmenities.sort((a, b) => a.distanceMetres - b.distanceMetres)[0];
  return { hasWalkableTransit: false, nearest: nearest || null, warning: nearest ? `Nearest transit: ${nearest.amenity.icon} ${nearest.name} at ${nearest.distanceMetres}m (not walkable)` : "No public transit found nearby" };
}

function dist(a: LatLng, b: { lat: number; lng: number }) {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
}
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

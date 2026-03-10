import { prisma } from "./db";
import { getGeoProvider, type LatLng } from "./geo";

export async function refreshNeighbourhood(houseId: string) {
  const house = await prisma.house.findUnique({ where: { id: houseId } });
  if (!house) throw new Error("House not found");

  const geo = getGeoProvider();
  const houseLoc = await geo.geocode(house.address);

  // Refresh amenities
  const amenities = await prisma.preferredAmenity.findMany({ where: { enabled: true } });
  await prisma.nearbyAmenity.deleteMany({ where: { houseId } });

  for (const am of amenities) {
    try {
      const useGoogle = process.env.GEO_PROVIDER === "google" && am.googleType;
      const query = useGoogle ? am.googleType! : am.osmTag;
      const places = await geo.nearbySearch(houseLoc, query, 2000);
      if (places.length === 0) continue;
      const closest = places.sort((a, b) => dist(houseLoc, a) - dist(houseLoc, b))[0];
      const route = await geo.walkingRoute(houseLoc, closest);
      await prisma.nearbyAmenity.create({
        data: { houseId, amenityId: am.id, name: closest.name, distanceMetres: route.distanceMetres, walkingMinutes: route.durationMinutes, lat: closest.lat, lng: closest.lng, address: closest.address },
      });
    } catch { /* skip failed lookups */ }
    // Rate limit for OSM
    if (process.env.GEO_PROVIDER !== "google") await sleep(1100);
  }

  // Refresh commute
  const profile = await prisma.buyerProfile.findFirst();
  await prisma.commuteEstimate.deleteMany({ where: { houseId } });
  if (profile?.workplaceAddress) {
    try {
      const workLoc = await geo.geocode(profile.workplaceAddress);
      const walk = await geo.walkingRoute(houseLoc, workLoc);
      await prisma.commuteEstimate.create({
        data: { houseId, workplaceLabel: `${profile.name1}'s workplace`, workplaceAddress: profile.workplaceAddress, mode: "walking", distanceMetres: walk.distanceMetres, durationMinutes: walk.durationMinutes },
      });
    } catch { /* skip */ }
  }

  return prisma.house.findUnique({
    where: { id: houseId },
    include: { nearbyAmenities: { include: { amenity: true } }, commuteEstimates: true },
  });
}

function dist(a: LatLng, b: { lat: number; lng: number }) {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2);
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

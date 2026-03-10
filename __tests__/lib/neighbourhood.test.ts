/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { getTransitAccessibility } from "@/lib/neighbourhood";

describe("getTransitAccessibility", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns hasWalkableTransit=true when bus stop within threshold", async () => {
    (prisma.nearbyAmenity.findMany as jest.Mock).mockResolvedValue([
      { id: "a1", distanceMetres: 500, name: "Bus Stop Main St", amenity: { name: "Bus Stop", maxWalkingMetres: 1000, icon: "🚌" } },
    ]);
    const r = await getTransitAccessibility("h1");
    expect(r.hasWalkableTransit).toBe(true);
  });

  it("returns hasWalkableTransit=false when all transit beyond threshold", async () => {
    (prisma.nearbyAmenity.findMany as jest.Mock).mockResolvedValue([
      { id: "a1", distanceMetres: 1400, name: "Bus Stop Far", amenity: { name: "Bus Stop", maxWalkingMetres: 1000, icon: "🚌" } },
    ]);
    const r = await getTransitAccessibility("h1");
    expect(r.hasWalkableTransit).toBe(false);
    expect(r.warning).toContain("not walkable");
  });

  it("returns warning when no transit found at all", async () => {
    (prisma.nearbyAmenity.findMany as jest.Mock).mockResolvedValue([
      { id: "a1", distanceMetres: 300, name: "Tesco", amenity: { name: "Tesco", maxWalkingMetres: 1000, icon: "🛒" } },
    ]);
    const r = await getTransitAccessibility("h1");
    expect(r.hasWalkableTransit).toBe(false);
    expect(r.warning).toContain("No public transit");
  });

  it("LUAS counts as transit", async () => {
    (prisma.nearbyAmenity.findMany as jest.Mock).mockResolvedValue([
      { id: "a1", distanceMetres: 800, name: "LUAS Broadstone", amenity: { name: "LUAS Stop", maxWalkingMetres: 1000, icon: "🚊" } },
    ]);
    const r = await getTransitAccessibility("h1");
    expect(r.hasWalkableTransit).toBe(true);
  });

  it("DART counts as transit", async () => {
    (prisma.nearbyAmenity.findMany as jest.Mock).mockResolvedValue([
      { id: "a1", distanceMetres: 900, name: "DART Drumcondra", amenity: { name: "DART Station", maxWalkingMetres: 1000, icon: "🚆" } },
    ]);
    const r = await getTransitAccessibility("h1");
    expect(r.hasWalkableTransit).toBe(true);
  });
});

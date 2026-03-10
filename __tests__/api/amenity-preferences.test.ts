/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/amenity-preferences/route";
import { NextRequest } from "next/server";
describe("Amenity Preferences API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns all amenities", async () => {
    (prisma.preferredAmenity.findMany as jest.Mock).mockResolvedValue([{ id: "a1", name: "Tesco" }]);
    const res = await GET();
    expect(await res.json()).toHaveLength(1);
  });
  it("POST creates custom amenity", async () => {
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ name: "CrossFit", osmTag: "leisure=fitness_centre", icon: "💪" }) });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

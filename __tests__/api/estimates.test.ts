/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/houses/[id]/estimates/route";
import { NextRequest } from "next/server";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => jest.clearAllMocks());

describe("GET /api/houses/[id]/estimates", () => {
  it("returns estimates for a house", async () => {
    (prisma.renovationEstimate.findMany as jest.Mock).mockResolvedValue([
      { id: "e1", item: "Kitchen", estimatedCostLow: 5000, estimatedCostHigh: 10000 },
    ]);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });
});

describe("POST /api/houses/[id]/estimates", () => {
  it("creates an estimate", async () => {
    const est = { id: "e1", item: "Kitchen", houseId: "h1" };
    (prisma.renovationEstimate.create as jest.Mock).mockResolvedValue(est);
    const req = new NextRequest("http://localhost", {
      method: "POST", body: JSON.stringify({ item: "Kitchen", estimatedCostLow: 5000 }),
    });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(201);
    expect(prisma.renovationEstimate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ item: "Kitchen", houseId: "h1" }),
    });
  });
});

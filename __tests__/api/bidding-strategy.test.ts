/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/houses/[id]/bidding-strategy/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Bidding Strategy API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns strategy", async () => {
    prisma.biddingStrategy.findUnique.mockResolvedValue({ id: "bs1", hardCeiling: 450000 });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect((await res.json()).hardCeiling).toBe(450000);
  });
  it("GET returns null when none", async () => {
    prisma.biddingStrategy.findUnique.mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(await res.json()).toBeNull();
  });
  it("PUT upserts strategy", async () => {
    prisma.biddingStrategy.upsert.mockResolvedValue({ id: "bs1", hardCeiling: 460000 });
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ hardCeiling: 460000 }) });
    await PUT(req, ctx("h1"));
    expect(prisma.biddingStrategy.upsert).toHaveBeenCalled();
  });
});

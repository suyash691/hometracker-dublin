/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/houses/[id]/seller-intel/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Seller Intel API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns intel", async () => {
    prisma.sellerIntel.findUnique.mockResolvedValue({ id: "s1", inChain: true });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect((await res.json()).inChain).toBe(true);
  });
  it("PUT upserts", async () => {
    prisma.sellerIntel.upsert.mockResolvedValue({ id: "s1" });
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ inChain: false }) });
    await PUT(req, ctx("h1"));
    expect(prisma.sellerIntel.upsert).toHaveBeenCalled();
  });
});

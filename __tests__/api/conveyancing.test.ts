/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/houses/[id]/conveyancing/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

// Mock status-triggers to avoid deep Prisma chains
jest.mock("@/lib/status-triggers", () => ({ handleSaleAgreed: jest.fn() }));

describe("Conveyancing API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("GET returns tracker with milestones", async () => {
    prisma.conveyancingTracker.findUnique.mockResolvedValue({ id: "c1", houseId: "h1", milestones: [{ step: "Solicitor appointed", stepOrder: 1, status: "pending" }] });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    const data = await res.json();
    expect(data.milestones).toHaveLength(1);
  });

  it("GET returns null when no tracker", async () => {
    prisma.conveyancingTracker.findUnique.mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(await res.json()).toBeNull();
  });

  it("PUT updates solicitor details", async () => {
    prisma.conveyancingTracker.update.mockResolvedValue({ id: "c1", solicitorName: "Mary" });
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ solicitorName: "Mary" }) });
    const res = await PUT(req, ctx("h1"));
    expect(prisma.conveyancingTracker.update).toHaveBeenCalledWith(expect.objectContaining({ where: { houseId: "h1" } }));
  });
});

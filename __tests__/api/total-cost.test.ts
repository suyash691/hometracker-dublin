/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/houses/[id]/total-cost/route";
import { NextRequest } from "next/server";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Total Cost API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("GET returns cost with computed totalUpfront", async () => {
    prisma.totalCostEstimate.findUnique.mockResolvedValue({
      id: "tc1", houseId: "h1", purchasePrice: 450000, deposit: 45000, stampDuty: 4500,
      legalFees: 2500, landRegistryFees: 700, surveyFee: 500, valuationFee: 185,
      mortgageProtection: 0, homeInsurance: 0, movingCosts: 800, otherCosts: 0,
    });
    const res = await GET(new NextRequest("http://localhost/api/houses/h1/total-cost"), ctx("h1"));
    const data = await res.json();
    expect(data.totalUpfront).toBe(45000 + 4500 + 2500 + 700 + 500 + 185);
    expect(data.cashNeededAtClosing).toBe(data.totalUpfront);
  });

  it("GET returns null when no estimate", async () => {
    prisma.totalCostEstimate.findUnique.mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/houses/h1/total-cost"), ctx("h1"));
    expect(await res.json()).toBeNull();
  });

  it("PUT auto-calculates stamp duty from price", async () => {
    prisma.house.findUnique.mockResolvedValue({ id: "h1", isNewBuild: false });
    prisma.totalCostEstimate.upsert.mockImplementation((args: Record<string, unknown>) => Promise.resolve(args.create));
    const req = new NextRequest("http://localhost/api/houses/h1/total-cost", {
      method: "PUT", body: JSON.stringify({ purchasePrice: 450000 }),
    });
    const res = await PUT(req, ctx("h1"));
    const data = await res.json();
    expect(data.stampDuty).toBe(4500);
    expect(data.deposit).toBe(45000);
  });

  it("PUT uses isNewBuild for stamp duty", async () => {
    prisma.house.findUnique.mockResolvedValue({ id: "h1", isNewBuild: true });
    prisma.totalCostEstimate.upsert.mockImplementation((args: Record<string, unknown>) => Promise.resolve(args.create));
    const req = new NextRequest("http://localhost/api/houses/h1/total-cost", {
      method: "PUT", body: JSON.stringify({ purchasePrice: 450000 }),
    });
    const res = await PUT(req, ctx("h1"));
    const data = await res.json();
    expect(data.stampDuty).toBe(Math.round(Math.round(450000 / 1.135) * 0.01));
  });
});

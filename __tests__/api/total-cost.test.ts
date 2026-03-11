/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/houses/[id]/total-cost/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Total Cost API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("GET returns cost with computed fields including renovation", async () => {
    (prisma.totalCostEstimate.findUnique as jest.Mock).mockResolvedValue({
      id: "tc1", houseId: "h1", purchasePrice: 450000, deposit: 45000, stampDuty: 4500,
      legalFees: 2500, landRegistryFees: 700, surveyFee: 500, valuationFee: 185,
      mortgageProtection: 600, homeInsurance: 450, movingCosts: 800, otherCosts: 0,
    });
    (prisma.renovationEstimate.findMany as jest.Mock).mockResolvedValue([
      { estimatedCostLow: 10000, estimatedCostHigh: 20000 },
      { estimatedCostLow: 5000, estimatedCostHigh: 8000 },
    ]);
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", ber: "D1", squareMetres: 100 });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    const data = await res.json();
    expect(data.cashNeededAtClosing).toBe(45000 + 4500 + 2500 + 700 + 500 + 185);
    expect(data.totalPurchaseCost).toBeGreaterThan(data.cashNeededAtClosing);
    expect(data.renovationLow).toBe(15000);
    expect(data.renovationHigh).toBe(28000);
    expect(data.seaiGrants).toBeGreaterThan(0);
    expect(data.trueAllInHigh).toBeGreaterThan(data.totalPurchaseCost);
  });

  it("GET returns null when no estimate", async () => {
    (prisma.totalCostEstimate.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(await res.json()).toBeNull();
  });

  it("PUT auto-calculates stamp duty using isNewBuild", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", isNewBuild: true });
    (prisma.totalCostEstimate.upsert as jest.Mock).mockImplementation((a: Record<string, unknown>) => Promise.resolve(a.create));
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ purchasePrice: 450000 }) });
    const res = await PUT(req, ctx("h1"));
    const data = await res.json();
    expect(data.stampDuty).toBe(Math.round(Math.round(450000 / 1.135) * 0.01));
  });

  it("GET returns zero renovation when no estimates exist", async () => {
    (prisma.totalCostEstimate.findUnique as jest.Mock).mockResolvedValue({
      id: "tc1", houseId: "h1", purchasePrice: 450000, deposit: 45000, stampDuty: 4500,
      legalFees: 2500, landRegistryFees: 700, surveyFee: 500, valuationFee: 185,
      mortgageProtection: 0, homeInsurance: 0, movingCosts: 800, otherCosts: 0,
    });
    (prisma.renovationEstimate.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", ber: null, squareMetres: null });
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    const data = await res.json();
    expect(data.renovationLow).toBe(0);
    expect(data.renovationHigh).toBe(0);
    expect(data.trueAllInLow).toBe(data.totalPurchaseCost);
  });
});

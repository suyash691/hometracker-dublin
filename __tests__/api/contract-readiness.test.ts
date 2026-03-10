/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/contract-readiness/route";
import { NextRequest } from "next/server";

describe("Contract Readiness API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET auto-aggregates from profile, mortgage, conveyancing", async () => {
    prisma.buyerProfile.findFirst.mockResolvedValue({ totalSavings: 55000 });
    prisma.mortgageTracker.findFirst.mockResolvedValue({ approvalExpiry: new Date(Date.now() + 86400000 * 30) });
    prisma.conveyancingTracker.findFirst.mockResolvedValue({ solicitorName: "Mary" });
    prisma.contractReadiness.findFirst.mockResolvedValue({ idVerified: true, amlDocsSubmitted: false, surveyorOnStandby: false, brokerEngaged: true });
    const res = await GET();
    const data = await res.json();
    expect(data.items).toHaveLength(7);
    expect(data.items.find((i: Record<string, unknown>) => i.item === "Mortgage AIP valid").status).toBe(true);
    expect(data.items.find((i: Record<string, unknown>) => i.item === "Solicitor appointed").status).toBe(true);
    expect(data.readyPct).toBeGreaterThan(0);
  });
  it("PUT updates manual items", async () => {
    prisma.contractReadiness.findFirst.mockResolvedValue({ id: "cr1" });
    prisma.contractReadiness.update.mockResolvedValue({ id: "cr1", idVerified: true });
    const req = new NextRequest("http://localhost", { method: "PUT", body: JSON.stringify({ idVerified: true }) });
    await PUT(req);
    expect(prisma.contractReadiness.update).toHaveBeenCalled();
  });
});

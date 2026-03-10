/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
jest.mock("@/lib/db", () => ({ prisma }));
import { GET } from "@/app/api/contract-readiness/route";

describe("Contract Readiness Integration", () => {
  beforeEach(() => jest.clearAllMocks());

  it("aggregates from profile + mortgage + conveyancing + manual", async () => {
    (prisma.buyerProfile.findFirst as jest.Mock).mockResolvedValue({ totalSavings: 55000 });
    (prisma.mortgageTracker.findFirst as jest.Mock).mockResolvedValue({ approvalExpiry: new Date(Date.now() + 86400000 * 30) });
    (prisma.conveyancingTracker.findFirst as jest.Mock).mockResolvedValue({ solicitorName: "Mary" });
    (prisma.contractReadiness.findFirst as jest.Mock).mockResolvedValue({ idVerified: true, amlDocsSubmitted: true, surveyorOnStandby: false, brokerEngaged: true });
    const res = await GET();
    const data = await res.json();
    expect(data.items.filter((i: Record<string, unknown>) => i.status).length).toBe(6); // 3 auto + 3 manual
    expect(data.readyPct).toBe(Math.round((6 / 7) * 100));
  });

  it("handles missing profile gracefully", async () => {
    (prisma.buyerProfile.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.mortgageTracker.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.contractReadiness.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await GET();
    const data = await res.json();
    expect(data.readyPct).toBe(0);
  });
});

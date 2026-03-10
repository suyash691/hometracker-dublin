/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
jest.mock("@/lib/db", () => ({ prisma }));
import { GET } from "@/app/api/schemes/eligibility/route";
import { NextRequest } from "next/server";

describe("Scheme Eligibility Integration", () => {
  beforeEach(() => jest.clearAllMocks());

  it("FTB with high income → HTB eligible, LAHL ineligible", async () => {
    (prisma.buyerProfile.findFirst as jest.Mock).mockResolvedValue({ isFirstTimeBuyer: true, grossIncome1: 70000, grossIncome2: 60000, taxPaid4Years1: 40000, taxPaid4Years2: 30000 });
    const res = await GET(new NextRequest("http://localhost/api/schemes/eligibility?price=400000"));
    const data = await res.json();
    expect(data.htb.eligible).toBe(true);
    expect(data.htb.maxRefund).toBe(30000);
    expect(data.lahl.eligible).toBe(false); // 130k > 85k
  });

  it("FTB with low income → all 3 eligible", async () => {
    (prisma.buyerProfile.findFirst as jest.Mock).mockResolvedValue({ isFirstTimeBuyer: true, grossIncome1: 40000, grossIncome2: 30000, taxPaid4Years1: 20000, taxPaid4Years2: 15000 });
    const res = await GET(new NextRequest("http://localhost/api/schemes/eligibility?price=350000"));
    const data = await res.json();
    expect(data.htb.eligible).toBe(true);
    expect(data.fhs.eligible).toBe(true);
    expect(data.lahl.eligible).toBe(true);
  });

  it("non-FTB → all ineligible", async () => {
    (prisma.buyerProfile.findFirst as jest.Mock).mockResolvedValue({ isFirstTimeBuyer: false, grossIncome1: 70000, grossIncome2: 60000, taxPaid4Years1: 40000, taxPaid4Years2: 30000 });
    const res = await GET(new NextRequest("http://localhost/api/schemes/eligibility"));
    const data = await res.json();
    expect(data.htb.eligible).toBe(false);
    expect(data.fhs.eligible).toBe(false);
    expect(data.lahl.eligible).toBe(false);
  });
});

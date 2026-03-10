/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET } from "@/app/api/schemes/eligibility/route";
import { NextRequest } from "next/server";

describe("Schemes Eligibility API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns eligibility for FTB profile", async () => {
    prisma.buyerProfile.findFirst.mockResolvedValue({
      isFirstTimeBuyer: true, grossIncome1: 65000, grossIncome2: 55000,
      taxPaid4Years1: 40000, taxPaid4Years2: 35000,
    });
    const res = await GET(new NextRequest("http://localhost/api/schemes/eligibility"));
    const data = await res.json();
    expect(data.htb.eligible).toBe(true);
    expect(data.htb.maxRefund).toBe(30000);
    expect(data.fhs.eligible).toBe(true);
    expect(data.lahl.eligible).toBe(false); // income too high
  });

  it("returns 400 when no profile", async () => {
    prisma.buyerProfile.findFirst.mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/schemes/eligibility"));
    expect(res.status).toBe(400);
  });

  it("accepts optional price param", async () => {
    prisma.buyerProfile.findFirst.mockResolvedValue({
      isFirstTimeBuyer: true, grossIncome1: 65000, grossIncome2: 55000,
      taxPaid4Years1: 40000, taxPaid4Years2: 35000,
    });
    const res = await GET(new NextRequest("http://localhost/api/schemes/eligibility?price=200000"));
    const data = await res.json();
    expect(data.htb.maxRefund).toBe(20000); // 10% of 200k
  });

  it("non-FTB → HTB/FHS/LAHL all ineligible", async () => {
    prisma.buyerProfile.findFirst.mockResolvedValue({
      isFirstTimeBuyer: false, grossIncome1: 65000, grossIncome2: 55000,
      taxPaid4Years1: 40000, taxPaid4Years2: 35000,
    });
    const res = await GET(new NextRequest("http://localhost/api/schemes/eligibility"));
    const data = await res.json();
    expect(data.htb.eligible).toBe(false);
    expect(data.fhs.eligible).toBe(false);
    expect(data.lahl.eligible).toBe(false);
  });
});

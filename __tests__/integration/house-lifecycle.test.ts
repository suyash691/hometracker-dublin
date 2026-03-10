/**
 * @jest-environment node
 */
// Integration test: House lifecycle — create → bid → sale_agreed → close
import { prisma } from "../helpers/prismaMock";

jest.mock("@/lib/db", () => ({ prisma }));

import { handleSaleAgreed, handleClosed, handleDropped } from "@/lib/status-triggers";
import { POST as createHouse } from "@/app/api/houses/route";
import { POST as createBid } from "@/app/api/houses/[id]/bids/route";
import { NextRequest } from "next/server";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("House Lifecycle Integration", () => {
  beforeEach(() => jest.clearAllMocks());

  it("create → bid → sale_agreed creates full cascade", async () => {
    // Step 1: Create house
    (prisma.house.create as jest.Mock).mockResolvedValue({ id: "h1", address: "42 Phibs", askingPrice: 450000 });
    const createReq = new NextRequest("http://localhost/api/houses", {
      method: "POST", body: JSON.stringify({ address: "42 Phibs", askingPrice: 450000 }),
    });
    const createRes = await createHouse(createReq);
    expect(createRes.status).toBe(201);

    // Step 2: Add bid
    (prisma.bidHistory.create as jest.Mock).mockResolvedValue({ id: "b1", amount: 460000 });
    (prisma.bidHistory.findFirst as jest.Mock).mockResolvedValue({ amount: 460000 });
    (prisma.house.update as jest.Mock).mockResolvedValue({ id: "h1", currentBid: 460000 });
    const bidReq = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ amount: 460000, isOurs: true }) });
    const bidRes = await createBid(bidReq, ctx("h1"));
    expect(bidRes.status).toBe(201);
    expect(prisma.house.update).toHaveBeenCalledWith(expect.objectContaining({ data: { currentBid: 460000 } }));

    // Step 3: Sale agreed — triggers cascade
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.create as jest.Mock).mockResolvedValue({ id: "c1" });
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", askingPrice: 450000, isNewBuild: false });
    (prisma.totalCostEstimate.upsert as jest.Mock).mockResolvedValue({});
    (prisma.actionItem.create as jest.Mock).mockResolvedValue({});
    await handleSaleAgreed("h1");

    expect(prisma.conveyancingTracker.create).toHaveBeenCalled();
    expect(prisma.totalCostEstimate.upsert).toHaveBeenCalled();
    expect(prisma.actionItem.create).toHaveBeenCalledTimes(4);
  });

  it("sale_agreed → close creates post-completion + celebration", async () => {
    (prisma.viewingChecklist.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.viewingChecklist.create as jest.Mock).mockResolvedValue({});
    (prisma.journalEntry.create as jest.Mock).mockResolvedValue({});
    await handleClosed("h1");

    expect(prisma.viewingChecklist.create).toHaveBeenCalled();
    expect(prisma.journalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ content: expect.stringContaining("Congratulations") }) })
    );
  });

  it("sale_agreed → dropped creates fall-through journal", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", status: "sale_agreed" });
    (prisma.journalEntry.create as jest.Mock).mockResolvedValue({});
    await handleDropped("h1");

    expect(prisma.journalEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ content: expect.stringContaining("fell through") }) })
    );
  });

  it("new build sale_agreed creates snags + compliance", async () => {
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.create as jest.Mock).mockResolvedValue({ id: "c1" });
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", askingPrice: 395000, isNewBuild: true });
    (prisma.totalCostEstimate.upsert as jest.Mock).mockResolvedValue({});
    (prisma.actionItem.create as jest.Mock).mockResolvedValue({});
    (prisma.newBuildCompliance.upsert as jest.Mock).mockResolvedValue({});
    (prisma.snagItem.createMany as jest.Mock).mockResolvedValue({ count: 80 });
    await handleSaleAgreed("h1");

    expect(prisma.newBuildCompliance.upsert).toHaveBeenCalled();
    expect(prisma.snagItem.createMany).toHaveBeenCalled();
    // Stamp duty should use new-build VAT treatment
    const costCall = (prisma.totalCostEstimate.upsert as jest.Mock).mock.calls[0][0];
    expect(costCall.create.stampDuty).toBe(Math.round(Math.round(395000 / 1.135) * 0.01));
  });
});

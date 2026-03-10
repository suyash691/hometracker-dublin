/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";

// Must import mock before the module under test
jest.mock("@/lib/db", () => ({ prisma }));

import { handleSaleAgreed, handleClosed, handleDropped } from "@/lib/status-triggers";

describe("handleSaleAgreed", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates conveyancing tracker with 18 milestones", async () => {
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.create as jest.Mock).mockResolvedValue({ id: "c1" });
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", askingPrice: 450000, isNewBuild: false });
    (prisma.totalCostEstimate.upsert as jest.Mock).mockResolvedValue({});
    (prisma.actionItem.create as jest.Mock).mockResolvedValue({});
    await handleSaleAgreed("h1");
    expect(prisma.conveyancingTracker.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ houseId: "h1", milestones: expect.objectContaining({ create: expect.any(Array) }) }),
    }));
    const milestones = (prisma.conveyancingTracker.create as jest.Mock).mock.calls[0][0].data.milestones.create;
    expect(milestones).toHaveLength(18);
  });

  it("skips if conveyancing already exists (idempotent)", async () => {
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue({ id: "existing" });
    await handleSaleAgreed("h1");
    expect(prisma.conveyancingTracker.create).not.toHaveBeenCalled();
  });

  it("creates total cost estimate with correct stamp duty", async () => {
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.create as jest.Mock).mockResolvedValue({ id: "c1" });
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", askingPrice: 450000, isNewBuild: false });
    (prisma.totalCostEstimate.upsert as jest.Mock).mockResolvedValue({});
    (prisma.actionItem.create as jest.Mock).mockResolvedValue({});
    await handleSaleAgreed("h1");
    expect(prisma.totalCostEstimate.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ purchasePrice: 450000, deposit: 45000, stampDuty: 4500 }),
    }));
  });

  it("uses isNewBuild for stamp duty calculation", async () => {
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.create as jest.Mock).mockResolvedValue({ id: "c1" });
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", askingPrice: 450000, isNewBuild: true });
    (prisma.totalCostEstimate.upsert as jest.Mock).mockResolvedValue({});
    (prisma.actionItem.create as jest.Mock).mockResolvedValue({});
    await handleSaleAgreed("h1");
    const call = (prisma.totalCostEstimate.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.stampDuty).toBe(Math.round(Math.round(450000 / 1.135) * 0.01)); // new build VAT treatment
  });

  it("creates 4 action items", async () => {
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.create as jest.Mock).mockResolvedValue({ id: "c1" });
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", askingPrice: 450000, isNewBuild: false });
    (prisma.totalCostEstimate.upsert as jest.Mock).mockResolvedValue({});
    (prisma.actionItem.create as jest.Mock).mockResolvedValue({});
    await handleSaleAgreed("h1");
    expect(prisma.actionItem.create).toHaveBeenCalledTimes(4);
  });

  it("skips total cost if no asking price", async () => {
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.create as jest.Mock).mockResolvedValue({ id: "c1" });
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", askingPrice: null, isNewBuild: false });
    (prisma.actionItem.create as jest.Mock).mockResolvedValue({});
    await handleSaleAgreed("h1");
    expect(prisma.totalCostEstimate.upsert).not.toHaveBeenCalled();
  });

  it("creates snag items + compliance for new builds", async () => {
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.create as jest.Mock).mockResolvedValue({ id: "c1" });
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", askingPrice: 400000, isNewBuild: true });
    (prisma.totalCostEstimate.upsert as jest.Mock).mockResolvedValue({});
    (prisma.actionItem.create as jest.Mock).mockResolvedValue({});
    (prisma.newBuildCompliance.upsert as jest.Mock).mockResolvedValue({});
    (prisma.snagItem.createMany as jest.Mock).mockResolvedValue({ count: 80 });
    await handleSaleAgreed("h1");
    expect(prisma.newBuildCompliance.upsert).toHaveBeenCalled();
    expect(prisma.snagItem.createMany).toHaveBeenCalled();
  });

  it("does NOT create snags for non-new-builds", async () => {
    (prisma.conveyancingTracker.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.conveyancingTracker.create as jest.Mock).mockResolvedValue({ id: "c1" });
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", askingPrice: 400000, isNewBuild: false });
    (prisma.totalCostEstimate.upsert as jest.Mock).mockResolvedValue({});
    (prisma.actionItem.create as jest.Mock).mockResolvedValue({});
    await handleSaleAgreed("h1");
    expect(prisma.snagItem.createMany).not.toHaveBeenCalled();
  });
});

describe("handleClosed", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates post-completion checklist with 22 items", async () => {
    (prisma.viewingChecklist.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.viewingChecklist.create as jest.Mock).mockResolvedValue({});
    (prisma.journalEntry.create as jest.Mock).mockResolvedValue({});
    await handleClosed("h1");
    expect(prisma.viewingChecklist.create).toHaveBeenCalled();
    const items = JSON.parse((prisma.viewingChecklist.create as jest.Mock).mock.calls[0][0].data.items);
    expect(items).toHaveLength(22);
  });

  it("skips checklist if already exists (idempotent)", async () => {
    (prisma.viewingChecklist.findFirst as jest.Mock).mockResolvedValue({ id: "existing" });
    (prisma.journalEntry.create as jest.Mock).mockResolvedValue({});
    await handleClosed("h1");
    expect(prisma.viewingChecklist.create).not.toHaveBeenCalled();
  });

  it("creates congratulations journal entry", async () => {
    (prisma.viewingChecklist.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.viewingChecklist.create as jest.Mock).mockResolvedValue({});
    (prisma.journalEntry.create as jest.Mock).mockResolvedValue({});
    await handleClosed("h1");
    expect(prisma.journalEntry.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ content: expect.stringContaining("Congratulations") }),
    }));
  });
});

describe("handleDropped", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates journal entry when dropping from sale_agreed", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", status: "sale_agreed" });
    (prisma.journalEntry.create as jest.Mock).mockResolvedValue({});
    await handleDropped("h1");
    expect(prisma.journalEntry.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ content: expect.stringContaining("fell through") }),
    }));
  });

  it("creates journal entry when dropping from conveyancing", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", status: "conveyancing" });
    (prisma.journalEntry.create as jest.Mock).mockResolvedValue({});
    await handleDropped("h1");
    expect(prisma.journalEntry.create).toHaveBeenCalled();
  });

  it("does NOT create journal entry when dropping from wishlist", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", status: "wishlist" });
    await handleDropped("h1");
    expect(prisma.journalEntry.create).not.toHaveBeenCalled();
  });

  it("does NOT create journal entry when dropping from viewed", async () => {
    (prisma.house.findUnique as jest.Mock).mockResolvedValue({ id: "h1", status: "viewed" });
    await handleDropped("h1");
    expect(prisma.journalEntry.create).not.toHaveBeenCalled();
  });
});

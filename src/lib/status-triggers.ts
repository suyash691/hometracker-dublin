import { prisma } from "./db";
import { CONVEYANCING_MILESTONES } from "./constants/conveyancing";
import { calculateStampDuty } from "./stamp-duty";

/** Called when a house moves to sale_agreed. Creates conveyancing tracker, total cost, action items, and new-build extras. */
export async function handleSaleAgreed(houseId: string) {
  const existing = await prisma.conveyancingTracker.findUnique({ where: { houseId } });
  if (existing) return;

  await prisma.conveyancingTracker.create({
    data: { houseId, milestones: { create: CONVEYANCING_MILESTONES.map((step, i) => ({ step, stepOrder: i + 1 })) } },
  });

  const house = await prisma.house.findUnique({ where: { id: houseId } });
  if (house?.askingPrice || house?.currentBid) {
    const price = house.currentBid ?? house.askingPrice!;
    const { stampDuty } = calculateStampDuty(price, house.isNewBuild);
    await prisma.totalCostEstimate.upsert({
      where: { houseId },
      update: {},
      create: { houseId, purchasePrice: price, deposit: Math.round(price * 0.1), stampDuty },
    });
  }

  for (const a of [
    { title: "Appoint solicitor", category: "legal" },
    { title: "Arrange structural survey", category: "survey" },
    { title: "Confirm mortgage drawdown timeline", category: "mortgage" },
    { title: "Get home insurance quotes", category: "insurance" },
  ]) {
    await prisma.actionItem.create({ data: { ...a, houseId, status: "todo" } });
  }

  if (house?.isNewBuild) {
    await prisma.newBuildCompliance.upsert({ where: { houseId }, update: {}, create: { houseId } });
    const { DEFAULT_SNAG_ITEMS } = await import("./default-snags");
    await prisma.snagItem.createMany({
      data: DEFAULT_SNAG_ITEMS.flatMap(g => g.items.map(desc => ({ houseId, room: g.room, category: "functional", description: desc }))),
    });
  }
}

/** Called when a house moves to closed. Creates post-completion checklist + celebration. */
export async function handleClosed(houseId: string) {
  const { POST_COMPLETION_ITEMS } = await import("./default-post-completion");
  const existing = await prisma.viewingChecklist.findFirst({ where: { houseId, items: { contains: "MPRN" } } });
  if (!existing) {
    await prisma.viewingChecklist.create({
      data: { houseId, items: JSON.stringify(POST_COMPLETION_ITEMS.map(name => ({ name, checked: false, notes: "" }))) },
    });
  }
  await prisma.journalEntry.create({ data: { houseId, type: "milestone", content: "🏠 Congratulations! You got the keys!" } });
}

/** Called when a house moves to dropped from sale_agreed+. Creates fall-through journal entry. */
export async function handleDropped(houseId: string) {
  const house = await prisma.house.findUnique({ where: { id: houseId } });
  if (house && ["sale_agreed", "conveyancing", "closing"].includes(house.status)) {
    await prisma.journalEntry.create({
      data: { houseId, type: "milestone", content: "💔 Sale fell through. It's okay — the average Dublin buyer bids on 6 properties." },
    });
  }
}

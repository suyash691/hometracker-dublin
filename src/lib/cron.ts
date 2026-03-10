import { prisma } from "./db";
import { scrapeOffrBids } from "./offr-scraper";
import { logActivity } from "./activity";

export async function syncAllOffrBids() {
  const houses = await prisma.house.findMany({
    where: {
      offrUrl: { not: null },
      status: { in: ["bidding", "viewing_scheduled", "viewed"] },
    },
  });

  for (const house of houses) {
    if (!house.offrUrl) continue;
    try {
      const info = await scrapeOffrBids(house.offrUrl);
      if (info.currentBid && info.currentBid !== house.currentBid) {
        const existing = await prisma.bidHistory.findFirst({
          where: { houseId: house.id, amount: info.currentBid, source: "offr_sync" },
        });
        if (!existing) {
          await prisma.bidHistory.create({
            data: {
              houseId: house.id,
              amount: info.currentBid,
              source: "offr_sync",
              isOurs: false,
              notes: info.bidCount ? `${info.bidCount} total bids` : undefined,
            },
          });
        }
        await prisma.house.update({
          where: { id: house.id },
          data: { currentBid: info.currentBid },
        });
        await logActivity("system", "offr_sync", "house", house.id, `Bid updated to €${info.currentBid.toLocaleString()}`);
      }
    } catch (err) {
      console.error(`Offr sync failed for ${house.address}:`, err);
    }
  }
}

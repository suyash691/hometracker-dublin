import { prisma } from "@/lib/db";
import { scrapeOffrBids } from "@/lib/offr-scraper";
import { logActivity } from "@/lib/activity";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const house = await prisma.house.findUnique({ where: { id } });
  if (!house) return NextResponse.json({ error: "House not found" }, { status: 404 });
  if (!house.offrUrl) return NextResponse.json({ error: "No Offr.io URL set for this house" }, { status: 400 });

  try {
    const info = await scrapeOffrBids(house.offrUrl);

    if (info.currentBid) {
      // Check if this bid amount already exists
      const existing = await prisma.bidHistory.findFirst({
        where: { houseId: id, amount: info.currentBid, source: "offr_sync" },
      });

      if (!existing) {
        await prisma.bidHistory.create({
          data: {
            houseId: id,
            amount: info.currentBid,
            source: "offr_sync",
            isOurs: false,
            notes: info.bidCount ? `${info.bidCount} total bids` : undefined,
          },
        });
      }

      await prisma.house.update({
        where: { id },
        data: { currentBid: info.currentBid },
      });

      await logActivity("system", "synced_bids", "house", id, `Offr sync: €${info.currentBid.toLocaleString()}`);
    }

    return NextResponse.json(info);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Offr sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

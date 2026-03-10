// Cron trigger endpoint — call via system cron or node-cron
// curl -X POST http://localhost:3000/api/cron/offr-sync
import { syncAllOffrBids } from "@/lib/cron";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncAllOffrBids();
    return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

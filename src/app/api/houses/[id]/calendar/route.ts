import { prisma } from "@/lib/db";
import { generateIcs } from "@/lib/ics";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const house = await prisma.house.findUnique({ where: { id } });
  if (!house) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!house.viewingDate) return NextResponse.json({ error: "No viewing date set" }, { status: 400 });

  const desc = [
    house.askingPrice ? `Asking: €${house.askingPrice.toLocaleString()}` : null,
    house.bedrooms || house.bathrooms ? `${house.bedrooms || "?"} bed / ${house.bathrooms || "?"} bath` : null,
    house.ber ? `BER: ${house.ber}` : null,
    house.listingUrl,
  ].filter(Boolean).join(" | ");

  const location = [house.address, house.neighbourhood, house.eircode].filter(Boolean).join(", ");

  const ics = generateIcs({
    title: `Viewing: ${house.address}`,
    start: new Date(house.viewingDate),
    location,
    description: desc,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="viewing-${id}.ics"`,
    },
  });
}

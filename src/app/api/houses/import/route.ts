import { prisma } from "@/lib/db";
import { scrapeDaftListing } from "@/lib/scraper";
import { logActivity } from "@/lib/activity";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url, user } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  try {
    const listing = await scrapeDaftListing(url);

    // Wrap all DB writes in a transaction — no partial data on failure
    const house = await prisma.$transaction(async (tx) => {
      const h = await tx.house.create({
        data: {
          address: listing.address, eircode: listing.eircode, neighbourhood: listing.neighbourhood,
          askingPrice: listing.askingPrice, listingUrl: listing.listingUrl,
          bedrooms: listing.bedrooms, bathrooms: listing.bathrooms, propertyType: listing.propertyType,
          ber: listing.ber, squareMetres: listing.squareMetres,
          lat: listing.lat, lng: listing.lng, berEpi: listing.berEpi,
          publishDate: listing.publishDate,
          agentName: listing.agentName, agentBranch: listing.agentBranch, agentPhone: listing.agentPhone,
          status: "wishlist", addedBy: user || undefined,
        },
      });

      if (listing.images.length > 0) {
        await tx.media.createMany({ data: listing.images.map((filePath) => ({ houseId: h.id, type: "photo", filePath })) });
      }
      if (listing.floorplanImages.length > 0) {
        await tx.media.createMany({ data: listing.floorplanImages.map((filePath) => ({ houseId: h.id, type: "floorplan", filePath })) });
      }

      if (listing.propertyType === "apartment" || listing.propertyType === "duplex") {
        const { OMC_CHECKLIST } = await import("@/lib/constants/omc");
        await tx.apartmentDetails.create({
          data: { houseId: h.id, omcChecklist: JSON.stringify(OMC_CHECKLIST.map(name => ({ name, checked: false, notes: "" }))) },
        });
      }

      await tx.defectiveBlocksAssessment.create({
        data: { houseId: h.id, notes: "Check build year — request pyrite assessment if 2001-2013" },
      });

      return h;
    });

    await logActivity(user || "system", "imported_listing", "house", house.id, `Imported ${listing.address} from ${url}`);
    return NextResponse.json(house, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scraping failed";
    console.error(`[import] Failed for ${url}:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

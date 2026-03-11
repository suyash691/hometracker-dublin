import { prisma } from "@/lib/db";
import { scrapeDaftListing } from "@/lib/scraper";
import { logActivity } from "@/lib/activity";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { url, user } = await req.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  try {
    const listing = await scrapeDaftListing(url);

    const house = await prisma.house.create({
      data: {
        address: listing.address,
        eircode: listing.eircode,
        neighbourhood: listing.neighbourhood,
        askingPrice: listing.askingPrice,
        listingUrl: listing.listingUrl,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        propertyType: listing.propertyType,
        ber: listing.ber,
        squareMetres: listing.squareMetres,
        lat: listing.lat,
        lng: listing.lng,
        berEpi: listing.berEpi,
        pricePerSqm: listing.pricePerSqm,
        publishDate: listing.publishDate,
        daysOnMarket: listing.publishDate ? Math.floor((Date.now() - listing.publishDate.getTime()) / 86400000) : undefined,
        agentName: listing.agentName,
        agentBranch: listing.agentBranch,
        agentPhone: listing.agentPhone,
        status: "wishlist",
        addedBy: user || undefined,
      },
    });

    // Create media records for photos
    if (listing.images.length > 0) {
      await prisma.media.createMany({
        data: listing.images.map((filePath) => ({ houseId: house.id, type: "photo", filePath })),
      });
    }
    // Create media records for floorplans
    if (listing.floorplanImages.length > 0) {
      await prisma.media.createMany({
        data: listing.floorplanImages.map((filePath) => ({ houseId: house.id, type: "floorplan", filePath })),
      });
    }

    await logActivity(user || "system", "imported_listing", "house", house.id, `Imported ${listing.address} from ${url}`);

    // Auto-create apartment details stub if apartment/duplex
    if (listing.propertyType === "apartment" || listing.propertyType === "duplex") {
      const { OMC_CHECKLIST } = await import("@/lib/schemes");
      await prisma.apartmentDetails.create({
        data: { houseId: house.id, omcChecklist: JSON.stringify(OMC_CHECKLIST.map(name => ({ name, checked: false, notes: "" }))) },
      });
    }

    // Auto-flag defective blocks risk for 2001-2013 builds
    // We don't know build year from scraping, but create a stub to prompt the buyer
    await prisma.defectiveBlocksAssessment.create({
      data: { houseId: house.id, notes: "Check build year — request pyrite assessment if 2001-2013" },
    });

    return NextResponse.json(house, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scraping failed";
    console.error(`[import] Failed for ${url}:`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

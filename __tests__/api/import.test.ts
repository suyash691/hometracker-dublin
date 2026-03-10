/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";

jest.mock("@/lib/scraper", () => ({
  scrapeDaftListing: jest.fn().mockResolvedValue({
    address: "42 Phibsborough Rd", askingPrice: 425000, bedrooms: 3, bathrooms: 1,
    propertyType: "terraced", ber: "C2", squareMetres: 95, neighbourhood: "Phibsborough",
    eircode: "D07", listingUrl: "https://daft.ie/123", images: ["/data/media/img1.jpg"],
  }),
}));
jest.mock("@/lib/activity", () => ({ logActivity: jest.fn() }));

import { POST } from "@/app/api/houses/import/route";
import { NextRequest } from "next/server";

describe("Import API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates house from Daft.ie URL", async () => {
    (prisma.house.create as jest.Mock).mockResolvedValue({ id: "h1", address: "42 Phibsborough Rd", propertyType: "terraced" });
    (prisma.media.createMany as jest.Mock).mockResolvedValue({ count: 1 });
    (prisma.defectiveBlocksAssessment.create as jest.Mock).mockResolvedValue({});
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ url: "https://daft.ie/123" }) });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(prisma.house.create).toHaveBeenCalled();
    expect(prisma.media.createMany).toHaveBeenCalled();
  });

  it("returns 400 for missing URL", async () => {
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({}) });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("auto-creates defective blocks stub", async () => {
    (prisma.house.create as jest.Mock).mockResolvedValue({ id: "h1", propertyType: "terraced" });
    (prisma.media.createMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.defectiveBlocksAssessment.create as jest.Mock).mockResolvedValue({});
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ url: "https://daft.ie/123" }) });
    await POST(req);
    expect(prisma.defectiveBlocksAssessment.create).toHaveBeenCalled();
  });

  it("auto-creates apartment details for apartments", async () => {
    const { scrapeDaftListing } = require("@/lib/scraper");
    scrapeDaftListing.mockResolvedValue({ address: "Apt 4", propertyType: "apartment", listingUrl: "https://daft.ie/456", images: [] });
    (prisma.house.create as jest.Mock).mockResolvedValue({ id: "h2", propertyType: "apartment" });
    (prisma.apartmentDetails.create as jest.Mock).mockResolvedValue({});
    (prisma.defectiveBlocksAssessment.create as jest.Mock).mockResolvedValue({});
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ url: "https://daft.ie/456" }) });
    await POST(req);
    expect(prisma.apartmentDetails.create).toHaveBeenCalled();
  });
});

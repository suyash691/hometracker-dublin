/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { POST } from "@/app/api/seed-amenities/route";
describe("Seed Amenities API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("seeds defaults when empty", async () => {
    (prisma.preferredAmenity.count as jest.Mock).mockResolvedValue(0);
    (prisma.preferredAmenity.createMany as jest.Mock).mockResolvedValue({ count: 20 });
    const res = await POST();
    expect(res.status).toBe(201);
    expect(prisma.preferredAmenity.createMany).toHaveBeenCalled();
  });
  it("skips if already seeded", async () => {
    (prisma.preferredAmenity.count as jest.Mock).mockResolvedValue(20);
    const res = await POST();
    expect(prisma.preferredAmenity.createMany).not.toHaveBeenCalled();
  });
});

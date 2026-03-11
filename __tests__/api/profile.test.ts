/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/profile/route";
import { NextRequest } from "next/server";

describe("Profile API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("GET returns profile", async () => {
    (prisma.buyerProfile.findUnique as jest.Mock).mockResolvedValue({ id: "buyer-profile-singleton", name1: "Sarah" });
    const res = await GET();
    expect((await res.json()).name1).toBe("Sarah");
  });

  it("GET returns null when no profile", async () => {
    (prisma.buyerProfile.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await GET();
    expect(await res.json()).toBeNull();
  });

  it("PUT upserts with singleton ID", async () => {
    (prisma.buyerProfile.upsert as jest.Mock).mockResolvedValue({ id: "buyer-profile-singleton", name1: "Sarah" });
    const req = new NextRequest("http://localhost/api/profile", { method: "PUT", body: JSON.stringify({ name1: "Sarah", name2: "John" }) });
    await PUT(req);
    expect(prisma.buyerProfile.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "buyer-profile-singleton" } }));
  });
});

/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, PUT } from "@/app/api/profile/route";
import { NextRequest } from "next/server";

describe("Profile API", () => {
  beforeEach(() => jest.clearAllMocks());

  it("GET returns profile", async () => {
    prisma.buyerProfile.findFirst.mockResolvedValue({ id: "p1", name1: "Sarah", name2: "John" });
    const res = await GET();
    expect(await res.json()).toEqual(expect.objectContaining({ name1: "Sarah" }));
  });

  it("GET returns null when no profile", async () => {
    prisma.buyerProfile.findFirst.mockResolvedValue(null);
    const res = await GET();
    expect(await res.json()).toBeNull();
  });

  it("PUT creates profile if none exists", async () => {
    prisma.buyerProfile.findFirst.mockResolvedValue(null);
    prisma.buyerProfile.create.mockImplementation((a: Record<string, unknown>) => Promise.resolve({ id: "new", ...a.data }));
    const req = new NextRequest("http://localhost/api/profile", {
      method: "PUT", body: JSON.stringify({ name1: "Sarah", name2: "John", grossIncome1: 65000 }),
    });
    const res = await PUT(req);
    expect(prisma.buyerProfile.create).toHaveBeenCalled();
  });

  it("PUT updates existing profile", async () => {
    prisma.buyerProfile.findFirst.mockResolvedValue({ id: "p1" });
    prisma.buyerProfile.update.mockResolvedValue({ id: "p1", name1: "Sarah" });
    const req = new NextRequest("http://localhost/api/profile", {
      method: "PUT", body: JSON.stringify({ name1: "Sarah" }),
    });
    await PUT(req);
    expect(prisma.buyerProfile.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "p1" } }));
  });
});

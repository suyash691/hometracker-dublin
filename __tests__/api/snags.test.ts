/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/houses/[id]/snags/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Snags API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns snags ordered by room", async () => {
    prisma.snagItem.findMany.mockResolvedValue([{ id: "s1", room: "Kitchen" }]);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(await res.json()).toHaveLength(1);
  });
  it("POST with seedDefaults creates default snag items", async () => {
    prisma.snagItem.count.mockResolvedValue(0);
    prisma.snagItem.findMany.mockResolvedValue([]);
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ seedDefaults: true }) });
    await POST(req, ctx("h1"));
    expect(prisma.snagItem.createMany).toHaveBeenCalled();
  });
  it("POST without seedDefaults creates single snag", async () => {
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ room: "Kitchen", category: "cosmetic", description: "Paint chip" }) });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(201);
  });
});

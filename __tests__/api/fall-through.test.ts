/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/houses/[id]/fall-through/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Fall-Through API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns records", async () => {
    prisma.fallThroughRecord.findMany.mockResolvedValue([{ id: "ft1", reason: "gazumped" }]);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(await res.json()).toHaveLength(1);
  });
  it("POST creates record + sets dropped + creates action + journal", async () => {
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ reason: "title_issue", notes: "Missing deeds" }) });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(201);
    expect(prisma.fallThroughRecord.create).toHaveBeenCalled();
    expect(prisma.house.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "dropped" } }));
    expect(prisma.actionItem.create).toHaveBeenCalled();
    expect(prisma.journalEntry.create).toHaveBeenCalled();
  });
});

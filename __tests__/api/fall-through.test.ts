/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
jest.mock("@/lib/status-triggers", () => ({ handleDropped: jest.fn() }));
import { GET, POST } from "@/app/api/houses/[id]/fall-through/route";
import { NextRequest } from "next/server";
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("Fall-Through API", () => {
  beforeEach(() => jest.clearAllMocks());
  it("GET returns records", async () => {
    (prisma.fallThroughRecord.findMany as jest.Mock).mockResolvedValue([{ id: "ft1", reason: "gazumped" }]);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(await res.json()).toHaveLength(1);
  });
  it("POST creates record + delegates to handleDropped + sets dropped", async () => {
    const { handleDropped } = require("@/lib/status-triggers");
    const req = new NextRequest("http://localhost", { method: "POST", body: JSON.stringify({ reason: "title_issue" }) });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(201);
    expect(prisma.fallThroughRecord.create).toHaveBeenCalled();
    expect(handleDropped).toHaveBeenCalledWith("h1");
    expect(prisma.house.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "dropped" } }));
    expect(prisma.actionItem.create).toHaveBeenCalled();
  });
});

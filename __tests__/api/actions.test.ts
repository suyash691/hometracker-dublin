/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/actions/route";
import { PUT, DELETE } from "@/app/api/actions/[id]/route";
import { NextRequest } from "next/server";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const mockAction = { id: "a1", title: "Book solicitor", status: "todo", category: "legal" };

beforeEach(() => jest.clearAllMocks());

describe("GET /api/actions", () => {
  it("returns all actions", async () => {
    (prisma.actionItem.findMany as jest.Mock).mockResolvedValue([mockAction]);
    const res = await GET(new NextRequest("http://localhost/api/actions"));
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it("filters by houseId, status, assignedTo", async () => {
    (prisma.actionItem.findMany as jest.Mock).mockResolvedValue([]);
    await GET(new NextRequest("http://localhost/api/actions?houseId=h1&status=todo&assignedTo=Alice"));
    expect(prisma.actionItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ houseId: "h1", status: "todo", assignedTo: "Alice" }),
      })
    );
  });
});

describe("POST /api/actions", () => {
  it("creates an action item", async () => {
    (prisma.actionItem.create as jest.Mock).mockResolvedValue(mockAction);
    const req = new NextRequest("http://localhost/api/actions", {
      method: "POST", body: JSON.stringify({ title: "Book solicitor", category: "legal" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

describe("PUT /api/actions/[id]", () => {
  it("updates an action", async () => {
    (prisma.actionItem.update as jest.Mock).mockResolvedValue({ ...mockAction, status: "done" });
    const req = new NextRequest("http://localhost", {
      method: "PUT", body: JSON.stringify({ status: "done" }),
    });
    const res = await PUT(req, ctx("a1"));
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/actions/[id]", () => {
  it("deletes an action", async () => {
    (prisma.actionItem.delete as jest.Mock).mockResolvedValue({});
    const res = await DELETE(new NextRequest("http://localhost"), ctx("a1"));
    expect(res.status).toBe(200);
  });
});

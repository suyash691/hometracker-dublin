/**
 * @jest-environment node
 */
import { prisma } from "../helpers/prismaMock";
import { GET, POST } from "@/app/api/houses/[id]/checklists/route";
import { PUT } from "@/app/api/houses/[id]/checklists/[checklistId]/route";
import { NextRequest } from "next/server";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const ctxCl = (id: string, checklistId: string) => ({ params: Promise.resolve({ id, checklistId }) });

beforeEach(() => jest.clearAllMocks());

describe("GET /api/houses/[id]/checklists", () => {
  it("returns checklists for a house", async () => {
    (prisma.viewingChecklist.findMany as jest.Mock).mockResolvedValue([
      { id: "cl1", houseId: "h1", items: JSON.stringify([{ name: "Roof", checked: false, notes: "" }]) },
    ]);
    const res = await GET(new NextRequest("http://localhost"), ctx("h1"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });
});

describe("POST /api/houses/[id]/checklists", () => {
  it("creates checklist from template", async () => {
    const tpl = { id: "t1", items: JSON.stringify(["Roof", "Plumbing", "Wiring"]) };
    (prisma.checklistTemplate.findUnique as jest.Mock).mockResolvedValue(tpl);
    (prisma.viewingChecklist.create as jest.Mock).mockResolvedValue({ id: "cl1", houseId: "h1", items: "[]" });

    const req = new NextRequest("http://localhost", {
      method: "POST", body: JSON.stringify({ templateId: "t1" }),
    });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(201);
    const createCall = (prisma.viewingChecklist.create as jest.Mock).mock.calls[0][0];
    const items = JSON.parse(createCall.data.items);
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({ name: "Roof", checked: false, notes: "" });
  });

  it("returns 404 for missing template", async () => {
    (prisma.checklistTemplate.findUnique as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest("http://localhost", {
      method: "POST", body: JSON.stringify({ templateId: "missing" }),
    });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(404);
  });

  it("uses default template when no body provided", async () => {
    const def = { id: "d1", items: JSON.stringify(["Windows", "Doors"]), isDefault: true };
    (prisma.checklistTemplate.findFirst as jest.Mock).mockResolvedValue(def);
    (prisma.viewingChecklist.create as jest.Mock).mockResolvedValue({ id: "cl1" });

    const req = new NextRequest("http://localhost", {
      method: "POST", body: JSON.stringify({}),
    });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(201);
    const createCall = (prisma.viewingChecklist.create as jest.Mock).mock.calls[0][0];
    const items = JSON.parse(createCall.data.items);
    expect(items).toHaveLength(2);
  });

  it("falls back to built-in checklist when no default template exists", async () => {
    (prisma.checklistTemplate.findFirst as jest.Mock).mockResolvedValue(null);
    const req = new NextRequest("http://localhost", {
      method: "POST", body: JSON.stringify({}),
    });
    const res = await POST(req, ctx("h1"));
    expect(res.status).toBe(201);
    expect(prisma.viewingChecklist.create).toHaveBeenCalled();
  });
});

describe("PUT /api/houses/[id]/checklists/[checklistId]", () => {
  it("updates checklist items (serializes array to JSON)", async () => {
    const items = [{ name: "Roof", checked: true, notes: "looks good" }];
    (prisma.viewingChecklist.update as jest.Mock).mockResolvedValue({ id: "cl1", items: JSON.stringify(items) });

    const req = new NextRequest("http://localhost", {
      method: "PUT", body: JSON.stringify({ items }),
    });
    const res = await PUT(req, ctxCl("h1", "cl1"));
    expect(res.status).toBe(200);
    const call = (prisma.viewingChecklist.update as jest.Mock).mock.calls[0][0];
    expect(call.data.items).toBe(JSON.stringify(items));
  });
});

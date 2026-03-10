import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

type Ctx = { params: Promise<{ id: string; docId: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { docId } = await ctx.params;
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    // File upload
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const mediaDir = path.join(process.cwd(), "data", "media", "mortgage");
    await mkdir(mediaDir, { recursive: true });

    const ext = file.name.split(".").pop() || "pdf";
    const filename = `${randomUUID()}.${ext}`;
    const filePath = path.join(mediaDir, filename);
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    const doc = await prisma.mortgageDocument.update({
      where: { id: docId },
      data: { uploaded: true, filePath },
    });
    return NextResponse.json(doc);
  } else {
    // JSON update (mark uploaded, change person, etc.)
    const body = await req.json();
    const doc = await prisma.mortgageDocument.update({
      where: { id: docId },
      data: body,
    });
    return NextResponse.json(doc);
  }
}

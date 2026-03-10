import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const media = await prisma.media.findMany({
    where: { houseId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(media);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const house = await prisma.house.findUnique({ where: { id } });
  if (!house) return NextResponse.json({ error: "House not found" }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string) || "photo";
  const caption = formData.get("caption") as string | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const mediaDir = path.join(process.cwd(), "data", "media");
  await mkdir(mediaDir, { recursive: true });

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const filePath = path.join(mediaDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const media = await prisma.media.create({
    data: { houseId: id, type, filePath, caption },
  });

  return NextResponse.json(media, { status: 201 });
}

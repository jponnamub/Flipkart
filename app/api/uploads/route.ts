import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const uploadRoles: Role[] = [Role.ADMIN, Role.SELLER];
  if (!session?.user || !uploadRoles.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || !allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Upload a JPEG, PNG, WEBP, or GIF image" }, { status: 400 });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Images must be under 5MB" }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${crypto.randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${filename}` });
}

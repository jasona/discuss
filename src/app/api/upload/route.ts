import { NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const orgId = formData.get("orgId") as string | null;

  if (!file || !orgId) {
    return NextResponse.json(
      { error: "File and orgId are required" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() || "png";
  const fileName = `${nanoid(12)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", orgId);

  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, fileName), buffer);

  const url = `/uploads/${orgId}/${fileName}`;

  return NextResponse.json({ url });
}

import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel Functions cap request bodies at 4.5 MB
const FOLDERS = new Set(["projects", "awards", "profile", "cv"]);
// SVG is excluded on purpose: it can carry script.
const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

const blobConfigured = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!blobConfigured()) {
    return NextResponse.json(
      { error: "Vercel Blob is not configured (BLOB_READ_WRITE_TOKEN missing)." },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") ?? "");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  if (!FOLDERS.has(folder)) return NextResponse.json({ error: "Invalid folder." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use PNG, JPEG, WebP, AVIF, GIF or PDF." }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File must be 4 MB or smaller." }, { status: 413 });

  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "file";

  const blob = await put(`portfolio/${folder}/${base}.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type,
  });
  return NextResponse.json({ url: blob.url });
}

export async function DELETE(req: Request) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  let host = "";
  try {
    host = new URL(url ?? "").hostname;
  } catch {}
  // Only blobs this app uploaded can be deleted; local /public files are left alone.
  if (!host.endsWith(".public.blob.vercel-storage.com")) {
    return NextResponse.json({ error: "Not a Blob URL." }, { status: 400 });
  }
  if (!blobConfigured()) return NextResponse.json({ error: "Blob not configured." }, { status: 503 });
  await del(url!);
  return NextResponse.json({ deleted: true });
}

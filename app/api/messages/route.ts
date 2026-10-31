import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { validateContact } from "@/lib/contact";
import { getAdminDb } from "@/lib/firebase-admin";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

// Contact-form backup copies. Firestore rules deny all client writes to
// "messages"; this route writes with the Admin SDK instead.
const COLLECTION = "messages";
const limited = createRateLimiter(5, 10 * 60 * 1000); // 5 per IP per 10 minutes
const ID_RE = /^[A-Za-z0-9]{1,64}$/;

const notConfigured = () =>
  NextResponse.json({ error: "Message storage is not configured." }, { status: 503 });

/** Public: save a contact-form submission. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;

  // Honeypot filled: pretend it worked.
  if (body?.botcheck) return NextResponse.json({ saved: true });

  const parsed = validateContact(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (limited(clientIp(req))) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  const db = getAdminDb();
  if (!db) return notConfigured();

  try {
    await db.collection(COLLECTION).add({ ...parsed.data, createdAt: FieldValue.serverTimestamp(), read: false });
    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("[messages] save failed:", err);
    return NextResponse.json({ error: "Could not save the message." }, { status: 500 });
  }
}

async function adminBody(req: Request) {
  if (!(await verifyAdmin(req))) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const body = (await req.json().catch(() => ({}))) as { id?: unknown; read?: unknown };
  if (typeof body.id !== "string" || !ID_RE.test(body.id)) {
    return { error: NextResponse.json({ error: "Invalid id." }, { status: 400 }) };
  }
  const db = getAdminDb();
  if (!db) return { error: notConfigured() };
  return { db, id: body.id, read: body.read };
}

/** Admin: mark a message read or unread. */
export async function PATCH(req: Request) {
  const r = await adminBody(req);
  if ("error" in r) return r.error;
  if (typeof r.read !== "boolean") return NextResponse.json({ error: "Invalid read flag." }, { status: 400 });
  await r.db.collection(COLLECTION).doc(r.id).update({ read: r.read });
  return NextResponse.json({ ok: true });
}

/** Admin: delete a message. */
export async function DELETE(req: Request) {
  const r = await adminBody(req);
  if ("error" in r) return r.error;
  await r.db.collection(COLLECTION).doc(r.id).delete();
  return NextResponse.json({ ok: true });
}

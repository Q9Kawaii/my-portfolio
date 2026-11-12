import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { type Testimonial, type TestimonialStatus, T_LIMITS, validateTestimonial } from "@/lib/testimonials";
import { T_COLLECTION } from "@/lib/testimonials-server";

// Testimonials. Firestore rules deny all client access to "testimonials";
// everything goes through here with the Admin SDK. Submissions start as "pending"
// and only appear on the site after the admin approves them.
const limited = createRateLimiter(3, 60 * 60 * 1000); // 3 submissions per IP per hour
const ID_RE = /^[A-Za-z0-9]{1,64}$/;
const STATUSES: TestimonialStatus[] = ["pending", "approved", "hidden"];

const notConfigured = () => NextResponse.json({ error: "Testimonial storage is not configured." }, { status: 503 });
const refreshSite = () => {
  revalidatePath("/");
  revalidatePath("/services");
};

/** Public: submit a testimonial for review. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (body?.website) return NextResponse.json({ saved: true }); // honeypot

  const parsed = validateTestimonial(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (limited(clientIp(req))) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }
  const db = getAdminDb();
  if (!db) return notConfigured();
  try {
    await db.collection(T_COLLECTION).add({ ...parsed.data, status: "pending", createdAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("[testimonials] save failed:", err);
    return NextResponse.json({ error: "Could not save your testimonial." }, { status: 500 });
  }
}

/** Admin: list every testimonial, newest first. */
export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getAdminDb();
  if (!db) return notConfigured();
  const snap = await db.collection(T_COLLECTION).orderBy("createdAt", "desc").limit(200).get();
  const items: Testimonial[] = snap.docs.map((d) => ({
    id: d.id,
    name: String(d.get("name") ?? ""),
    role: String(d.get("role") ?? ""),
    company: String(d.get("company") ?? ""),
    project: String(d.get("project") ?? ""),
    quote: String(d.get("quote") ?? ""),
    email: String(d.get("email") ?? ""),
    status: STATUSES.includes(d.get("status")) ? d.get("status") : "pending",
    createdAt: d.get("createdAt")?.toDate?.().toISOString() ?? null,
  }));
  return NextResponse.json({ items });
}

async function adminTarget(req: Request) {
  if (!(await verifyAdmin(req))) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (typeof body.id !== "string" || !ID_RE.test(body.id)) return { error: NextResponse.json({ error: "Invalid id." }, { status: 400 }) };
  const db = getAdminDb();
  if (!db) return { error: notConfigured() };
  return { db, id: body.id, body };
}

/** Admin: change status and/or lightly edit the public fields (typos, trimming). */
export async function PATCH(req: Request) {
  const r = await adminTarget(req);
  if ("error" in r) return r.error;
  const update: Record<string, unknown> = {};
  const { status, quote, role, company, project } = r.body;
  if (status !== undefined) {
    if (!STATUSES.includes(status as TestimonialStatus)) return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    update.status = status;
    if (status === "approved") update.approvedAt = FieldValue.serverTimestamp();
  }
  if (typeof quote === "string") {
    const q = quote.trim();
    if (q.length < T_LIMITS.quoteMin || q.length > T_LIMITS.quote) return NextResponse.json({ error: "Quote length is out of range." }, { status: 400 });
    update.quote = q;
  }
  for (const [k, v] of Object.entries({ role, company, project })) {
    if (typeof v === "string") update[k] = v.trim().slice(0, k === "project" ? T_LIMITS.project : T_LIMITS.role);
  }
  if (!Object.keys(update).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  await r.db.collection(T_COLLECTION).doc(r.id).update(update);
  refreshSite();
  return NextResponse.json({ ok: true });
}

/** Admin: delete a testimonial. */
export async function DELETE(req: Request) {
  const r = await adminTarget(req);
  if ("error" in r) return r.error;
  await r.db.collection(T_COLLECTION).doc(r.id).delete();
  refreshSite();
  return NextResponse.json({ ok: true });
}

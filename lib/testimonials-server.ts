import "server-only";
import { getAdminDb } from "./firebase-admin";
import type { PublicTestimonial } from "./testimonials";

export const T_COLLECTION = "testimonials";

/** Approved testimonials for the public site, newest first. Empty if storage isn't configured or fails. */
export async function getApprovedTestimonials(max = 12): Promise<PublicTestimonial[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await db.collection(T_COLLECTION).where("status", "==", "approved").get();
    return snap.docs
      .map((d) => ({ d, at: d.get("approvedAt")?.toMillis?.() ?? d.get("createdAt")?.toMillis?.() ?? 0 }))
      .sort((a, b) => b.at - a.at)
      .slice(0, max)
      .map(({ d }) => ({
        id: d.id,
        name: String(d.get("name") ?? ""),
        role: String(d.get("role") ?? ""),
        company: String(d.get("company") ?? ""),
        project: String(d.get("project") ?? ""),
        quote: String(d.get("quote") ?? ""),
      }));
  } catch (err) {
    console.error("[testimonials] read failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

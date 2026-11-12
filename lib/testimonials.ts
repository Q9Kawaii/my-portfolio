// Testimonials: types and validation shared by the public form, the API route and the admin panel.
// Stored in Firestore "testimonials", written and read only through /api/testimonials (Admin SDK).

export type TestimonialStatus = "pending" | "approved" | "hidden";

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  project: string;
  quote: string;
  /** Private: only for confirming the testimonial is genuine. Never shown publicly. */
  email: string;
  status: TestimonialStatus;
  createdAt: string | null;
};

/** What the public site receives: no email, approved only. */
export type PublicTestimonial = Pick<Testimonial, "id" | "name" | "role" | "company" | "project" | "quote">;

export const T_LIMITS = { name: 80, role: 80, company: 80, project: 120, email: 200, quoteMin: 20, quote: 600 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type TestimonialInput = Pick<Testimonial, "name" | "role" | "company" | "project" | "quote" | "email">;

export function validateTestimonial(raw: unknown): { ok: true; data: TestimonialInput } | { ok: false; error: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
  const data = {
    name: str(r.name),
    role: str(r.role),
    company: str(r.company),
    project: str(r.project),
    quote: typeof r.quote === "string" ? r.quote.trim().replace(/\n{3,}/g, "\n\n") : "",
    email: str(r.email),
  };
  if (!data.name || !data.role || !data.quote || !data.email) return { ok: false, error: "Please fill in your name, role, email and testimonial." };
  if (data.name.length > T_LIMITS.name || data.role.length > T_LIMITS.role || data.company.length > T_LIMITS.company) {
    return { ok: false, error: "Name, role and company must each be under 80 characters." };
  }
  if (data.project.length > T_LIMITS.project) return { ok: false, error: "Project name is too long." };
  if (data.email.length > T_LIMITS.email || !EMAIL_RE.test(data.email)) return { ok: false, error: "Please enter a valid email address." };
  if (data.quote.length < T_LIMITS.quoteMin) return { ok: false, error: "Please write at least a sentence or two." };
  if (data.quote.length > T_LIMITS.quote) return { ok: false, error: `Please keep it under ${T_LIMITS.quote} characters.` };
  if (r.consent !== true) return { ok: false, error: "Please tick the box to confirm your words can be shown on the site." };
  return { ok: true, data };
}

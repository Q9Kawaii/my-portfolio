// Contact-form validation shared by the browser form and the /api/messages route.

export const CONTACT_LIMITS = { name: 100, email: 200, message: 5000 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type ContactInput = { name: string; email: string; message: string };

export function validateContact(
  raw: unknown,
): { ok: true; data: ContactInput } | { ok: false; error: string } {
  const r = (raw ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const data = { name: str(r.name), email: str(r.email), message: str(r.message) };

  if (!data.name || !data.email || !data.message) return { ok: false, error: "Please fill in every field." };
  if (data.name.length > CONTACT_LIMITS.name) return { ok: false, error: "Name is too long." };
  if (data.email.length > CONTACT_LIMITS.email || !EMAIL_RE.test(data.email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (data.message.length > CONTACT_LIMITS.message) {
    return { ok: false, error: `Message must be under ${CONTACT_LIMITS.message} characters.` };
  }
  return { ok: true, data };
}

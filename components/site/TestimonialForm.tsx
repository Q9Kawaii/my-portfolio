"use client";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { T_LIMITS, validateTestimonial } from "@/lib/testimonials";

const field = "mt-1.5 w-full border border-line bg-surface px-4 py-3 text-text focus:border-accent focus:outline-none";

export default function TestimonialForm() {
  const [state, setState] = useState<{ kind: "idle" | "sending" | "done" | "error"; msg?: string }>({ kind: "idle" });
  const [count, setCount] = useState(0);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      name: f.get("name"),
      role: f.get("role"),
      company: f.get("company"),
      project: f.get("project"),
      quote: f.get("quote"),
      email: f.get("email"),
      consent: f.get("consent") === "on",
      website: f.get("website"),
    };
    const v = validateTestimonial(payload);
    if (!v.ok) return setState({ kind: "error", msg: v.error });
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/testimonials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setState({ kind: "done" });
    } catch (err) {
      setState({ kind: "error", msg: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  if (state.kind === "done") {
    return (
      <div className="card p-8 text-center" aria-live="polite">
        <CheckCircle2 size={40} className="mx-auto text-accent" aria-hidden />
        <p className="h3 mt-4 text-2xl text-text">Thank you, that means a lot.</p>
        <p className="mt-2 text-muted">I&apos;ll review it and it will appear on the site soon. I may email you if anything needs checking.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      <label className="block">
        <span className="mono-label">Your name *</span>
        <input name="name" required maxLength={T_LIMITS.name} autoComplete="name" className={field} />
      </label>
      <label className="block">
        <span className="mono-label">Your role *</span>
        <input name="role" required maxLength={T_LIMITS.role} placeholder="Owner, Faculty Advisor, Manager…" className={field} />
      </label>
      <label className="block">
        <span className="mono-label">Company / organisation</span>
        <input name="company" maxLength={T_LIMITS.company} autoComplete="organization" className={field} />
      </label>
      <label className="block">
        <span className="mono-label">What we worked on</span>
        <input name="project" maxLength={T_LIMITS.project} placeholder="e.g. Clinic booking website" className={field} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mono-label">Your testimonial *</span>
        <textarea
          name="quote"
          required
          rows={5}
          maxLength={T_LIMITS.quote}
          onChange={(e) => setCount(e.target.value.length)}
          placeholder="What was it like working together? What changed after the project?"
          className={`${field} resize-y`}
        />
        <span className="mt-1 block text-right font-mono text-[0.7rem] text-muted">
          {count}/{T_LIMITS.quote}
        </span>
      </label>
      <label className="block sm:col-span-2">
        <span className="mono-label">Email * (private, never shown)</span>
        <input name="email" type="email" required maxLength={T_LIMITS.email} autoComplete="email" className={field} />
      </label>
      {/* Honeypot: hidden from people; bots tend to fill it. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="flex items-start gap-3 text-sm text-text sm:col-span-2">
        <input type="checkbox" name="consent" className="mt-1 size-4 accent-[var(--accent)]" />
        <span>I&apos;m happy for my name, role, company and words to be shown on yashdingar.in. I can ask for it to be removed at any time.</span>
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={state.kind === "sending"} className="btn btn-primary disabled:opacity-60">
          {state.kind === "sending" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Send size={16} aria-hidden />}
          {state.kind === "sending" ? "Sending…" : "Submit testimonial"}
        </button>
        <p role="status" aria-live="polite" className="text-sm font-medium text-danger">
          {state.kind === "error" && state.msg}
        </p>
      </div>
    </form>
  );
}

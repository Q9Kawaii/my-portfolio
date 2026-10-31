"use client";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { CONTACT_LIMITS, validateContact, type ContactInput } from "@/lib/contact";

type Status = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

const field =
  "w-full rounded-lg border border-line bg-surface-2 px-4 py-3 text-text placeholder:text-[#9aa4b5] focus:border-accent focus:outline-none";

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

/** Email via Web3Forms (browser-only on the free plan). */
async function sendEmail(data: ContactInput, botcheck: string) {
  if (!WEB3FORMS_KEY) throw new Error("Web3Forms key missing");
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `New portfolio message from ${data.name}`,
      from_name: "Portfolio contact form",
      replyto: data.email,
      botcheck,
      ...data,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || `Web3Forms ${res.status}`);
}

/** Backup copy in Firestore via our API route. */
async function saveCopy(data: ContactInput) {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(new Error(json.error || `Save failed (${res.status})`), { status: res.status });
  }
}

export default function ContactForm({ fallbackEmail }: { fallbackEmail: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form));
    const botcheck = typeof raw.botcheck === "string" ? raw.botcheck : "";

    // A filled honeypot means a bot: act as if it worked and send nothing.
    if (botcheck) {
      form.reset();
      setStatus({ kind: "ok", message: "Thanks! Your message is on its way." });
      return;
    }

    const parsed = validateContact(raw);
    if (!parsed.ok) {
      setStatus({ kind: "error", message: parsed.error });
      return;
    }

    setStatus({ kind: "sending" });
    const [mail, save] = await Promise.allSettled([sendEmail(parsed.data, botcheck), saveCopy(parsed.data)]);
    if (mail.status === "rejected") console.warn("[contact] email failed:", mail.reason);
    if (save.status === "rejected") console.warn("[contact] backup failed:", save.reason);

    // Either channel is enough: the message reached me.
    if (mail.status === "fulfilled" || save.status === "fulfilled") {
      form.reset();
      setStatus({ kind: "ok", message: "Thanks! Your message is on its way. I'll reply soon." });
      return;
    }
    const tooMany = save.status === "rejected" && (save.reason as { status?: number }).status === 429;
    setStatus({
      kind: "error",
      message: tooMany
        ? "Too many messages from this connection. Please try again later."
        : `Sorry, your message couldn't be sent. Please email me at ${fallbackEmail}.`,
    });
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4 rounded-2xl border border-line bg-surface p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text">Name</span>
          <input name="name" required maxLength={CONTACT_LIMITS.name} autoComplete="name" className={field} placeholder="Your name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text">Email</span>
          <input
            name="email"
            type="email"
            required
            maxLength={CONTACT_LIMITS.email}
            autoComplete="email"
            className={field}
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-text">Message</span>
        <textarea
          name="message"
          required
          maxLength={CONTACT_LIMITS.message}
          rows={5}
          className={`${field} resize-y`}
          placeholder="Tell me about the role or project…"
        />
      </label>
      {/* Honeypot (Web3Forms "botcheck"): hidden from people and screen readers; bots tend to tick it. */}
      <input type="checkbox" name="botcheck" value="1" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-bg transition hover:brightness-110 disabled:opacity-70 sm:w-auto"
      >
        {status.kind === "sending" ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <Send size={18} aria-hidden />}
        {status.kind === "sending" ? "Sending…" : "Send message"}
      </button>
      <p role="status" aria-live="polite" className={status.kind === "error" ? "text-danger" : "text-accent"}>
        {status.message}
      </p>
    </form>
  );
}

"use client";
import { Check, Copy, EyeOff, Loader2, Pencil, RefreshCw, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { deleteTestimonial, loadTestimonials, updateTestimonial } from "@/lib/admin-client";
import type { Testimonial, TestimonialStatus } from "@/lib/testimonials";
import type { Notify } from "./CollectionEditor";

const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const FILTERS: (TestimonialStatus | "all")[] = ["pending", "approved", "hidden", "all"];
const btn = "inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-text hover:border-accent disabled:opacity-60";

export default function TestimonialsPanel({ notify }: { notify: Notify }) {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; quote: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      loadTestimonials()
        .then(setItems)
        .catch((e) => {
          setItems([]);
          notify(e instanceof Error ? e.message : "Could not load testimonials.", "error");
        }),
    [notify],
  );
  useEffect(() => {
    reload();
  }, [reload]);

  const act = async (t: Testimonial, fn: () => Promise<unknown>, patch: Partial<Testimonial> | null, msg: string) => {
    setBusy(t.id);
    try {
      await fn();
      setItems((list) => (patch ? list!.map((x) => (x.id === t.id ? { ...x, ...patch } : x)) : list!.filter((x) => x.id !== t.id)));
      notify(msg);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Update failed.", "error");
    } finally {
      setBusy(null);
      setEditing(null);
      setConfirmDelete(null);
    }
  };

  const link = typeof window !== "undefined" ? `${window.location.origin}/testimonial` : "/testimonial";

  if (!items) {
    return (
      <p className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" aria-hidden /> Loading…
      </p>
    );
  }
  const shown = filter === "all" ? items : items.filter((t) => t.status === filter);
  const count = (s: TestimonialStatus) => items.filter((t) => t.status === s).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-text">
          Testimonials{" "}
          <span className="font-mono text-base font-normal text-muted">
            {count("pending")} pending / {count("approved")} live
          </span>
        </h2>
        <button type="button" onClick={() => { setItems(null); reload(); }} className={btn}>
          <RefreshCw size={15} aria-hidden /> Refresh
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 border border-line bg-surface p-4 text-sm text-text">
        <span>Send clients this link:</span>
        <code className="break-all font-mono text-accent">{link}</code>
        <button
          type="button"
          className={btn}
          onClick={() => navigator.clipboard.writeText(link).then(() => notify("Link copied."), () => notify("Couldn't copy.", "error"))}
        >
          <Copy size={14} aria-hidden /> Copy
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filter">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${filter === f ? "border-accent text-accent" : "border-line text-text"}`}
          >
            {f} {f !== "all" && `(${count(f)})`}
          </button>
        ))}
      </div>

      {shown.length === 0 && <p className="text-muted">Nothing here yet.</p>}

      <ul className="space-y-3">
        {shown.map((t) => (
          <li key={t.id} className={`border-2 bg-surface p-5 shadow-hard ${t.status === "pending" ? "border-accent" : "border-line"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-text">
                  {t.name} <span className="font-normal text-muted">· {[t.role, t.company].filter(Boolean).join(", ")}</span>
                </p>
                <a href={`mailto:${t.email}`} className="break-all text-sm text-accent hover:underline">
                  {t.email}
                </a>
                {t.project && <p className="text-sm text-muted">Project: {t.project}</p>}
              </div>
              <p className="flex items-center gap-2 font-mono text-xs text-muted">
                <span className={`rounded-full px-2 py-0.5 font-semibold uppercase ${t.status === "approved" ? "bg-accent text-bg" : "border border-line"}`}>{t.status}</span>
                {t.createdAt ? fmt.format(new Date(t.createdAt)) : ""}
              </p>
            </div>

            {editing?.id === t.id ? (
              <textarea
                value={editing.quote}
                onChange={(e) => setEditing({ id: t.id, quote: e.target.value })}
                rows={5}
                className="mt-3 w-full border border-line bg-bg p-3 text-text focus:border-accent focus:outline-none"
              />
            ) : (
              <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-text">&ldquo;{t.quote}&rdquo;</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {editing?.id === t.id ? (
                <>
                  <button type="button" disabled={busy === t.id} className={btn} onClick={() => act(t, () => updateTestimonial(t.id, { quote: editing.quote }), { quote: editing.quote.trim() }, "Saved.")}>
                    <Check size={15} aria-hidden /> Save text
                  </button>
                  <button type="button" className={btn} onClick={() => setEditing(null)}>
                    <X size={15} aria-hidden /> Cancel
                  </button>
                </>
              ) : (
                <>
                  {t.status !== "approved" && (
                    <button type="button" disabled={busy === t.id} className={`${btn} border-accent text-accent`} onClick={() => act(t, () => updateTestimonial(t.id, { status: "approved" }), { status: "approved" }, "Approved: it's now on the site.")}>
                      <Check size={15} aria-hidden /> Approve
                    </button>
                  )}
                  {t.status !== "hidden" && (
                    <button type="button" disabled={busy === t.id} className={btn} onClick={() => act(t, () => updateTestimonial(t.id, { status: "hidden" }), { status: "hidden" }, "Hidden from the site.")}>
                      <EyeOff size={15} aria-hidden /> Hide
                    </button>
                  )}
                  <button type="button" className={btn} onClick={() => setEditing({ id: t.id, quote: t.quote })}>
                    <Pencil size={15} aria-hidden /> Fix typos
                  </button>
                  {confirmDelete === t.id ? (
                    <>
                      <button type="button" disabled={busy === t.id} className={`${btn} border-danger text-danger`} onClick={() => act(t, () => deleteTestimonial(t.id), null, "Deleted.")}>
                        <Trash2 size={15} aria-hidden /> Confirm delete
                      </button>
                      <button type="button" className={btn} onClick={() => setConfirmDelete(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button type="button" className={btn} onClick={() => setConfirmDelete(t.id)}>
                      <Trash2 size={15} aria-hidden /> Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

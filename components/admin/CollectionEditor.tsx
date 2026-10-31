"use client";
import { ChevronDown, ChevronUp, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  deleteItem,
  deleteUploaded,
  loadItems,
  newId,
  publish,
  saveItem,
  saveOrder,
  type CollectionKey,
} from "@/lib/admin-client";

type Item = { id: string; order: number } & Record<string, unknown>;
export type Notify = (msg: string, kind?: "ok" | "error") => void;

/** Trims string arrays and drops empty entries before saving. */
function clean<T extends Item>(item: T): T {
  const out: Record<string, unknown> = { ...item };
  for (const [k, v] of Object.entries(out)) {
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      out[k] = (v as string[]).map((s) => s.trim()).filter(Boolean);
    }
  }
  return out as T;
}

export default function CollectionEditor<T extends Item>({
  collectionKey,
  title,
  blank,
  itemTitle,
  badges,
  renderFields,
  mediaKeys = [],
  notify,
}: {
  collectionKey: CollectionKey;
  title: string;
  blank: () => Omit<T, "id" | "order">;
  itemTitle: (item: T) => string;
  badges?: (item: T) => ReactNode;
  renderFields: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  /** Fields holding uploaded files, removed from Blob when the item is deleted. */
  mediaKeys?: (keyof T)[];
  notify: Notify;
}) {
  const [items, setItems] = useState<T[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadItems<T>(collectionKey)
      .then(setItems)
      .catch(() => notify(`Could not load ${title.toLowerCase()}.`, "error"));
  }, [collectionKey, title, notify]);

  if (!items) {
    return (
      <p className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" aria-hidden /> Loading…
      </p>
    );
  }

  const update = (id: string, patch: Partial<T>) => {
    setItems((list) => list!.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    setDirty((d) => new Set(d).add(id));
  };

  const add = () => {
    const item = { ...blank(), id: newId(), order: items.length + 1 } as T;
    setItems([...items, item]);
    setDirty((d) => new Set(d).add(item.id));
    setOpen(item.id);
  };

  const save = async (item: T) => {
    setBusy(item.id);
    try {
      await saveItem(collectionKey, clean(item));
      setDirty((d) => {
        const n = new Set(d);
        n.delete(item.id);
        return n;
      });
      await publish();
      notify(`Saved "${itemTitle(item)}". The live site is updated.`);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Save failed.", "error");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (item: T) => {
    setBusy(item.id);
    try {
      await deleteItem(collectionKey, item.id);
      await Promise.all(mediaKeys.map((k) => deleteUploaded(String(item[k] ?? ""))));
      setItems(items.filter((it) => it.id !== item.id));
      await publish();
      notify(`Deleted "${itemTitle(item)}".`);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Delete failed.", "error");
    } finally {
      setBusy(null);
      setConfirmDelete(null);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[index], next[j]] = [next[j], next[index]];
    const reordered = next.map((it, i) => ({ ...it, order: i + 1 }));
    setItems(reordered);
    // Unsaved new items don't exist in Firestore yet; only persist order for saved ones.
    const persisted = reordered.filter((it) => !dirty.has(it.id));
    try {
      await saveOrder(collectionKey, persisted);
      await publish();
      notify("Order updated.");
    } catch {
      notify("Could not save the new order. Save each item first.", "error");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-text">{title}</h2>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-bg hover:brightness-110"
        >
          <Plus size={18} aria-hidden /> Add
        </button>
      </div>

      {items.length === 0 && <p className="text-muted">Nothing here yet.</p>}

      <ol className="space-y-3">
        {items.map((item, i) => {
          const isOpen = open === item.id;
          const isDirty = dirty.has(item.id);
          return (
            <li key={item.id} className="rounded-xl border border-line bg-surface">
              <div className="flex items-center gap-2 p-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    aria-label={`Move ${itemTitle(item)} up`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="rounded p-1 text-text hover:bg-surface-2 disabled:opacity-30"
                  >
                    <ChevronUp size={16} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${itemTitle(item)} down`}
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                    className="rounded p-1 text-text hover:bg-surface-2 disabled:opacity-30"
                  >
                    <ChevronDown size={16} aria-hidden />
                  </button>
                </div>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="flex min-w-0 flex-1 flex-wrap items-center gap-2 rounded-lg px-2 py-2 text-left hover:bg-surface-2"
                >
                  <span className="font-mono text-sm text-muted">{i + 1}.</span>
                  <span className="truncate font-medium text-text">{itemTitle(item) || "Untitled"}</span>
                  {badges?.(item)}
                  {isDirty && (
                    <span className="rounded-full bg-[#facc15] px-2 py-0.5 text-xs font-semibold text-bg">Unsaved</span>
                  )}
                </button>
              </div>

              {isOpen && (
                <div className="space-y-4 border-t border-line p-4 sm:p-5">
                  {renderFields(item, (patch) => update(item.id, patch))}
                  <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                    <button
                      type="button"
                      disabled={busy === item.id}
                      onClick={() => save(item)}
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-bg hover:brightness-110 disabled:opacity-60"
                    >
                      {busy === item.id ? (
                        <Loader2 size={16} className="animate-spin" aria-hidden />
                      ) : (
                        <Save size={16} aria-hidden />
                      )}
                      Save & publish
                    </button>
                    {confirmDelete === item.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => remove(item)}
                          className="inline-flex items-center gap-2 rounded-lg bg-danger px-4 py-2 font-semibold text-bg"
                        >
                          <Trash2 size={16} aria-hidden /> Confirm delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(null)}
                          className="rounded-lg border border-line px-4 py-2 text-text"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(item.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-text hover:border-danger"
                      >
                        <Trash2 size={16} aria-hidden /> Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

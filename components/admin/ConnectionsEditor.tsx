"use client";
import { Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteItem,
  importGraphDefaults,
  loadAll,
  newId,
  publish,
  saveItem,
} from "@/lib/admin-client";
import { buildGraph, GROUP_COLORS, GROUPS, type GraphNode } from "@/lib/graph";
import type { PortfolioContent } from "@/lib/types";
import type { Notify } from "./CollectionEditor";
import { inputCls, TextField } from "./fields";

function NodeSelect({
  label,
  value,
  onChange,
  nodes,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  nodes: GraphNode[];
}) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        <option value="">Choose…</option>
        {GROUPS.map((g) => {
          const list = nodes.filter((n) => n.group === g);
          return list.length ? (
            <optgroup key={g} label={g}>
              {list.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </optgroup>
          ) : null;
        })}
      </select>
    </label>
  );
}

/** Manual knowledge-graph links. Tag-based links are created automatically from each item's tags/tech. */
export default function ConnectionsEditor({ notify }: { notify: Notify }) {
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      loadAll()
        .then(setContent)
        .catch(() => notify("Could not load content.", "error")),
    [notify],
  );
  useEffect(() => {
    reload();
  }, [reload]);

  const graph = useMemo(() => (content ? buildGraph(content) : null), [content]);
  const byId = useMemo(() => new Map(graph?.nodes.map((n) => [n.id, n]) ?? []), [graph]);

  if (!content || !graph) {
    return (
      <p className="flex items-center gap-2 text-muted">
        <Loader2 size={18} className="animate-spin" aria-hidden /> Loading…
      </p>
    );
  }

  const links = content.graphLinks;
  const manualKeys = new Set(links.map((l) => [l.source, l.target].sort().join("|")));
  const tagLinks = graph.edges.filter(
    (e) => e.kind === "cross" && !manualKeys.has([e.source, e.target].sort().join("|")),
  ).length;
  const selectable = graph.nodes.filter((n) => n.group !== "Yash");

  const add = async () => {
    if (!from || !to || from === to) return;
    setBusy("add");
    try {
      await saveItem("graphLinks", { id: newId(), order: links.length + 1, source: from, target: to, label: label.trim() });
      await publish();
      setFrom("");
      setTo("");
      setLabel("");
      await reload();
      notify("Connection added.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Could not add connection.", "error");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setBusy(id);
    try {
      await deleteItem("graphLinks", id);
      await publish();
      await reload();
      notify("Connection removed.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Could not remove connection.", "error");
    } finally {
      setBusy(null);
    }
  };

  const importDefaults = async () => {
    setBusy("import");
    try {
      const n = await importGraphDefaults();
      await publish();
      await reload();
      notify(n ? `Imported ${n} graph update${n === 1 ? "" : "s"}.` : "Already up to date.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Import failed.", "error");
    } finally {
      setBusy(null);
    }
  };

  const chip = (id: string) => {
    const n = byId.get(id);
    return (
      <span className="inline-flex items-center gap-1.5 text-text">
        <span aria-hidden className="size-2.5 rounded-full" style={{ background: n ? GROUP_COLORS[n.group] : "#ff8a8a" }} />
        {n?.label ?? <span className="text-danger">{id} (missing)</span>}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-text">Graph connections</h2>
        <button
          type="button"
          onClick={importDefaults}
          disabled={busy === "import"}
          className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-semibold text-text hover:border-accent disabled:opacity-60"
        >
          {busy === "import" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Wand2 size={16} aria-hidden />}
          Import default connections
        </button>
      </div>
      <p className="max-w-3xl text-muted">
        Projects, awards and education link to skills automatically through their <strong className="text-text">tech</strong> /{" "}
        <strong className="text-text">tags</strong> fields ({tagLinks} links right now). Add manual connections here for
        anything else, such as a project that grew out of another. Importing defaults only adds what&apos;s missing and
        never overwrites your edits.
      </p>

      <fieldset className="space-y-4 rounded-xl border border-line bg-surface p-5">
        <legend className="px-1 font-display text-lg font-semibold text-text">Add a connection</legend>
        <div className="flex flex-col gap-4 sm:flex-row">
          <NodeSelect label="From" value={from} onChange={setFrom} nodes={selectable} />
          <NodeSelect label="To" value={to} onChange={setTo} nodes={selectable} />
        </div>
        <TextField label="Label (optional)" placeholder="e.g. Built for, Applied in" value={label} onChange={setLabel} />
        <button
          type="button"
          onClick={add}
          disabled={!from || !to || from === to || busy === "add"}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-bg hover:brightness-110 disabled:opacity-50"
        >
          {busy === "add" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Plus size={16} aria-hidden />}
          Add & publish
        </button>
      </fieldset>

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold text-text">Manual connections ({links.length})</h3>
        {links.length === 0 ? (
          <p className="text-muted">None yet.</p>
        ) : (
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3">
                {chip(l.source)}
                <span className="text-muted" aria-label="connects to">
                  →
                </span>
                {chip(l.target)}
                {l.label && <span className="font-mono text-xs text-muted">{l.label}</span>}
                <button
                  type="button"
                  onClick={() => remove(l.id)}
                  disabled={busy === l.id}
                  aria-label="Delete connection"
                  className="ml-auto rounded-lg border border-line p-2 text-text hover:border-danger disabled:opacity-60"
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

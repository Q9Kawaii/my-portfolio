"use client";
import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { GROUP_COLORS, GROUPS, neighbours, type GraphData } from "@/lib/graph";

/** Accessible, lightweight alternative to the canvas graph. */
export default function GraphList({ data }: { data: GraphData }) {
  const [query, setQuery] = useState("");
  const adj = useMemo(() => neighbours(data), [data]);
  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);
  const q = query.trim().toLowerCase();

  return (
    <div>
      <label className="relative block max-w-md">
        <span className="sr-only">Filter the list</span>
        <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter…"
          className="w-full rounded-lg border border-line bg-surface-2 py-2 pl-9 pr-3 text-text placeholder:text-[#9aa4b5] focus:border-accent focus:outline-none"
        />
      </label>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {GROUPS.map((g) => {
          const nodes = data.nodes.filter((n) => n.group === g && (!q || n.label.toLowerCase().includes(q)));
          if (!nodes.length) return null;
          return (
            <section key={g} aria-labelledby={`gl-${g}`} className="rounded-2xl border border-line bg-surface p-5">
              <h3 id={`gl-${g}`} className="flex items-center gap-2 font-display text-lg font-semibold text-text">
                <span aria-hidden className="size-3 rounded-full" style={{ background: GROUP_COLORS[g] }} /> {g}
              </h3>
              <ul className="mt-3 space-y-3">
                {nodes.map((n) => {
                  const links = [...(adj.get(n.id) ?? [])].filter((id) => id !== "yash").map((id) => byId.get(id)!.label);
                  return (
                    <li key={n.id}>
                      <p className="font-medium text-text">
                        {n.url ? (
                          <a href={n.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
                            {n.label} <ArrowUpRight size={14} aria-hidden />
                          </a>
                        ) : (
                          n.label
                        )}
                        {n.year && <span className="ml-2 font-mono text-xs text-muted">{n.year}</span>}
                      </p>
                      {links.length > 0 && <p className="text-sm text-muted">Connected to: {links.join(", ")}</p>}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

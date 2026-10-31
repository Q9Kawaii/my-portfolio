"use client";
import dynamic from "next/dynamic";
import { List, Network } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GraphData } from "@/lib/graph";
import GraphList from "./GraphList";

function Placeholder() {
  return (
    <div className="grid h-[440px] place-items-center rounded-2xl border border-line bg-[#090b11] text-muted sm:h-[560px]">
      Loading graph…
    </div>
  );
}

// d3 + the canvas renderer only load when the section approaches the viewport.
const GraphExplorer = dynamic(() => import("./GraphExplorer"), { ssr: false, loading: Placeholder });

/** Very low-end devices get the list view by default. */
function prefersList() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return true;
  if ((nav.deviceMemory ?? 8) <= 2 && (nav.hardwareConcurrency ?? 8) <= 4) return true;
  return !document.createElement("canvas").getContext("2d");
}

export default function GraphLoader({ data }: { data: GraphData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [view, setView] = useState<"graph" | "list">("graph");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (prefersList()) setView("list");
        setNear(true);
        io.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const tab = (v: "graph" | "list", label: string, Icon: typeof List) => (
    <button
      type="button"
      onClick={() => setView(v)}
      aria-pressed={view === v}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium ${
        view === v ? "bg-accent text-bg" : "text-text hover:bg-surface-2"
      }`}
    >
      <Icon size={16} aria-hidden /> {label}
    </button>
  );

  return (
    <div ref={ref}>
      <div className="mb-4 inline-flex rounded-lg border border-line bg-surface p-1" aria-label="View">
        {tab("graph", "Graph", Network)}
        {tab("list", "List", List)}
      </div>
      {view === "list" ? <GraphList data={data} /> : near ? <GraphExplorer data={data} /> : <Placeholder />}
    </div>
  );
}

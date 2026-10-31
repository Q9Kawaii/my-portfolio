"use client";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { drag as d3drag } from "d3-drag";
import { select } from "d3-selection";
import {
  zoom as d3zoom,
  zoomIdentity,
  type ZoomBehavior,
  type ZoomTransform,
} from "d3-zoom";
import { ArrowUpRight, RotateCcw, Route, Search, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GROUP_COLORS,
  GROUPS,
  neighbours,
  shortestPath,
  type GraphData,
  type GraphEdge,
  type GraphNode,
  type NodeGroup,
} from "@/lib/graph";

type SimNode = GraphNode & SimulationNodeDatum;
type SimLink = SimulationLinkDatum<SimNode> & GraphEdge & { key: string };
type DragSubject = { node: SimNode; x: number; y: number };

const BG = "#07080c";
const TEXT = "#f5f7fb";
const edgeKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const idOf = (v: string | SimNode | number | undefined) =>
  typeof v === "object" ? v.id : String(v);

function GroupDot({ group }: { group: NodeGroup }) {
  return (
    <span
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ background: GROUP_COLORS[group] }}
    />
  );
}

export default function GraphExplorer({ data }: { data: GraphData }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hidden, setHidden] = useState<Set<NodeGroup>>(new Set());
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [traceOpen, setTraceOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const byId = useMemo(() => new Map(data.nodes.map((n) => [n.id, n])), [data]);
  const adj = useMemo(() => neighbours(data), [data]);
  const edgeLabels = useMemo(
    () =>
      new Map(data.edges.map((e) => [edgeKey(e.source, e.target), e.label])),
    [data],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      data.nodes
        .filter(
          (n) =>
            (n.group === "Yash" || !hidden.has(n.group)) &&
            n.label.toLowerCase().includes(q),
        )
        .map((n) => n.id),
    );
  }, [query, data, hidden]);

  const path = useMemo(() => {
    if (!from || !to) return null;
    // Prefer routes that don't just hop through the centre node.
    return (
      shortestPath(adj, from, to, new Set(["yash"])) ??
      shortestPath(adj, from, to)
    );
  }, [adj, from, to]);

  // Everything the canvas needs, readable from d3 callbacks without re-binding them.
  const view = useRef({
    hidden,
    matches,
    selected,
    path: path as string[] | null,
    hover: null as string | null,
  });

  const engine = useRef<{
    sim: Simulation<SimNode, SimLink>;
    nodes: SimNode[];
    links: SimLink[];
    zoom: ZoomBehavior<HTMLCanvasElement, unknown>;
    t: ZoomTransform;
    w: number;
    h: number;
    font: string;
    reduce: boolean;
    /** Releases dragged nodes and re-runs the layout. */
    relayout: () => void;
  } | null>(null);

  const isVisible = (n: GraphNode) =>
    n.group === "Yash" || !view.current.hidden.has(n.group);
  const radius = (n: GraphNode, k: number) =>
    (n.group === "Yash" ? 16 : n.major ? 9 : 5.5) *
    Math.min(Math.max(Math.sqrt(k), 0.75), 1.5);

  const draw = useCallback(() => {
    const e = engine.current;
    const canvas = canvasRef.current;
    if (!e || !canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const { t, w, h } = e;
    const v = view.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const active = v.hover ?? v.selected;
    const pathEdges = new Set<string>();
    if (v.path)
      for (let i = 1; i < v.path.length; i++)
        pathEdges.add(edgeKey(v.path[i - 1], v.path[i]));
    let focus: Set<string> | null = null;
    if (v.path) focus = new Set(v.path);
    else if (active) focus = new Set([active, ...(adj.get(active) ?? [])]);
    else if (v.matches) focus = v.matches;

    // Edges
    for (const l of e.links) {
      const s = l.source as SimNode;
      const d = l.target as SimNode;
      if (!isVisible(s) || !isVisible(d)) continue;
      const onPath = pathEdges.has(l.key);
      const lit =
        onPath || (!v.path && !!active && (s.id === active || d.id === active));
      const dim = !!focus && !lit;
      ctx.beginPath();
      ctx.moveTo(t.applyX(s.x!), t.applyY(s.y!));
      ctx.lineTo(t.applyX(d.x!), t.applyY(d.y!));
      ctx.setLineDash(l.kind === "cross" ? [5, 5] : []);
      if (onPath) {
        ctx.strokeStyle = "#fcd34d";
        ctx.lineWidth = 3;
      } else if (lit) {
        ctx.strokeStyle = GROUP_COLORS[(s.id === active ? d : s).group];
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle =
          l.kind === "cross"
            ? "rgba(214,222,240,0.30)"
            : "rgba(157,178,255,0.30)";
        ctx.lineWidth = 1;
        if (dim) ctx.strokeStyle = "rgba(157,178,255,0.07)";
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Nodes
    const labels: { n: SimNode; x: number; y: number; r: number }[] = [];
    for (const n of e.nodes) {
      if (!isVisible(n)) continue;
      const x = t.applyX(n.x!);
      const y = t.applyY(n.y!);
      if (x < -40 || y < -40 || x > w + 40 || y > h + 40) continue;
      const r = radius(n, t.k);
      const dim = !!focus && !focus.has(n.id);
      ctx.globalAlpha = dim ? 0.18 : 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = GROUP_COLORS[n.group];
      ctx.fill();
      if (n.group === "Yash") {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#7cf0c5";
        ctx.stroke();
      }
      if (
        n.id === v.selected ||
        n.id === v.hover ||
        (v.matches?.has(n.id) && !v.path)
      ) {
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = TEXT;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // Zoom-aware labels keep small screens readable: hubs first, projects next, skills last.
      const hub = n.id.startsWith("skillgroup:") || n.group === "Education";
      const showLabel =
        !dim &&
        (n.group === "Yash" ||
          !!focus?.has(n.id) ||
          (hub && t.k >= 0.35) ||
          (n.major && t.k >= 0.8) ||
          t.k >= 1.6);
      if (showLabel) labels.push({ n, x, y, r });
    }

    // Labels on top, with a dark halo for contrast.
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineJoin = "round";
    for (const { n, x, y, r } of labels) {
      const big = n.group === "Yash";
      ctx.font = `${big ? 700 : 600} ${big ? 15 : 12}px ${e.font}`;
      // Keep labels inside the canvas so long names near the edge stay readable.
      const half = ctx.measureText(n.label).width / 2 + 4;
      const lx = Math.min(Math.max(x, half), w - half);
      ctx.lineWidth = 4;
      ctx.strokeStyle = BG;
      ctx.strokeText(n.label, lx, y + r + 4);
      ctx.fillStyle = TEXT;
      ctx.fillText(n.label, lx, y + r + 4);
    }
    // isVisible/radius only read refs, so draw is stable for a given adjacency.
  }, [adj]);

  const hit = useCallback((px: number, py: number): SimNode | null => {
    const e = engine.current;
    if (!e) return null;
    let best: SimNode | null = null;
    let bestD = Infinity;
    for (const n of e.nodes) {
      if (!isVisible(n)) continue;
      const dx = e.t.applyX(n.x!) - px;
      const dy = e.t.applyY(n.y!) - py;
      const d = Math.hypot(dx, dy);
      if (d < radius(n, e.t.k) + 8 && d < bestD) {
        best = n;
        bestD = d;
      }
    }
    return best;
  }, []);

  /** Zooms to fit all visible nodes, or just `only` (e.g. a traced path). */
  const fit = useCallback((only?: string[]) => {
    const e = engine.current;
    const canvas = canvasRef.current;
    if (!e || !canvas) return;
    const pts = only
      ? e.nodes.filter((n) => only.includes(n.id))
      : e.nodes.filter(isVisible);
    if (!pts.length) return;
    const xs = pts.map((n) => n.x!);
    const ys = pts.map((n) => n.y!);
    const [x0, x1, y0, y1] = [
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys),
    ];
    // Pad for labels drawn below nodes.
    const k = Math.min(
      Math.max(Math.min(e.w / (x1 - x0 + 80), e.h / (y1 - y0 + 90)), 0.3),
      1.6,
    );
    const t = zoomIdentity
      .translate(e.w / 2 - (k * (x0 + x1)) / 2, e.h / 2 - (k * (y0 + y1)) / 2)
      .scale(k);
    select(canvas).call(e.zoom.transform, t);
  }, []);

  const centerOn = useCallback((id: string) => {
    const e = engine.current;
    const canvas = canvasRef.current;
    const n = e?.nodes.find((x) => x.id === id);
    if (!e || !canvas || !n) return;
    const k = Math.max(e.t.k, 1.2);
    select(canvas).call(
      e.zoom.transform,
      zoomIdentity.translate(e.w / 2 - k * n.x!, e.h / 2 - k * n.y!).scale(k),
    );
  }, []);

  // Build the simulation once per dataset.
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const nodes: SimNode[] = data.nodes.map((n) => ({
      ...n,
      ...(n.id === "yash" ? { fx: 0, fy: 0 } : {}),
    }));
    const links: SimLink[] = data.edges.map((e) => ({
      ...e,
      key: edgeKey(e.source, e.target),
    }));
    const sim = forceSimulation<SimNode, SimLink>(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((l) =>
            l.kind === "cross" ? 170 : idOf(l.source) === "yash" ? 175 : 52,
          )
          .strength((l) => (l.kind === "cross" ? 0.03 : 0.8)),
      )
      .force(
        "charge",
        forceManyBody<SimNode>().strength((n) => (n.major ? -560 : -130)),
      )
      .force(
        "collide",
        forceCollide<SimNode>((n) =>
          n.group === "Yash" ? 40 : n.major ? 30 : 13,
        ),
      )
      .force("x", forceX(0).strength(0.012))
      .force("y", forceY(0).strength(0.09))
      .stop();
    sim.tick(320); // settle before the first paint so it doesn't explode on screen

    const zoom = d3zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.25, 4])
      // Touch: one finger scrolls the page (or drags a node); two fingers pinch/pan the graph.
      .filter((ev: Event) => {
        if (ev.type === "touchstart")
          return (ev as TouchEvent).touches.length > 1;
        if (ev.type === "wheel") return true;
        return !(ev as MouseEvent).ctrlKey && !(ev as MouseEvent).button;
      })
      .on("zoom", (ev) => {
        if (engine.current) engine.current.t = ev.transform;
        draw();
      });

    const font = getComputedStyle(document.body).fontFamily || "sans-serif";
    const relayout = () => {
      for (const n of nodes) {
        // The centre node is pinned at the origin; everything else is released.
        n.fx = n.id === "yash" ? 0 : null;
        n.fy = n.id === "yash" ? 0 : null;
      }
      if (reduce) sim.tick(200);
      else sim.alpha(0.4).restart();
    };
    engine.current = {
      sim,
      nodes,
      links,
      zoom,
      t: zoomIdentity,
      w: 0,
      h: 0,
      font,
      reduce,
      relayout,
    };

    const resize = () => {
      const w = wrap.clientWidth;
      const h = w < 640 ? Math.min(520, Math.round(w * 1.35)) : 560;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      const first = engine.current!.w === 0;
      engine.current!.w = w;
      engine.current!.h = h;
      if (first) fit();
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const dragBehaviour = d3drag<
      HTMLCanvasElement,
      unknown,
      DragSubject | null
    >()
      .subject((ev) => {
        const n = hit(ev.x, ev.y);
        return n ? { node: n, x: ev.x, y: ev.y } : null;
      })
      .on("start", (ev) => {
        const n = ev.subject!.node;
        if (!ev.active && !reduce) sim.alphaTarget(0.25).restart();
        n.fx = n.x;
        n.fy = n.y;
      })
      .on("drag", (ev) => {
        const n = ev.subject!.node;
        const [gx, gy] = engine.current!.t.invert([ev.x, ev.y]);
        n.fx = gx;
        n.fy = gy;
        if (reduce) {
          n.x = gx;
          n.y = gy;
          draw();
        }
      })
      .on("end", (ev) => {
        const n = ev.subject!.node;
        if (!ev.active) sim.alphaTarget(0);
        if (n.id !== "yash" && !reduce) {
          n.fx = null;
          n.fy = null;
        }
      });

    const sel = select(canvas);
    sel.call(dragBehaviour).call(zoom).on("dblclick.zoom", null);
    sim.on("tick", draw);
    if (!reduce) sim.alpha(0.08).restart();

    return () => {
      ro.disconnect();
      sim.stop();
      sel.on(".zoom", null).on(".drag", null);
      engine.current = null;
    };
  }, [data, draw, fit, hit]);

  // Bring a newly traced path into view.
  useEffect(() => {
    if (path && path.length > 1) fit(path);
  }, [path, fit]);

  // Sync view state for the canvas and repaint whenever filters, search, selection or path change.
  useLayoutEffect(() => {
    Object.assign(view.current, { hidden, matches, selected, path });
    draw();
  }, [hidden, matches, selected, path, draw]);

  const toggleGroup = (g: NodeGroup) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });

  const selectNode = (id: string | null) => {
    setSelected(id);
    if (id) centerOn(id);
  };

  const reset = () => {
    setHidden(new Set());
    setQuery("");
    setSelected(null);
    setFrom("");
    setTo("");
    engine.current?.relayout();
    requestAnimationFrame(() => fit());
  };

  const sel = selected ? byId.get(selected) : null;
  const linked = sel
    ? [...(adj.get(sel.id) ?? [])]
        .map((id) => byId.get(id)!)
        .sort((a, b) => a.group.localeCompare(b.group))
    : [];
  const groupCounts = useMemo(() => {
    const c: Partial<Record<NodeGroup, number>> = {};
    for (const n of data.nodes) c[n.group] = (c[n.group] ?? 0) + 1;
    return c;
  }, [data]);
  const optionGroups = GROUPS.map((g) => ({
    g,
    nodes: data.nodes.filter((n) => n.group === g),
  }));

  const nodeSelect = (
    value: string,
    onChange: (v: string) => void,
    label: string,
  ) => (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm text-text">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-text focus:border-accent focus:outline-none"
      >
        <option value="">Choose a node…</option>
        <option value="yash">{byId.get("yash")?.label} (centre)</option>
        {optionGroups.map(({ g, nodes }) =>
          nodes.length ? (
            <optgroup key={g} label={g}>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </optgroup>
          ) : null,
        )}
      </select>
    </label>
  );

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-[200px] flex-1">
            <span className="sr-only">Search nodes</span>
            <Search
              size={16}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches?.size)
                  selectNode([...matches][0]);
              }}
              placeholder="Search skills, projects, awards…"
              className="w-full rounded-lg border border-line bg-surface-2 py-2 pl-9 pr-3 text-text placeholder:text-[#9aa4b5] focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setTraceOpen((v) => !v)}
            aria-expanded={traceOpen}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
              traceOpen
                ? "border-accent text-accent"
                : "border-line text-text hover:border-accent"
            }`}
          >
            <Route size={16} aria-hidden /> Trace path
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-text hover:border-accent"
          >
            <RotateCcw size={16} aria-hidden /> Reset
          </button>
        </div>
        {query && (
          <p className="text-sm text-muted" aria-live="polite">
            {matches?.size ?? 0} match{matches?.size === 1 ? "" : "es"}
            {matches?.size ? ". Press Enter to open the first." : ""}
          </p>
        )}

        <ul className="flex flex-wrap gap-2" aria-label="Filter groups">
          {GROUPS.filter((g) => groupCounts[g]).map((g) => {
            const on = !hidden.has(g);
            return (
              <li key={g}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleGroup(g)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                    on
                      ? "border-line bg-surface-2 text-text"
                      : "border-line/60 text-muted line-through"
                  }`}
                >
                  <GroupDot group={g} /> {g}
                  <span className="font-mono text-xs text-muted">
                    {groupCounts[g]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {traceOpen && (
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              {nodeSelect(from, setFrom, "From")}
              {nodeSelect(to, setTo, "To")}
            </div>
            {from && to && (
              <div className="mt-3 text-sm" aria-live="polite">
                {path ? (
                  <ol className="flex flex-wrap items-center gap-1.5">
                    {path.map((id, i) => (
                      <li key={id} className="flex items-center gap-1.5">
                        {i > 0 && (
                          <span
                            className="text-muted"
                            title={
                              edgeLabels.get(edgeKey(path[i - 1], id)) ?? ""
                            }
                          >
                            →
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => selectNode(id)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#fcd34d]/70 px-2.5 py-1 text-text hover:bg-surface-2"
                        >
                          <GroupDot group={byId.get(id)!.group} />{" "}
                          {byId.get(id)!.label}
                        </button>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-text">These two aren&apos;t connected.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Canvas + details */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <div
            ref={wrapRef}
            className="relative overflow-hidden rounded-2xl border border-line bg-[#090b11]"
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={`Knowledge graph with ${data.nodes.length} nodes and ${data.edges.length} connections. Use search or the list view to explore it without a pointer.`}
              className="block w-full cursor-grab touch-pan-y active:cursor-grabbing"
              onClick={(e) => {
                const n = hit(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setSelected(n?.id ?? null);
              }}
              onPointerMove={(e) => {
                if (e.pointerType !== "mouse") return;
                const n = hit(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                if ((n?.id ?? null) !== view.current.hover) {
                  view.current.hover = n?.id ?? null;
                  e.currentTarget.style.cursor = n ? "pointer" : "";
                  draw();
                }
              }}
              onPointerLeave={() => {
                view.current.hover = null;
                draw();
              }}
            />
          </div>

          <p className="mt-2 font-mono text-xs text-muted">
            Drag nodes · scroll or pinch (two fingers) to zoom · drag the
            background to pan · dashed lines are cross-links
          </p>
        </div>

        <aside
          aria-label="Node details"
          aria-live="polite"
          className="rounded-2xl border border-line bg-surface p-5 lg:max-h-[560px] lg:overflow-y-auto"
        >
          {sel ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text">
                  <GroupDot group={sel.group} />{" "}
                  {sel.group === "Yash" ? "Centre" : sel.group}
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close details"
                  className="rounded-md p-1 text-text hover:bg-surface-2"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>
              <h3 className="mt-2 font-display text-xl font-semibold text-text">
                {sel.label}
              </h3>
              {sel.year && (
                <p className="mt-1 font-mono text-sm text-accent">{sel.year}</p>
              )}
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                {sel.description}
              </p>
              {sel.url && (
                <a
                  href={sel.url}
                  target={sel.url.startsWith("/") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-bg hover:brightness-110"
                >
                  {sel.group === "Projects" ? "Open project" : "Open link"}{" "}
                  <ArrowUpRight size={16} aria-hidden />
                </a>
              )}
              {linked.length > 0 && (
                <>
                  <h4 className="mt-5 text-sm font-semibold text-text">
                    Connected ({linked.length})
                  </h4>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {linked.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => selectNode(n.id)}
                          title={
                            edgeLabels.get(edgeKey(sel.id, n.id)) ?? undefined
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-sm text-text hover:border-accent"
                        >
                          <GroupDot group={n.group} /> {n.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setFrom(sel.id);
                  setTraceOpen(true);
                }}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
              >
                <Route size={15} aria-hidden /> Trace a path from here
              </button>
            </div>
          ) : (
            <div className="text-muted">
              <p className="font-display text-lg font-semibold text-text">
                Explore the graph
              </p>
              <p className="mt-2 text-[15px] leading-relaxed">
                Click any node to see what it is and how it connects. Projects
                link to the skills and tools they use, and certifications link
                to what they cover.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

// Builds the Career Knowledge Graph from portfolio content.
// Pure functions: used on the server (public page) and in the admin (connections editor).
import type { PortfolioContent, SkillGroup } from "./types";

export const GROUPS = [
  "Education",
  "Projects",
  "Skills",
  "Tools",
  "Certifications",
  "Awards",
  "Links",
] as const;
export type NodeGroup = (typeof GROUPS)[number] | "Yash";

/** Group colours, all readable on the dark background. */
export const GROUP_COLORS: Record<NodeGroup, string> = {
  Yash: "#ffffff",
  Education: "#fcd34d",
  Projects: "#7cf0c5",
  Skills: "#9db2ff",
  Tools: "#f9a8d4",
  Certifications: "#67e8f9",
  Awards: "#fdba74",
  Links: "#d8b4fe",
};

export type GraphNode = {
  id: string;
  label: string;
  group: NodeGroup;
  description: string;
  year?: string;
  url?: string;
  /** Larger, always-labelled nodes (center, categories, featured projects). */
  major: boolean;
};

export type GraphEdge = {
  source: string;
  target: string;
  /** "tree" = structural (solid), "cross" = tag/manual connection (dashed). */
  kind: "tree" | "cross";
  label?: string;
};

export type GraphData = { nodes: GraphNode[]; edges: GraphEdge[] };

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, "p")
    .replace(/#/g, "sharp")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Normalised keys a skill name can be matched by, e.g. "Supabase / PostgreSQL" -> supabase, postgresql. */
function keysFor(name: string): string[] {
  const n = name.toLowerCase().trim();
  const inParens = n.match(/\(([^)]*)\)/)?.[1] ?? "";
  const base = n.replace(/\([^)]*\)/g, "");
  const parts = [n, base, ...base.split(/\/|&|,| and /), ...inParens.split(/,|\//)];
  return [...new Set(parts.map(norm).filter((k) => k.length > 0))];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/\b\d+(\.\d+)*\b/g, "") // "React 19" -> "react"
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();

// Tags that don't share words with a node name.
const ALIASES: Record<string, string> = {
  "postgresql rls": "row level security",
  owasp: "sqli / xss / csrf testing",
  "firestore rules": "firestore security rules",
  "flask socketio": "flask",
  requests: "python",
  beautifulsoup: "python",
};

export function inferGraphGroup(g: SkillGroup): "Skills" | "Tools" {
  if (g.graphGroup) return g.graphGroup;
  return /tool|devops|backend|data|platform|cloud/i.test(g.name) ? "Tools" : "Skills";
}

export function buildGraph(content: PortfolioContent): GraphData {
  const { settings, projects, skills, education, awards, graphLinks } = content;
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();
  const add = (n: GraphNode) => nodes.set(n.id, n);
  const link = (source: string, target: string, kind: GraphEdge["kind"], label?: string) => {
    if (source === target || !nodes.has(source) || !nodes.has(target)) return;
    const key = [source, target].sort().join("|");
    const existing = edges.get(key);
    // Structural edges win over cross-links between the same pair.
    if (existing && (existing.kind === "tree" || kind === "cross")) {
      if (label && !existing.label) existing.label = label;
      return;
    }
    edges.set(key, { source, target, kind, label });
  };

  add({ id: "yash", label: settings.name.split(" ")[0] || "Me", group: "Yash", description: settings.headline, major: true });

  for (const e of education) {
    add({
      id: `edu:${e.id}`,
      label: e.institution.split(",")[0],
      group: "Education",
      description: [e.degree, e.details].filter(Boolean).join(". "),
      year: e.period,
      major: true,
    });
    link("yash", `edu:${e.id}`, "tree");
  }

  for (const p of projects.filter((p) => !p.hidden)) {
    add({
      id: `project:${p.id}`,
      label: p.title.split(":")[0],
      group: "Projects",
      description: p.summary || p.description,
      year: p.year,
      url: p.liveUrl || p.repoUrl || undefined,
      major: p.featured,
    });
    link("yash", `project:${p.id}`, "tree");
  }

  // Skill items are shared across categories, so index them by slug.
  const skillIndex = new Map<string, string>(); // match key -> node id
  for (const g of skills) {
    const group = inferGraphGroup(g);
    const gid = `skillgroup:${g.id}`;
    add({ id: gid, label: g.name, group, description: `${g.items.length} ${group.toLowerCase()}: ${g.items.join(", ")}`, major: true });
    link("yash", gid, "tree");
    for (const item of g.items.filter(Boolean)) {
      const id = `skill:${slug(item)}`;
      if (!nodes.has(id)) add({ id, label: item, group, description: `Part of ${g.name}.`, major: false });
      link(gid, id, "tree");
      for (const k of keysFor(item)) if (!skillIndex.has(k)) skillIndex.set(k, id);
    }
  }

  for (const a of awards) {
    const isCert = a.kind ? a.kind === "certification" : /certif/i.test(a.title);
    add({
      id: `award:${a.id}`,
      label: a.title.split(/[,–—]/)[0].trim(),
      group: isCert ? "Certifications" : "Awards",
      description: `${a.title}. ${a.issuer}. ${a.description}`,
      year: a.date,
      url: a.link || undefined,
      major: false,
    });
    link("yash", `award:${a.id}`, "tree");
  }

  const SOCIAL_LABELS: Record<string, string> = {
    github: "GitHub",
    linkedin: "LinkedIn",
    x: "X (Twitter)",
    instagram: "Instagram",
    leetcode: "LeetCode",
  };
  for (const [key, url] of Object.entries(settings.socials)) {
    if (!url) continue;
    add({ id: `link:${key}`, label: SOCIAL_LABELS[key] ?? key, group: "Links", description: url, url, major: false });
    link("yash", `link:${key}`, "tree");
  }
  if (settings.cvUrl) {
    add({ id: "link:cv", label: "Résumé", group: "Links", description: "Download the latest CV (PDF).", url: settings.cvUrl, major: false });
    link("yash", "link:cv", "tree");
  }

  // Tag-derived cross links.
  const matchTag = (tag: string) => {
    for (const k of keysFor(ALIASES[norm(tag)] ?? tag)) {
      const id = skillIndex.get(k);
      if (id) return id;
    }
    return undefined;
  };
  const tagLinks = (from: string, tags: string[] | undefined) => {
    for (const t of tags ?? []) {
      const to = matchTag(t);
      if (to) link(from, to, "cross", "Uses");
    }
  };
  for (const p of projects.filter((p) => !p.hidden)) tagLinks(`project:${p.id}`, p.tech);
  for (const a of awards) tagLinks(`award:${a.id}`, a.tags);
  for (const e of education) tagLinks(`edu:${e.id}`, e.tags);

  // Manual connections from the admin.
  for (const l of graphLinks ?? []) link(l.source, l.target, "cross", l.label || undefined);

  return { nodes: [...nodes.values()], edges: [...edges.values()] };
}

/** Adjacency list (undirected). */
export function neighbours(data: GraphData) {
  const adj = new Map<string, Set<string>>();
  for (const n of data.nodes) adj.set(n.id, new Set());
  for (const e of data.edges) {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  }
  return adj;
}

/**
 * Shortest path by BFS, as a list of node ids, or null if unreachable.
 * Nodes in `avoid` are never used as intermediate hops.
 */
export function shortestPath(
  adj: Map<string, Set<string>>,
  from: string,
  to: string,
  avoid: Set<string> = new Set(),
): string[] | null {
  if (from === to) return [from];
  const prev = new Map<string, string>([[from, from]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const next of adj.get(cur) ?? []) {
      if (prev.has(next) || (avoid.has(next) && next !== to)) continue;
      prev.set(next, cur);
      if (next === to) {
        const path = [to];
        while (path[0] !== from) path.unshift(prev.get(path[0])!);
        return path;
      }
      queue.push(next);
    }
  }
  return null;
}

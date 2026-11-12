"use client";
import { ArrowUpRight, Github, Lock } from "lucide-react";
import { useState } from "react";
import type { Project } from "@/lib/types";
import { Section, SmartImage, Tag, exhibit } from "./ui";

/** Screenshot mounted like evidence: a mono tab with the exhibit letter, a thin ink border. */
function Shot({ p, n, priority, sizes }: { p: Project; n: number; priority: boolean; sizes: string }) {
  return (
    <div className="relative">
      <span className="absolute -top-3 left-4 z-10 border border-line bg-bg px-2 py-0.5 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-accent">
        Exhibit {exhibit(n)}
      </span>
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-surface-2 shadow-[var(--shadow-hard)]">
        <SmartImage
          src={p.image}
          alt={p.imageAlt || `${p.title} screenshot`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        />
      </div>
    </div>
  );
}

function Meta({ p }: { p: Project }) {
  const bits = [p.context, p.year].filter(Boolean);
  if (!bits.length) return null;
  return <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-muted">{bits.join(" · ")}</p>;
}

function Links({ p }: { p: Project }) {
  if (!p.liveUrl && !p.repoUrl && !p.isPrivate) return null;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {p.liveUrl && (
        <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
          Visit live site <ArrowUpRight size={14} aria-hidden />
          <span className="sr-only">: {p.title}</span>
        </a>
      )}
      {p.repoUrl && (
        <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
          <Github size={14} aria-hidden /> Read the code
          <span className="sr-only">: {p.title}</span>
        </a>
      )}
      {p.isPrivate && !p.repoUrl && (
        <span className="stamp text-[0.64rem]" style={{ color: "var(--muted)" }}>
          <Lock size={12} aria-hidden /> Code classified
        </span>
      )}
    </div>
  );
}

function TechList({ tech, max = 6 }: { tech: string[]; max?: number }) {
  if (!tech.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
      {tech.slice(0, max).map((t) => (
        <li key={t}>
          <Tag>{t}</Tag>
        </li>
      ))}
    </ul>
  );
}

/** Large alternating row for the lead exhibits. */
function FeatureRow({ p, n, flip }: { p: Project; n: number; flip: boolean }) {
  return (
    <article aria-labelledby={`p-${p.id}`} className="group grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
      {p.image && (
        <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
          <Shot p={p} n={n} priority={n === 0} sizes="(min-width: 1024px) 660px, 100vw" />
        </div>
      )}
      <div className={p.image ? "lg:col-span-5" : "lg:col-span-12"}>
        <Meta p={p} />
        <h3 id={`p-${p.id}`} className="h2 mt-3 text-[2.6rem] text-text sm:text-[3.4rem]">
          {p.title}
        </h3>
        <p className="mt-5 text-lg leading-relaxed text-text/85">{p.summary}</p>
        {p.description && <p className="mt-3 line-clamp-4 leading-relaxed text-muted max-lg:hidden">{p.description}</p>}
        <div className="mt-6">
          <TechList tech={p.tech} />
        </div>
        <div className="mt-7">
          <Links p={p} />
        </div>
      </div>
    </article>
  );
}

function Card({ p, n }: { p: Project; n: number }) {
  return (
    <article aria-labelledby={`p-${p.id}`} className="group card card-hover flex h-full flex-col p-4 pt-6">
      {p.image && <Shot p={p} n={n} priority={false} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />}
      <div className="flex flex-1 flex-col pt-6">
        <Meta p={p} />
        <h3 id={`p-${p.id}`} className="h3 mt-2 text-2xl text-text">
          {p.title}
        </h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{p.summary}</p>
        <div className="mt-5">
          <TechList tech={p.tech} max={4} />
        </div>
        <div className="mt-auto pt-6">
          <Links p={p} />
        </div>
      </div>
    </article>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = projects.filter((p) => !p.hidden);
  if (!visible.length) return null;

  // Featured first; if nothing is featured, start with the first three.
  const featured = visible.filter((p) => p.featured);
  const initial = featured.length ? featured : visible.slice(0, 3);
  const rest = visible.filter((p) => !initial.includes(p));
  const ordered = [...initial, ...rest];
  const lead = ordered.slice(0, 2);
  const grid = (showAll ? ordered : initial).slice(2);

  return (
    <Section
      id="projects"
      index="02"
      eyebrow="Evidence"
      title="The exhibits"
      intro="Products I have designed and built end to end, from access control to deployment."
      tinted
    >
      <div className="space-y-24 md:space-y-32">
        {lead.map((p, i) => (
          <FeatureRow key={p.id} p={p} n={i} flip={i % 2 === 1} />
        ))}
      </div>

      {grid.length > 0 && (
        <ul className="mt-24 grid gap-x-6 gap-y-10 sm:grid-cols-2 md:mt-32 lg:grid-cols-3">
          {grid.map((p, i) => (
            <li key={p.id}>
              <Card p={p} n={i + 2} />
            </li>
          ))}
        </ul>
      )}

      {rest.length > 0 && (
        <div className="mt-14 flex justify-center">
          <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} className="btn btn-ghost">
            {showAll ? "Show fewer exhibits" : `Show ${rest.length} more exhibits`}
          </button>
        </div>
      )}
    </Section>
  );
}

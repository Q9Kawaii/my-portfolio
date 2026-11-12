"use client";
import { ArrowUpRight, Github, Lock } from "lucide-react";
import { useState } from "react";
import type { Project } from "@/lib/types";
import { Section, SmartImage, Tag } from "./ui";

function ProjectCard({ p, priority }: { p: Project; priority: boolean }) {
  return (
    <article aria-labelledby={`p-${p.id}`} className="card card-hover group flex h-full flex-col">
      {p.image && (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-[11px] border-b border-line bg-surface-2">
          <SmartImage
            src={p.image}
            alt={p.imageAlt || `${p.title} screenshot`}
            fill
            priority={priority}
            sizes="(min-width: 1000px) 320px, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        {(p.context || p.year) && (
          <p className="mb-1.5 text-xs font-medium text-muted">
            {[p.context, p.year].filter(Boolean).join(" · ")}
          </p>
        )}
        <h3 id={`p-${p.id}`} className="text-lg font-semibold tracking-tight text-text">
          {p.title}
        </h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{p.summary}</p>
        {p.tech.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
            {p.tech.slice(0, 5).map((t) => (
              <li key={t}>
                <Tag>{t}</Tag>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              Live <ArrowUpRight size={14} aria-hidden />
              <span className="sr-only">demo of {p.title}</span>
            </a>
          )}
          {p.repoUrl && (
            <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
              <Github size={14} aria-hidden /> Code
              <span className="sr-only">for {p.title}</span>
            </a>
          )}
          {p.isPrivate && !p.repoUrl && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
              <Lock size={13} aria-hidden /> Private code
            </span>
          )}
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
  const shown = showAll ? [...initial, ...rest] : initial;

  return (
    <Section
      id="projects"
      eyebrow="Projects"
      title="Selected work"
      intro="Products I have designed and built end to end, from access control to deployment."
      tinted
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <li key={p.id}>
            <ProjectCard p={p} priority={i < 2} />
          </li>
        ))}
      </ul>
      {rest.length > 0 && (
        <div className="mt-12 text-center">
          <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} className="btn btn-ghost">
            {showAll ? "Show less" : `Show more (${rest.length})`}
          </button>
        </div>
      )}
    </Section>
  );
}

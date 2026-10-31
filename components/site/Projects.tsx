import { ArrowUpRight, Github, Lock } from "lucide-react";
import type { Project } from "@/lib/types";
import Masonry from "./Masonry";
import TiltCard from "./TiltCard";
import { Section, SmartImage, Tag } from "./ui";

function ProjectLinks({ p }: { p: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {p.liveUrl && (
        <a
          href={p.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-bg transition hover:brightness-110"
        >
          Live demo <ArrowUpRight size={16} aria-hidden />
          <span className="sr-only">for {p.title}</span>
        </a>
      )}
      {p.repoUrl && (
        <a
          href={p.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-text transition hover:border-accent"
        >
          <Github size={16} aria-hidden /> Code
          <span className="sr-only">for {p.title}</span>
        </a>
      )}
      {p.isPrivate && !p.repoUrl && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-text">
          <Lock size={15} aria-hidden /> Private code
        </span>
      )}
    </div>
  );
}

function FeaturedCard({ p, priority }: { p: Project; priority: boolean }) {
  return (
    <TiltCard className="overflow-hidden">
      <article aria-labelledby={`p-${p.id}`}>
        {p.image && (
          <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-surface-2">
            <SmartImage
              src={p.image}
              alt={p.imageAlt || `${p.title} screenshot`}
              fill
              priority={priority}
              sizes="(min-width: 1280px) 380px, (min-width: 768px) 50vw, 100vw"
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </div>
        )}
        <div className="p-6 [transform:translateZ(28px)]">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">{p.context}</p>
          <h3 id={`p-${p.id}`} className="mt-2 font-display text-xl font-semibold text-text">
            {p.title}
          </h3>
          <p className="mt-2 font-medium leading-relaxed text-text">{p.summary}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.description}</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
            {p.tech.map((t) => (
              <li key={t}>
                <Tag>{t}</Tag>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <ProjectLinks p={p} />
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

function SmallCard({ p }: { p: Project }) {
  return (
    <TiltCard max={6} className="overflow-hidden">
      <article aria-labelledby={`p-${p.id}`} className="flex gap-4 p-4">
        {p.image && (
          <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2">
            <SmartImage src={p.image} alt={p.imageAlt || `${p.title} screenshot`} fill sizes="96px" className="object-cover" />
          </div>
        )}
        <div className="min-w-0 [transform:translateZ(20px)]">
          <h3 id={`p-${p.id}`} className="font-display font-semibold text-text">
            {p.title}
          </h3>
          <p className="mt-1 text-[15px] leading-relaxed text-muted">{p.summary}</p>
          <p className="mt-2 font-mono text-xs text-text">{p.tech.slice(0, 4).join(" · ")}</p>
          <div className="mt-3">
            <ProjectLinks p={p} />
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  const visible = projects.filter((p) => !p.hidden);
  const featured = visible.filter((p) => p.featured);
  const more = visible.filter((p) => !p.featured);
  if (!visible.length) return null;

  return (
    <Section
      id="projects"
      eyebrow="04 / Projects"
      title="Selected work"
      intro="Production portals, workflow engines and security tooling. Hover a card to tilt it."
    >
      <Masonry>
        {featured.map((p, i) => (
          <FeaturedCard key={p.id} p={p} priority={i < 2} />
        ))}
      </Masonry>

      {more.length > 0 && (
        <>
          <h3 className="mb-6 mt-16 font-display text-xl font-semibold text-text">More projects</h3>
          <div className="grid gap-6 md:grid-cols-2">
            {more.map((p) => (
              <SmallCard key={p.id} p={p} />
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

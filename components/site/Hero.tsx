import { ArrowUpRight, Download, Move3d } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import HeroCanvas from "./HeroCanvas";
import SocialLinks from "./SocialLinks";

export default function Hero({ s }: { s: SiteSettings }) {
  return (
    <section id="top" aria-label="Introduction" className="relative pt-28 md:pt-32">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm text-text">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {s.availability}
          </p>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-text sm:text-6xl lg:text-7xl">
            {s.name}
          </h1>
          <p className="mt-3 font-display text-2xl font-medium text-accent sm:text-3xl">{s.role}</p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{s.headline}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-bg transition hover:brightness-110"
            >
              View projects <ArrowUpRight size={18} aria-hidden />
            </a>
            <a
              href={s.cvUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-5 py-3 font-semibold text-text transition hover:border-accent"
            >
              <Download size={18} aria-hidden /> Download CV
            </a>
          </div>
          <div className="mt-8">
            <SocialLinks socials={s.socials} />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-3">
          {/* The canvas fills this square; HeroScene fits the camera so the object never touches its edges. */}
          <div className="relative aspect-square w-full">
            <div
              aria-hidden
              className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgb(124_240_197/0.18),transparent_65%)] blur-2xl"
            />
            <HeroCanvas />
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs text-text">
            <Move3d size={14} aria-hidden /> Drag to rotate
          </p>
        </div>
      </div>

      {s.stats.length > 0 && (
        <dl className="mt-12 grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line mx-4 sm:mx-6 md:grid-cols-4 xl:mx-auto">
          {s.stats.map((st) => (
            <div key={st.label} className="bg-surface px-5 py-6">
              <dt className="text-sm text-muted">{st.label}</dt>
              <dd className="mt-1 font-display text-3xl font-semibold text-text">{st.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

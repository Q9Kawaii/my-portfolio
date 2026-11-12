import { ArrowRight, Download, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import SocialLinks from "./SocialLinks";
import { SmartImage, WRAP } from "./ui";

export default function Hero({ s }: { s: SiteSettings }) {
  return (
    <section id="top" aria-label="Introduction" className="relative overflow-hidden border-b border-line">
      {/* Soft accent glow behind the hero; purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--accent-soft), transparent)" }}
      />
      <div className={`${WRAP} relative grid items-center gap-12 pb-16 pt-32 md:grid-cols-[1.4fr_1fr] md:pb-24 md:pt-40`}>
        <div>
          {s.availability && (
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted shadow-hard-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              {s.availability}
            </p>
          )}
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-text sm:text-5xl md:text-[3.4rem] md:leading-[1.08]">
            {s.name}
          </h1>
          <p className="mt-3 text-lg font-medium text-accent sm:text-xl">{s.role}</p>
          {s.headline && <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-muted">{s.headline}</p>}

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#projects" className="btn btn-primary">
              View my work <ArrowRight size={16} aria-hidden />
            </a>
            <a href={s.cvUrl} download className="btn btn-ghost">
              <Download size={16} aria-hidden /> Download CV
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <SocialLinks socials={s.socials} size={17} />
            {s.location && (
              <p className="flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={15} aria-hidden /> {s.location}
              </p>
            )}
          </div>
        </div>

        {s.avatar && (
          <div className="mx-auto w-full max-w-[260px] md:mx-0 md:max-w-[320px] md:justify-self-end">
            <div className="card relative aspect-[4/5] w-full overflow-hidden rounded-2xl p-0">
              <SmartImage
                src={s.avatar}
                alt={`Portrait of ${s.name}`}
                fill
                priority
                sizes="(min-width: 768px) 320px, 80vw"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {s.stats.length > 0 && (
        <div className={`${WRAP} relative pb-14 md:pb-16`}>
          {/* 1px gaps over a line-coloured background draw the dividers in any column count. */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line shadow-hard-sm md:grid-cols-4">
            {s.stats.map((st) => (
              <div key={st.label} className="bg-surface px-5 py-5">
                <dt className="sr-only">{st.label}</dt>
                <dd>
                  <span className="block text-2xl font-semibold tracking-tight text-text">{st.value}</span>
                  <span className="mt-1 block text-sm text-muted">{st.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

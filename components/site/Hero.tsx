import { ArrowDownRight, Download } from "lucide-react";
import type { ReactNode } from "react";
import type { SiteSettings } from "@/lib/types";
import SocialLinks from "./SocialLinks";
import { SmartImage, WRAP } from "./ui";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

/** Phrases in the headline that get a redaction bar which peels off on load. Admin text is matched loosely. */
const REDACT = /(access control|security|secure|role-based portals|workflow engines)/gi;

function redactHeadline(text: string): ReactNode {
  const parts = text.split(REDACT);
  let n = 0;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="redact" style={{ "--d": `${0.85 + n++ * 0.18}s` } as Vars}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function FileCard({ s }: { s: SiteSettings }) {
  const rows: [string, string][] = [
    ["Subject", s.name],
    ["Role", s.role],
    ["Base", s.location],
    ["Status", s.availability],
  ].filter((r): r is [string, string] => Boolean(r[1]));

  return (
    <figure
      className="enter relative border border-line bg-surface p-3 shadow-[var(--shadow-lg)] sm:p-4"
      style={{ "--d": "0.2s" } as Vars}
    >
      {/* Paper clip, drawn in CSS. */}
      <span
        aria-hidden
        className="absolute -top-4 left-8 h-12 w-4 rounded-full border-2 border-muted/70 border-b-transparent"
      />
      <div className="flex items-center justify-between border-b border-dashed border-line pb-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">
        <span>Personnel file</span>
        <span>Ref. YD / {new Date().getFullYear()}</span>
      </div>

      <div className="mt-3 grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] gap-4 sm:gap-5">
        {s.avatar && (
          <div className="group relative aspect-[3/4] overflow-hidden border border-line bg-surface-2">
            <SmartImage
              src={s.avatar}
              alt={`Portrait of ${s.name}`}
              fill
              priority
              sizes="(min-width: 1024px) 220px, 40vw"
              className="object-cover grayscale contrast-[1.08] transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:grayscale-0"
            />
          </div>
        )}
        <dl className="flex flex-col justify-between gap-3 py-1">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[0.64rem] uppercase tracking-[0.14em] text-muted">{k}</dt>
              <dd className="mt-0.5 text-[0.88rem] font-semibold leading-snug text-text sm:text-[0.95rem]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {s.availability && (
        <span
          className="stamp stamp-in absolute -bottom-5 right-4 bg-surface sm:right-6"
          style={{ "--r": "-7deg", "--d": "1.45s" } as Vars}
        >
          Open to work
        </span>
      )}
    </figure>
  );
}

export default function Hero({ s }: { s: SiteSettings }) {
  return (
    <section id="top" aria-label="Introduction" className="relative flex min-h-[100svh] flex-col border-b border-line">
      <div aria-hidden className="paper-dots pointer-events-none absolute inset-0 [mask-image:linear-gradient(#000,transparent_85%)]" />

      <div className={`${WRAP} relative grid flex-1 content-center gap-14 pb-16 pt-28 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] lg:items-center lg:gap-16 lg:pb-20`}>
        <div>
          <p className="label enter flex items-center gap-3" style={{ "--d": "0s" } as Vars}>
            <span aria-hidden className="inline-block size-2 bg-accent" />
            Case file · Full-stack &amp; security
          </p>

          <h1 className="enter mt-5" style={{ "--d": "0.05s" } as Vars}>
            <span translate="no" className="display block text-[clamp(4.6rem,23vw,10.5rem)] text-text">{s.name}</span>
            {s.role && (
              <span className="mt-4 block font-mono text-sm font-medium uppercase tracking-[0.1em] text-accent sm:text-base">
                {s.role}
              </span>
            )}
          </h1>

          {s.headline && (
            <p className="enter mt-7 max-w-[46ch] text-xl leading-relaxed text-text/85 sm:text-[1.35rem]" style={{ "--d": "0.12s" } as Vars}>
              {redactHeadline(s.headline)}
            </p>
          )}

          <div className="enter mt-9 flex flex-wrap gap-3" style={{ "--d": "0.18s" } as Vars}>
            <a href="#projects" className="btn btn-primary">
              Open the exhibits <ArrowDownRight size={16} aria-hidden />
            </a>
            <a href={s.cvUrl} download className="btn btn-ghost">
              <Download size={16} aria-hidden /> Download CV
            </a>
          </div>

          <div className="enter mt-8" style={{ "--d": "0.22s" } as Vars}>
            <SocialLinks socials={s.socials} size={17} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[460px] lg:mx-0 lg:justify-self-end">
          <FileCard s={s} />
        </div>
      </div>

      {s.stats.length > 0 && (
        <div className="relative border-t border-line bg-surface/60">
          <dl className={`${WRAP} grid grid-cols-2 md:grid-cols-4`}>
            {s.stats.map((st, i) => (
              <div
                key={st.label}
                className={`flex flex-col-reverse gap-1.5 py-6 md:py-7 ${i % 2 ? "border-l border-line pl-5" : "pr-5"} ${
                  i > 1 ? "border-t border-line md:border-t-0" : ""
                } ${i > 0 ? "md:border-l md:border-line md:pl-7" : ""}`}
              >
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted">{st.label}</dt>
                <dd className="h2 text-[2.6rem] tabular-nums text-text md:text-5xl">{st.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { WRAP } from "@/components/site/ui";
import { LAB_EXHIBITS, type LabExhibit } from "@/lib/lab/exhibits";

/** Page frame for one lab exhibit: file tab, title, safety note, the tool, then prev/next. */
export default function ExhibitFrame({ ex, children, notes }: { ex: LabExhibit; children: ReactNode; notes?: ReactNode }) {
  const i = LAB_EXHIBITS.findIndex((e) => e.slug === ex.slug);
  const prev = LAB_EXHIBITS[i - 1];
  const next = LAB_EXHIBITS[i + 1];

  return (
    <article className={`${WRAP} py-14 md:py-20`}>
      <div className="flex items-center gap-4">
        <Link href="/lab" className="label shrink-0 hover:underline">
          <span className="text-muted">Security lab / </span>Exhibit {ex.letter}
        </Link>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>
      <h1 className="h2 mt-7 text-[2.6rem] text-text sm:text-6xl">{ex.title}</h1>
      <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">{ex.summary}</p>
      <p className="mt-5 flex max-w-[70ch] items-start gap-2.5 border-l-2 border-accent bg-surface-2/60 px-4 py-3 text-sm leading-relaxed text-text">
        <ShieldCheck size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden />
        <span>{ex.safety}</span>
      </p>

      <div className="mt-10 md:mt-12">{children}</div>

      {notes && (
        <section aria-label="How it works" className="mt-14 max-w-[75ch]">
          <p className="mono-label">Case notes</p>
          <div className="mt-4 space-y-4 leading-relaxed text-muted [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-text [&_strong]:text-text">
            {notes}
          </div>
        </section>
      )}

      <nav aria-label="More exhibits" className="mt-16 flex flex-wrap justify-between gap-4 border-t border-line pt-6">
        {prev ? (
          <Link href={`/lab/${prev.slug}`} className="btn btn-ghost btn-sm">
            ← Exhibit {prev.letter}: {prev.title}
          </Link>
        ) : (
          <Link href="/lab" className="btn btn-ghost btn-sm">
            ← All exhibits
          </Link>
        )}
        {next && (
          <Link href={`/lab/${next.slug}`} className="btn btn-ghost btn-sm">
            Exhibit {next.letter}: {next.title} →
          </Link>
        )}
      </nav>
    </article>
  );
}

/** pass / warn / fail / info chip used by several exhibits. */
export function Verdict({ kind, children }: { kind: "pass" | "warn" | "fail" | "info"; children: ReactNode }) {
  const color =
    kind === "pass" ? "text-ok" : kind === "warn" ? "text-warn" : kind === "fail" ? "text-danger" : "text-muted";
  return <span className={`stamp shrink-0 px-[0.45em] py-[0.15em] text-[0.62rem] ${color}`}>{children}</span>;
}

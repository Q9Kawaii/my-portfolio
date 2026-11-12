import { ArrowUpRight } from "lucide-react";
import type { Award } from "@/lib/types";
import { Section, SmartImage } from "./ui";

export default function Awards({ awards }: { awards: Award[] }) {
  if (!awards.length) return null;
  return (
    <Section id="awards" eyebrow="Recognition" title="Awards & certifications" tinted>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((a) => (
          <li key={a.id}>
            <article aria-labelledby={`a-${a.id}`} className="card card-hover flex h-full flex-col">
              {a.image && (
                // Fixed frame keeps layout stable; certificates of any shape fit inside.
                <div className="relative aspect-[4/3] rounded-t-[11px] border-b border-line bg-surface-2">
                  <SmartImage
                    src={a.image}
                    alt={a.imageAlt || a.title}
                    fill
                    sizes="(min-width: 1000px) 320px, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-3"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-medium text-muted">
                  {a.issuer}
                  {a.date && <> · {a.date}</>}
                </p>
                <h3 id={`a-${a.id}`} className="mt-2 text-base font-semibold tracking-tight text-text">
                  {a.title}
                </h3>
                {a.description && <p className="mt-2 text-sm leading-relaxed text-muted">{a.description}</p>}
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    Certificate <ArrowUpRight size={14} aria-hidden />
                    <span className="sr-only">: {a.title}</span>
                  </a>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </Section>
  );
}

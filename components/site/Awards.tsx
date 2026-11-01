import { ArrowUpRight } from "lucide-react";
import type { Award } from "@/lib/types";
import { Section, SmartImage } from "./ui";

export default function Awards({ awards }: { awards: Award[] }) {
  if (!awards.length) return null;
  return (
    <Section id="awards" eyebrow="04 / Awards" title="Awards & certifications">
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((a) => (
          <li key={a.id}>
            <article aria-labelledby={`a-${a.id}`} className="card flex h-full flex-col">
              {a.image && (
                // Fixed frame keeps layout stable; certificates of any shape fit inside.
                <div className="relative aspect-[4/3] border-b-2 border-line bg-surface-2">
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
                <p className="font-display text-xs text-muted">
                  {a.issuer}
                  {a.date && <> · {a.date}</>}
                </p>
                <h3 id={`a-${a.id}`} className="mt-2 font-display text-base font-bold text-text">
                  {a.title}
                </h3>
                {a.description && <p className="mt-2 leading-relaxed text-muted">{a.description}</p>}
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1 pt-4 font-display text-sm font-bold text-accent underline-offset-4 hover:underline"
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

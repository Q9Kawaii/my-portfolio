import { ArrowUpRight } from "lucide-react";
import type { Award } from "@/lib/types";
import { Section, SmartImage } from "./ui";

export default function Awards({ awards }: { awards: Award[] }) {
  if (!awards.length) return null;
  return (
    <Section id="awards" index="04" eyebrow="Commendations" title="Awards & certificates" tinted>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((a) => (
          <li key={a.id}>
            <article aria-labelledby={`a-${a.id}`} className="group card card-hover flex h-full flex-col p-3">
              {a.image && (
                // Fixed frame keeps layout stable; certificates of any shape fit inside.
                <div className="relative aspect-[4/3] overflow-hidden border border-line-soft bg-bg">
                  <SmartImage
                    src={a.image}
                    alt={a.imageAlt || a.title}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.12em] text-muted">
                  {a.kind === "certification" ? "Certified" : "Awarded"}
                  {a.date && <> · {a.date}</>}
                </p>
                <h3 id={`a-${a.id}`} className="h3 mt-2 text-lg text-text">
                  {a.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-accent">{a.issuer}</p>
                {a.description && <p className="mt-2 text-sm leading-relaxed text-muted">{a.description}</p>}
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw mt-auto inline-flex w-fit items-center gap-1 pt-5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-text"
                  >
                    View certificate <ArrowUpRight size={13} aria-hidden />
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

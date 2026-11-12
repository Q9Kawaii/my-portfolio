import { ArrowUpRight } from "lucide-react";
import type { Education, Experience as Exp } from "@/lib/types";
import { Section } from "./ui";

const ROW = "grid gap-2 border-t border-line py-7 first:border-t-0 md:grid-cols-[200px_1fr] md:gap-10";

export default function Experience({ experience, education }: { experience: Exp[]; education: Education[] }) {
  return (
    <Section id="experience" eyebrow="Experience" title="Experience & education">
      {experience.length > 0 && (
        <>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Work</h3>
          <ol className="card mt-4 px-6">
            {experience.map((e) => (
              <li key={e.id} className={ROW}>
                <p className="text-sm font-medium text-muted md:pt-1">{e.period}</p>
                <div className="max-w-[62ch]">
                  <h4 className="text-lg font-semibold tracking-tight text-text">{e.role}</h4>
                  <p className="mt-1 font-medium text-accent">
                    {e.org}
                    {e.location && <span className="text-muted"> · {e.location}</span>}
                  </p>
                  {e.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2 leading-relaxed text-muted">
                      {e.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3">
                          <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-accent/70" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {e.link && (
                    <a
                      href={e.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      Visit <ArrowUpRight size={14} aria-hidden />
                      <span className="sr-only">{e.org}</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {education.length > 0 && (
        <>
          <h3 className="mt-14 text-sm font-semibold uppercase tracking-wider text-muted">Education</h3>
          <ul className="card mt-4 px-6">
            {education.map((ed) => (
              <li key={ed.id} className={ROW}>
                <p className="text-sm font-medium text-muted md:pt-1">{ed.period}</p>
                <div className="max-w-[62ch]">
                  <h4 className="text-lg font-semibold tracking-tight text-text">{ed.degree}</h4>
                  <p className="mt-1 font-medium text-accent">{ed.institution}</p>
                  {ed.details && <p className="mt-3 leading-relaxed text-muted">{ed.details}</p>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Section>
  );
}

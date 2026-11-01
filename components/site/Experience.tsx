import { ArrowUpRight } from "lucide-react";
import type { Education, Experience as Exp } from "@/lib/types";
import { Section } from "./ui";

const ROW = "grid gap-2 border-t-2 border-line py-8 md:grid-cols-[180px_1fr] md:gap-10";

export default function Experience({ experience, education }: { experience: Exp[]; education: Education[] }) {
  return (
    <Section id="experience" eyebrow="03 / Experience" title="Experience & Education">
      {experience.length > 0 && (
        <>
          <h3 className="label">Work</h3>
          <ol className="mt-4">
            {experience.map((e) => (
              <li key={e.id} className={ROW}>
                <p className="font-display text-sm text-muted">{e.period}</p>
                <div className="max-w-[62ch]">
                  <h4 className="font-display text-base font-bold text-text">{e.role}</h4>
                  <p className="mt-1 text-text">
                    {e.org}
                    {e.location && <span className="text-muted"> · {e.location}</span>}
                  </p>
                  {e.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2 leading-relaxed text-muted">
                      {e.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3">
                          <span aria-hidden className="text-accent">
                            –
                          </span>
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
                      className="mt-4 inline-flex items-center gap-1 font-display text-sm font-bold text-accent underline-offset-4 hover:underline"
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
          <h3 className="label mt-16">Education</h3>
          <ul className="mt-4">
            {education.map((ed) => (
              <li key={ed.id} className={ROW}>
                <p className="font-display text-sm text-muted">{ed.period}</p>
                <div className="max-w-[62ch]">
                  <h4 className="font-display text-base font-bold text-text">{ed.degree}</h4>
                  <p className="mt-1 text-text">{ed.institution}</p>
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

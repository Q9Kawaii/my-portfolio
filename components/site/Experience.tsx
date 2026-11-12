import { ArrowUpRight } from "lucide-react";
import type { Education, Experience as Exp } from "@/lib/types";
import { Section } from "./ui";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** A ledger row: period in the margin, entry on the right, dashed rule between entries. */
const ROW = "grid gap-3 border-b border-dashed border-line py-9 md:grid-cols-[230px_1fr] md:gap-10";

function Ledger({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-4 border-b border-line pb-3">
        <h3 className="mono-label shrink-0">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Experience({ experience, education }: { experience: Exp[]; education: Education[] }) {
  return (
    <Section id="experience" index="03" eyebrow="Record" title="Service record">
      <div className="space-y-16">
        {experience.length > 0 && (
          <Ledger title="Work">
            <ol>
              {experience.map((e) => (
                <li key={e.id} className={ROW}>
                  <div className="font-mono text-xs uppercase tracking-[0.1em] text-muted md:pt-2">
                    <p>{e.period}</p>
                    {e.location && <p className="mt-1">{e.location}</p>}
                  </div>
                  <div className="max-w-[66ch]">
                    <h4 className="h2 text-[2rem] text-text sm:text-[2.4rem]">{e.role}</h4>
                    <p className="mt-2 font-semibold text-accent">{e.org}</p>
                    {e.bullets.length > 0 && (
                      <ul className="mt-5 space-y-2.5 leading-relaxed text-muted">
                        {e.bullets.map((b, i) => (
                          <li key={i} className="grid grid-cols-[1.5rem_1fr]">
                            <span aria-hidden className="font-mono text-xs leading-[1.9] text-accent">
                              {String.fromCharCode(97 + i)}.
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
                        className="link-draw mt-5 inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-accent"
                      >
                        {/* Name the site the link opens (it isn't always the organisation's own). */}
                        Visit {hostOf(e.link)} <ArrowUpRight size={14} aria-hidden />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Ledger>
        )}

        {education.length > 0 && (
          <Ledger title="Education">
            <ul>
              {education.map((ed) => (
                <li key={ed.id} className={ROW}>
                  <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted md:pt-1.5">{ed.period}</p>
                  <div className="max-w-[66ch]">
                    <h4 className="h3 text-2xl text-text">{ed.degree}</h4>
                    <p className="mt-1.5 font-semibold text-accent">{ed.institution}</p>
                    {ed.details && <p className="mt-3 leading-relaxed text-muted">{ed.details}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Ledger>
        )}
      </div>
    </Section>
  );
}

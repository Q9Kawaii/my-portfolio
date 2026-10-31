import { ArrowUpRight, Briefcase, GraduationCap } from "lucide-react";
import type { Education, Experience as Exp } from "@/lib/types";
import { Section } from "./ui";

export default function Experience({ experience, education }: { experience: Exp[]; education: Education[] }) {
  return (
    <Section id="experience" eyebrow="05 / Experience" title="Experience & education">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-text">
            <Briefcase size={20} className="text-accent" aria-hidden /> Work
          </h3>
          <ol className="mt-6 space-y-6 border-l border-line pl-6">
            {experience.map((e) => (
              <li key={e.id} className="relative">
                <span aria-hidden className="absolute -left-[31px] top-2 size-3 rounded-full border-2 border-accent bg-bg" />
                <div className="rounded-2xl border border-line bg-surface p-6">
                  <p className="font-mono text-sm text-accent">{e.period}</p>
                  <h4 className="mt-1 font-display text-lg font-semibold text-text">{e.role}</h4>
                  <p className="text-text">
                    {e.org}
                    {e.location && <span className="text-muted"> · {e.location}</span>}
                  </p>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted marker:text-accent">
                    {e.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  {e.link && (
                    <a
                      href={e.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                    >
                      Visit <ArrowUpRight size={15} aria-hidden />
                      <span className="sr-only">{e.org}</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-text">
            <GraduationCap size={20} className="text-accent" aria-hidden /> Education
          </h3>
          <ul className="mt-6 space-y-6">
            {education.map((ed) => (
              <li key={ed.id} className="rounded-2xl border border-line bg-surface p-6">
                <p className="font-mono text-sm text-accent">{ed.period}</p>
                <h4 className="mt-1 font-display text-lg font-semibold text-text">{ed.degree}</h4>
                <p className="text-text">{ed.institution}</p>
                {ed.details && <p className="mt-3 text-[15px] leading-relaxed text-muted">{ed.details}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

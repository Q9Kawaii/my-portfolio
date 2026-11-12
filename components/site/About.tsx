import type { SiteSettings, SkillGroup } from "@/lib/types";
import { Section } from "./ui";

export default function About({ s, skills }: { s: SiteSettings; skills: SkillGroup[] }) {
  const paragraphs = s.bio.split(/\n\s*\n/).filter(Boolean);
  const groups = skills.filter((g) => g.items.some((i) => i.trim()));

  return (
    <Section id="about" eyebrow="About" title="Engineer with a security mindset">
      <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {s.focusAreas.length > 0 && (
            <ul className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {s.focusAreas.map((f) => (
                <li key={f.title} className="card p-5">
                  <h3 className="text-sm font-semibold text-text">{f.title}</h3>
                  {f.description && <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {groups.length > 0 && (
          <div id="skills" className="card h-fit p-6">
            <h3 className="text-sm font-semibold text-text">Skills &amp; tools</h3>
            <dl className="mt-5 space-y-5">
              {groups.map((g) => (
                <div key={g.id}>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted">{g.name}</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {g.items
                      .map((i) => i.trim())
                      .filter(Boolean)
                      .map((t) => (
                        <span key={t} className="tag tag-hover">
                          {t}
                        </span>
                      ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </Section>
  );
}

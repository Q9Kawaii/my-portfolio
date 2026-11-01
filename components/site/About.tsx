import { MapPin } from "lucide-react";
import type { SiteSettings, SkillGroup } from "@/lib/types";
import { Section, SmartImage, Tag } from "./ui";

export default function About({ s, skills }: { s: SiteSettings; skills: SkillGroup[] }) {
  const paragraphs = s.bio.split(/\n\s*\n/).filter(Boolean);
  // One flat, de-duplicated tag list across all skill groups.
  const tags = [...new Set(skills.flatMap((g) => g.items.map((i) => i.trim()).filter(Boolean)))];

  return (
    <Section id="about" eyebrow="01 / About" title="About me">
      <div className="grid gap-12 md:grid-cols-[220px_1fr] md:gap-16">
        <div className="max-w-[220px]">
          {s.avatar && (
            <div className="card relative aspect-square w-full overflow-hidden">
              <SmartImage src={s.avatar} alt={`Portrait of ${s.name}`} fill sizes="220px" className="object-cover" />
            </div>
          )}
          {s.location && (
            <p className="mt-5 flex items-center gap-2 font-display text-sm text-text">
              <MapPin size={15} className="text-accent" aria-hidden /> {s.location}
            </p>
          )}
        </div>

        <div className="max-w-[62ch]">
          <div className="space-y-5 text-lg leading-relaxed text-text">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {s.focusAreas.length > 0 && (
            <ul className="mt-10 space-y-3">
              {s.focusAreas.map((f) => (
                <li key={f.title} className="leading-relaxed text-muted">
                  <span className="font-display text-sm font-bold text-text">
                    <span className="text-accent">+</span> {f.title}
                  </span>
                  {f.description && <> — {f.description}</>}
                </li>
              ))}
            </ul>
          )}

          {tags.length > 0 && (
            <div id="skills" className="mt-12">
              <h3 className="label">Skills &amp; tools</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <li key={t}>
                    <Tag>{t}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

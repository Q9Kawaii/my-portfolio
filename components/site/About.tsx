import { MapPin, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import TiltCard from "./TiltCard";
import { Section, SmartImage } from "./ui";

export default function About({ s }: { s: SiteSettings }) {
  const paragraphs = s.bio.split(/\n\s*\n/).filter(Boolean);
  return (
    <Section id="about" eyebrow="01 / About" title="Engineering with security in mind">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
        <TiltCard className="overflow-hidden">
          {s.avatar && (
            <div className="relative aspect-[4/5] w-full">
              <SmartImage
                src={s.avatar}
                alt={`Portrait of ${s.name}`}
                fill
                sizes="(min-width: 1024px) 320px, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex items-center gap-2 border-t border-line px-4 py-3 text-sm text-text [transform:translateZ(30px)]">
            <MapPin size={16} className="text-accent" aria-hidden /> {s.location}
          </div>
        </TiltCard>

        <div>
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {s.focusAreas.length > 0 && (
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {s.focusAreas.map((f) => (
                <li key={f.title} className="rounded-xl border border-line bg-surface p-5">
                  <ShieldCheck className="text-accent" size={22} aria-hidden />
                  <h3 className="mt-3 font-display font-semibold text-text">{f.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{f.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Section>
  );
}

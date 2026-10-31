import { ArrowUpRight, Award as AwardIcon } from "lucide-react";
import type { Award } from "@/lib/types";
import Masonry from "./Masonry";
import TiltCard from "./TiltCard";
import { Section, SmartImage } from "./ui";

export default function Awards({ awards }: { awards: Award[] }) {
  if (!awards.length) return null;
  return (
    <Section id="awards" eyebrow="06 / Awards" title="Awards & achievements">
      <Masonry>
        {awards.map((a) => (
          <TiltCard key={a.id} className="overflow-hidden">
            <article aria-labelledby={`a-${a.id}`}>
              {a.image && (
                // Fixed frame keeps layout stable while images load; certificates of any shape fit inside.
                <div className="relative aspect-[4/3] border-b border-line bg-surface-2">
                  <SmartImage
                    src={a.image}
                    alt={a.imageAlt || a.title}
                    fill
                    sizes="(min-width: 1280px) 380px, (min-width: 768px) 50vw, 100vw"
                    className="object-contain p-3"
                  />
                </div>
              )}
              <div className="p-6 [transform:translateZ(24px)]">
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent">
                  <AwardIcon size={14} aria-hidden /> {a.issuer} · {a.date}
                </p>
                <h3 id={`a-${a.id}`} className="mt-2 font-display text-lg font-semibold text-text">
                  {a.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{a.description}</p>
                {a.link && (
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
                  >
                    View certificate <ArrowUpRight size={15} aria-hidden />
                    <span className="sr-only">: {a.title}</span>
                  </a>
                )}
              </div>
            </article>
          </TiltCard>
        ))}
      </Masonry>
    </Section>
  );
}

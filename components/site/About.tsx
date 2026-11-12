import { existsSync } from "node:fs";
import path from "node:path";
import type { SiteSettings, SkillGroup } from "@/lib/types";
import { Section, SmartImage } from "./ui";

/** Candid photo shown as a CCTV still. Rendered only when the file is in /public. */
const CANDID = "/images/stock/candid.webp";
const hasCandid = existsSync(path.join(process.cwd(), "public", CANDID));

function CctvStill({ alt }: { alt: string }) {
  const corner = "absolute size-5 border-on-ink/90";
  return (
    <figure className="group relative aspect-[3/4] w-full overflow-hidden border border-line bg-ink">
      <SmartImage
        src={CANDID}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 380px, 90vw"
        className="object-cover grayscale contrast-[1.15] brightness-[0.92] transition-transform duration-700 group-hover:scale-[1.03]"
      />
      {/* Scanlines: one static gradient, no animation. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgb(0 0 0 / 0.5) 0 1px, transparent 1px 3px)" }}
      />
      <span aria-hidden className={`${corner} left-3 top-3 border-l-2 border-t-2`} />
      <span aria-hidden className={`${corner} right-3 top-3 border-r-2 border-t-2`} />
      <span aria-hidden className={`${corner} bottom-3 left-3 border-b-2 border-l-2`} />
      <span aria-hidden className={`${corner} bottom-3 right-3 border-b-2 border-r-2`} />
      <span aria-hidden className="absolute left-6 top-6 flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.12em] text-white">
        <span className="caret size-2 rounded-full bg-[#ff3b30]" /> REC · CAM 02
      </span>
      <span aria-hidden className="absolute bottom-6 right-6 font-mono text-[0.68rem] tracking-[0.12em] text-white/85">
        SUBJECT: OFF DUTY
      </span>
    </figure>
  );
}

export default function About({ s, skills }: { s: SiteSettings; skills: SkillGroup[] }) {
  const paragraphs = s.bio.split(/\n\s*\n/).filter(Boolean);
  const groups = skills.filter((g) => g.items.some((i) => i.trim()));

  return (
    <Section id="about" index="01" eyebrow="Background" title="About the subject">
      <div className={`grid gap-12 ${hasCandid ? "lg:grid-cols-[380px_1fr] lg:gap-16" : ""}`}>
        {hasCandid && (
          <div className="mx-auto w-full max-w-[380px] lg:mx-0">
            <CctvStill alt={`${s.name}, candid photo in a café`} />
          </div>
        )}

        <div>
          <div className="max-w-[62ch] space-y-5 text-lg leading-relaxed text-muted [&>p:first-child]:text-xl [&>p:first-child]:text-text">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {s.focusAreas.length > 0 && (
            <ol className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-3">
              {s.focusAreas.map((f, i) => (
                <li key={f.title} className="bg-bg p-5">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-accent">Focus 0{i + 1}</p>
                  <h3 className="h3 mt-3 text-lg text-text">{f.title}</h3>
                  {f.description && <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{f.description}</p>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {groups.length > 0 && (
        <div id="skills" className="mt-20">
          <div className="flex items-center gap-4">
            <h3 className="mono-label shrink-0">Known capabilities</h3>
            <span aria-hidden className="h-px flex-1 bg-line" />
          </div>
          <dl className="mt-2">
            {groups.map((g, i) => (
              <div key={g.id} className="grid gap-3 border-b border-dashed border-line py-5 md:grid-cols-[260px_1fr] md:gap-8">
                <dt className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="h3 text-xl text-text">{g.name}</span>
                </dt>
                <dd className="flex flex-wrap gap-1.5">
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
    </Section>
  );
}

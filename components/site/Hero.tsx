import { ArrowDown, Download } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import HeroCanvas from "./HeroCanvas";
import { WRAP } from "./ui";

export default function Hero({ s }: { s: SiteSettings }) {
  return (
    <section id="top" aria-label="Introduction" className={`${WRAP} pb-12 pt-32 md:pb-20 md:pt-44`}>
      <div className="flex flex-col-reverse items-start gap-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="label">&gt; hello, world</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1] tracking-tight text-text sm:text-5xl md:text-6xl">
            {s.name}
          </h1>
          <p className="mt-4 text-lg text-muted sm:text-xl">{s.role}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#projects" className="btn btn-primary">
              View work <ArrowDown size={16} aria-hidden />
            </a>
            <a href={s.cvUrl} download className="btn btn-ghost">
              <Download size={16} aria-hidden /> Download CV
            </a>
          </div>
        </div>

        {/* Square frame; HeroScene fits the camera so the atom never touches the edges. */}
        <div className="size-44 shrink-0 self-center sm:size-56 md:size-64">
          <HeroCanvas />
        </div>
      </div>
    </section>
  );
}

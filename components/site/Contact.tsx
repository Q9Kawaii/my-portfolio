import { ArrowUpRight, Phone } from "lucide-react";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import ContactForm from "./ContactForm";
import SocialLinks from "./SocialLinks";
import { Section } from "./ui";

export default function Contact({ s }: { s: SiteSettings }) {
  return (
    <Section
      id="contact"
      index="05"
      eyebrow="Contact"
      title="Open a new case"
      intro="Hiring for an internship, or want to talk about a project? Send a message and I'll get back to you."
    >
      <div className="grid gap-14 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
        <div>
          <p className="mono-label">Direct line</p>
          <a
            href={`mailto:${s.email}`}
            className="link-draw mt-3 inline-block break-all text-2xl font-semibold tracking-[-0.02em] text-text [font-stretch:85%] hover:text-accent sm:text-3xl"
          >
            {s.email}
          </a>
          {s.showPhone && s.phone && (
            <a
              href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}
              className="mt-4 flex items-center gap-2 font-mono text-sm text-text hover:text-accent"
            >
              <Phone className="shrink-0 text-accent" size={16} aria-hidden />
              {s.phone}
            </a>
          )}

          <p className="mono-label mt-10">Elsewhere</p>
          <div className="mt-3">
            <SocialLinks socials={s.socials} />
          </div>

          <div className="mt-10 border border-dashed border-line p-5">
            <p className="mono-label">Need a website or app built?</p>
            <Link
              href="/services"
              className="link-draw mt-2 inline-flex items-center gap-1 text-lg font-semibold text-accent"
            >
              See freelance services <ArrowUpRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
        <ContactForm fallbackEmail={s.email} />
      </div>
    </Section>
  );
}

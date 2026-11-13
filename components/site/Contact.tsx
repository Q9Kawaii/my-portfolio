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

          {/* Freelance callout: solid accent card so it reads as the main way to hire me for a project. */}
          <Link
            href="/services"
            className="group relative mt-10 block overflow-hidden bg-accent p-6 text-on-accent shadow-[var(--shadow-hard)] transition-transform hover:-translate-y-0.5"
          >
            <span className="inline-flex items-center gap-2 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-current" />
              </span>
              Available for freelance
            </span>
            <span className="h3 mt-3 block text-2xl sm:text-3xl">Need a website or app built?</span>
            <span className="mt-2 block max-w-[42ch] leading-relaxed opacity-90">
              Websites, web apps and custom software. Fixed quotes, pay securely online, starting at ₹499.
            </span>
            <span className="mt-5 inline-flex items-center gap-2 border-[1.5px] border-current px-4 py-2 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.08em]">
              See services &amp; pricing
              <ArrowUpRight size={15} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
        <ContactForm fallbackEmail={s.email} />
      </div>
    </Section>
  );
}

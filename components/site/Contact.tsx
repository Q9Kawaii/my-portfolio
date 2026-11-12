import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import ContactForm from "./ContactForm";
import SocialLinks from "./SocialLinks";
import { Section } from "./ui";

export default function Contact({ s }: { s: SiteSettings }) {
  return (
    <Section
      id="contact"
      eyebrow="05 / Contact"
      title="Get in touch"
      intro="Hiring for an internship, or want to talk about a project? Send a message and I'll get back to you."
    >
      <div className="grid gap-12 md:grid-cols-[1fr_1.5fr]">
        <div className="space-y-5">
          <a
            href={`mailto:${s.email}`}
            className="flex items-center gap-3 break-all font-display text-sm text-text underline-offset-4 hover:text-accent hover:underline"
          >
            <Mail className="shrink-0 text-accent" size={18} aria-hidden />
            {s.email}
          </a>
          {s.showPhone && s.phone && (
            <a
              href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}
              className="flex items-center gap-3 font-display text-sm text-text underline-offset-4 hover:text-accent hover:underline"
            >
              <Phone className="shrink-0 text-accent" size={18} aria-hidden />
              {s.phone}
            </a>
          )}
          <div className="pt-3">
            <SocialLinks socials={s.socials} />
          </div>
          <p className="pt-3 text-sm text-muted">
            Need a website or app built?{" "}
            <Link href="/services" className="font-display text-text underline underline-offset-4 hover:text-accent">
              Freelance services →
            </Link>
          </p>
        </div>
        <ContactForm fallbackEmail={s.email} />
      </div>
    </Section>
  );
}

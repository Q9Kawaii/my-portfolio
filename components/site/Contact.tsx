import { Download, Mail, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import ContactForm from "./ContactForm";
import SocialLinks from "./SocialLinks";
import { Section } from "./ui";

export default function Contact({ s }: { s: SiteSettings }) {
  return (
    <Section
      id="contact"
      eyebrow="07 / Contact"
      title="Let's build something secure"
      intro="Hiring for an internship, or want to talk about a project? Send a message and I'll get back to you."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <a
            href={`mailto:${s.email}`}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 text-text transition hover:border-accent"
          >
            <Mail className="text-accent" size={20} aria-hidden />
            <span className="break-all">{s.email}</span>
          </a>
          {s.showPhone && s.phone && (
            <a
              href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 text-text transition hover:border-accent"
            >
              <Phone className="text-accent" size={20} aria-hidden />
              {s.phone}
            </a>
          )}
          <a
            href={s.cvUrl}
            download
            className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 text-text transition hover:border-accent"
          >
            <Download className="text-accent" size={20} aria-hidden />
            Download CV (PDF)
          </a>
          <div className="pt-2">
            <SocialLinks socials={s.socials} />
          </div>
        </div>
        <ContactForm fallbackEmail={s.email} />
      </div>
    </Section>
  );
}

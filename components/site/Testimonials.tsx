import type { PublicTestimonial } from "@/lib/testimonials";
import { Section } from "./ui";

/** "Case notes": approved client testimonials. Renders nothing until at least one is approved. */
export default function Testimonials({ items, index }: { items: PublicTestimonial[]; index?: string }) {
  if (!items.length) return null;
  return (
    <Section id="testimonials" index={index} eyebrow="Case notes" title="What people say" tinted>
      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <li key={t.id}>
            <figure className="card flex h-full flex-col p-6">
              <span aria-hidden className="display text-6xl leading-none text-accent">
                &ldquo;
              </span>
              <blockquote className="mt-1 whitespace-pre-line leading-relaxed text-text">{t.quote}</blockquote>
              <figcaption className="mt-auto border-t border-line pt-4">
                <span className="block font-semibold text-text">{t.name}</span>
                <span className="mt-0.5 block text-sm text-muted">
                  {[t.role, t.company].filter(Boolean).join(", ")}
                </span>
                {t.project && <span className="mono-label mt-2 block">Project: {t.project}</span>}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Section>
  );
}

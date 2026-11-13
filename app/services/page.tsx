import { Check, Mail, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import CopyEmailButton from "@/components/site/CopyEmailButton";
import Testimonials from "@/components/site/Testimonials";
import { Section, WRAP } from "@/components/site/ui";
import { DEMOS } from "@/lib/demos";
import { getApprovedTestimonials } from "@/lib/testimonials-server";
import { WhatsAppIcon } from "@/components/site/WhatsAppButton";
import { PLANS, PROCESS, SECURITY_AUDIT, SERVICE_AREAS, SERVICES_CONTACT, inr, whatsappLink } from "@/lib/services";

export const metadata: Metadata = {
  title: "Freelance Services",
  description:
    "Websites, web apps, custom software and security check-ups by Yash Dingar, with fixed upfront pricing and secure payment.",
  alternates: { canonical: "/services" },
};

// Rebuilt at most every 10 minutes, and immediately when a testimonial is approved (see /api/testimonials).
export const revalidate = 600;

export default async function ServicesPage() {
  const mailto = `mailto:${SERVICES_CONTACT.email}?subject=${encodeURIComponent("Project enquiry")}`;
  const testimonials = await getApprovedTestimonials(6);

  return (
    <>
      <section className={`${WRAP} pb-4 pt-16 md:pt-24`}>
        <p className="label">Freelance</p>
        <h1 className="mt-4 max-w-[22ch] text-3xl font-semibold leading-[1.15] tracking-tight text-text sm:text-4xl">
          Websites and software, built properly.
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">
          I&apos;m a B.Tech CSE student and full-stack developer taking on a few freelance projects alongside college. I
          build new sites and apps, and run{" "}
          <a href="#security" className="text-accent underline underline-offset-4">
            security check-ups
          </a>{" "}
          on ones you already have. Every project gets a written quote with a fixed price and timeline before any payment.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href={mailto} className="btn btn-primary">
            <Mail size={16} aria-hidden /> Get a quote
          </a>
          <Link href="/#projects" className="btn btn-ghost">
            See my work
          </Link>
        </div>
      </section>

      <Section id="what" eyebrow="Services" title="What I can do for you">
        <div className="grid gap-5 sm:grid-cols-2">
          {SERVICE_AREAS.map((a, i) =>
            i === SERVICE_AREAS.length - 1 ? (
              // The security check-up spans the row and points to its own section.
              <a key={a.title} href="#security" className="card card-hover flex flex-col gap-3 border-accent p-6 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="flex items-center gap-2 text-base font-semibold text-text">
                    <ShieldCheck size={18} className="text-accent" aria-hidden /> {a.title}
                    <span className="stamp px-1.5 py-0 text-[0.6rem]">New</span>
                  </span>
                  <span className="mt-2 block leading-relaxed text-muted">{a.description}</span>
                </span>
                <span className="shrink-0 text-sm font-semibold text-accent">What&apos;s included ↓</span>
              </a>
            ) : (
              <div key={a.title} className="card p-6">
                <h3 className="text-base font-semibold text-text">{a.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{a.description}</p>
              </div>
            ),
          )}
        </div>
      </Section>

      <Section
        id="pricing"
        eyebrow="Pricing"
        title="Clear, upfront pricing"
        intro="Base prices for each service. If your project needs more, the written quote says so and I send a payment link for that exact amount."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div key={p.id} className={`card flex flex-col p-6 ${p.featured ? "ring-2 ring-accent" : ""}`}>
              <h3 className="text-base font-semibold text-text">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.blurb}</p>
              <p className="mt-5 text-2xl font-semibold text-text">
                {inr(p.price)}
                {p.unit && <span className="text-sm font-normal text-muted"> {p.unit}</span>}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                {p.payUrl ? (
                  <a href={p.payUrl} className={`btn btn-sm w-full ${p.featured ? "btn-primary" : "btn-ghost"}`}>
                    Pay {inr(p.price)}
                  </a>
                ) : (
                  <a href={mailto} className="btn btn-sm btn-ghost w-full">
                    Ask for a quote
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-[70ch] text-sm leading-relaxed text-muted">
          All prices in INR. Please pay only after we&apos;ve agreed on the scope in writing. Payments are processed
          securely by Razorpay. By paying you agree to the <Link href="/services/terms" className="text-accent underline underline-offset-4">Terms</Link>,{" "}
          <Link href="/services/refund" className="text-accent underline underline-offset-4">Refund Policy</Link> and{" "}
          <Link href="/services/privacy" className="text-accent underline underline-offset-4">Privacy Policy</Link>.
        </p>
      </Section>

      <Section
        id="security"
        eyebrow="Security check-up"
        title="Already have a site or app?"
        intro="I'll check it the way an attacker would, then tell you plainly what's wrong and how to fix it. Quoted per project, based on its size."
        tinted
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="card p-6 sm:p-8">
            <p className="mono-label">What I check</p>
            <ul className="mt-4 space-y-3">
              {SECURITY_AUDIT.checks.map((c) => (
                <li key={c} className="flex gap-3 leading-relaxed text-text">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="card flex flex-col p-6 sm:p-8">
            <p className="mono-label">What you get</p>
            <ul className="mt-4 space-y-3">
              {SECURITY_AUDIT.deliverables.map((d) => (
                <li key={d} className="flex gap-3 leading-relaxed text-text">
                  <Check size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden />
                  {d}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${SERVICES_CONTACT.email}?subject=${encodeURIComponent("Security check-up")}`} className="btn btn-primary btn-sm">
                <Mail size={15} aria-hidden /> Get a quote
              </a>
              <a
                href={whatsappLink("Hi Yash, I'd like a security check-up for my website/app.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                <span className="text-[#1fa855]">
                  <WhatsAppIcon size={16} />
                </span>
                WhatsApp
              </a>
            </div>
            <p className="mt-auto pt-6 text-sm leading-relaxed text-muted">
              I only test systems you own or have authority over, with your written permission, and I never touch real
              user data. See how I think about this in my{" "}
              <Link href="/lab" className="text-accent underline underline-offset-4">
                security lab
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="samples"
        eyebrow="Sample work"
        title="Try a demo"
        intro="Working demos for made-up businesses. Click around: bookings, filters and forms all work."
      >
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DEMOS.map((d) => (
            <li key={d.slug}>
              <Link href={`/demos/${d.slug}`} className="card card-hover group flex h-full flex-col p-5">
                <span aria-hidden className="mb-4 flex h-2 overflow-hidden">
                  {d.swatch.map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
                <span className="mono-label">{d.kind}</span>
                <span className="mt-1 text-lg font-semibold text-text group-hover:text-accent">{d.business}</span>
                <span className="mt-2 text-sm leading-relaxed text-muted">{d.summary}</span>
                <span className="mt-auto pt-4 text-sm font-semibold text-accent">Open demo →</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link href="/demos" className="text-sm text-accent underline underline-offset-4">
            See all demos
          </Link>
        </p>
      </Section>

      <Testimonials items={testimonials} />

      <Section id="process" eyebrow="Process" title="How it works">
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((step, i) => (
            <li key={step.title} className="border-l-2 border-line pl-4">
              <p className="text-sm text-accent">0{i + 1}</p>
              <h3 className="mt-1 text-base font-semibold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section className={`${WRAP} pb-24`}>
        <div className="card flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text">Have a project in mind?</h2>
            <p className="mt-2 text-muted">Email me what you need. I usually reply within a day.</p>
          </div>
          <CopyEmailButton email={SERVICES_CONTACT.email} />
        </div>
      </section>
    </>
  );
}

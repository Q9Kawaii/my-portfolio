import { Check, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Section, WRAP } from "@/components/site/ui";
import { PLANS, PROCESS, SERVICE_AREAS, SERVICES_CONTACT, inr } from "@/lib/services";

export const metadata: Metadata = {
  title: "Freelance Services",
  description: "Websites, web apps and custom software by Yash Dingar, with fixed upfront pricing and secure payment.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const mailto = `mailto:${SERVICES_CONTACT.email}?subject=${encodeURIComponent("Project enquiry")}`;

  return (
    <>
      <section className={`${WRAP} pb-4 pt-16 md:pt-24`}>
        <p className="label">Freelance</p>
        <h1 className="mt-4 max-w-[22ch] text-3xl font-semibold leading-[1.15] tracking-tight text-text sm:text-4xl">
          Websites and software, built properly.
        </h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">
          I&apos;m a B.Tech CSE student and full-stack developer taking on a few freelance projects alongside college.
          Every project gets a written quote with a fixed price and timeline before any payment.
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

      <Section id="what" eyebrow="Services" title="What I can build for you">
        <div className="grid gap-5 sm:grid-cols-2">
          {SERVICE_AREAS.map((a) => (
            <div key={a.title} className="card p-6">
              <h3 className="text-base font-semibold text-text">{a.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{a.description}</p>
            </div>
          ))}
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
          <a href={mailto} className="btn btn-primary">
            <Mail size={16} aria-hidden /> {SERVICES_CONTACT.email}
          </a>
        </div>
      </section>
    </>
  );
}

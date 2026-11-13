import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import SubPageShell from "@/components/site/SubPageShell";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { WRAP } from "@/components/site/ui";
import { DEMOS, demoPlan } from "@/lib/demos";
import { inr } from "@/lib/services";

export const metadata: Metadata = {
  title: "Client Demos",
  description:
    "Sample sites and apps by Yash Dingar for fictional businesses: a café website, a dental booking app, a coaching institute site and a stock & invoice dashboard.",
  alternates: { canonical: "/demos" },
};

/** A tiny wireframe in each demo's colours, so the gallery needs no screenshots. */
function Thumb({ sw, name }: { sw: [string, string, string]; name: string }) {
  const [bg, ink, accent] = sw;
  return (
    <div aria-hidden className="relative aspect-[16/10] overflow-hidden border border-line" style={{ background: bg, color: ink }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${ink}22` }}>
        <span className="text-[0.7rem] font-bold tracking-tight">{name}</span>
        <span className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-6 rounded-full" style={{ background: `${ink}33` }} />
          ))}
        </span>
      </div>
      <div className="px-4 pt-5">
        <span className="block h-3 w-2/3 rounded-sm" style={{ background: ink }} />
        <span className="mt-2 block h-3 w-1/2 rounded-sm" style={{ background: ink }} />
        <span className="mt-4 block h-1.5 w-3/4 rounded-full" style={{ background: `${ink}40` }} />
        <span className="mt-1.5 block h-1.5 w-2/3 rounded-full" style={{ background: `${ink}40` }} />
        <span className="mt-4 inline-block h-5 w-20 rounded" style={{ background: accent }} />
      </div>
      <div className="absolute inset-x-4 bottom-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-8 rounded" style={{ background: `${ink}12`, border: `1px solid ${ink}1f` }} />
        ))}
      </div>
    </div>
  );
}

export default function DemosIndex() {
  return (
    <SubPageShell section="Client demos" backHref="/services" backLabel="Services">
      <section className={`${WRAP} pb-6 pt-14 md:pt-20`}>
        <div className="flex items-center gap-4">
          <p className="label shrink-0">Sample work</p>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>
        <h1 className="display mt-7 text-[3.4rem] text-text sm:text-7xl lg:text-[6.5rem]">What yours could look like</h1>
        <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-muted">
          Four working demos for made-up businesses, each with its own design. Click around: the forms, bookings and filters all
          work, using sample data that stays in your browser.
        </p>
      </section>

      <section aria-label="Demos" className={`${WRAP} pb-24`}>
        <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2">
          {DEMOS.map((d) => {
            const plan = demoPlan(d);
            return (
              <li key={d.slug}>
                <Link href={`/demos/${d.slug}`} className="group block">
                  <div className="transition-transform duration-300 group-hover:-translate-y-1">
                    <Thumb sw={d.swatch} name={d.business} />
                  </div>
                  <p className="mono-label mt-5">{d.kind}</p>
                  <h2 className="h3 mt-1 text-3xl text-text group-hover:text-accent">{d.business}</h2>
                  <p className="mt-2 leading-relaxed text-muted">{d.summary}</p>
                  <p className="mt-3 flex flex-wrap gap-1.5">
                    {d.features.map((f) => (
                      <span key={f} className="tag">
                        {f}
                      </span>
                    ))}
                  </p>
                  <p className="mt-5 flex flex-wrap items-center gap-4">
                    <span className="btn btn-primary btn-sm">
                      Open demo <ArrowRight size={14} aria-hidden />
                    </span>
                    <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-muted">
                      {plan.name} plan · from {inr(plan.price)}
                    </span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-16 max-w-[66ch] text-sm leading-relaxed text-muted">
          These businesses are fictional and the data is made up. Your site would use your real content, branding and, where
          needed, a real database, login and payments.
        </p>
      </section>
      <WhatsAppButton message="Hi Yash, I was looking at your demos and I'd like a website or app for my business." />
    </SubPageShell>
  );
}

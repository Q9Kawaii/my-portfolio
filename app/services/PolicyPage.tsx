import Link from "next/link";
import type { ReactNode } from "react";
import { WRAP } from "@/components/site/ui";

export function PolicyPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className={`${WRAP} py-16 md:py-24`}>
      <p className="label">&gt; services / policy</p>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-text">{title}</h1>
      <div className="card mt-10 max-w-[75ch] space-y-6 p-6 leading-relaxed text-muted sm:p-8 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-text">
        {children}
      </div>
      <Link href="/services" className="mt-8 inline-block font-display text-sm text-text underline-offset-4 hover:text-accent hover:underline">
        ← Back to services
      </Link>
    </article>
  );
}

export function P({ h, children }: { h?: string; children: ReactNode }) {
  return (
    <section>
      {h && <h2 className="mb-2">{h}</h2>}
      <p>{children}</p>
    </section>
  );
}

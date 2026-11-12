import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { WRAP } from "@/components/site/ui";
import { LAB_EXHIBITS } from "@/lib/lab/exhibits";

export const metadata: Metadata = {
  title: "Security Lab",
  description:
    "Interactive security demos by Yash Dingar: a security-headers checker, password breach check, RBAC playground, SQL injection and XSS before/after, and a JWT inspector.",
  alternates: { canonical: "/lab" },
};

export default function LabIndex() {
  return (
    <>
      <section className={`${WRAP} pb-8 pt-14 md:pt-20`}>
        <div className="flex items-center gap-4">
          <p className="label shrink-0">Security lab</p>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>
        <h1 className="display mt-7 text-[3.4rem] text-text sm:text-7xl lg:text-[6.5rem]">Evidence you can run</h1>
        <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-muted">
          Five small tools that show how I think about web security: how attacks work, how the fixes work, and how to check
          your own site. Everything here is passive or runs in your browser. Nothing attacks a real system.
        </p>
      </section>

      <section aria-label="Exhibits" className={`${WRAP} pb-24`}>
        <ol className="mt-8 divide-y divide-line border-y border-line">
          {LAB_EXHIBITS.map((ex) => (
            <li key={ex.slug}>
              <Link
                href={`/lab/${ex.slug}`}
                className="group grid gap-4 py-8 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-8"
              >
                <span className="display text-6xl text-accent sm:text-7xl" aria-hidden>
                  {ex.letter}
                </span>
                <span>
                  <span className="mono-label">Exhibit {ex.letter}</span>
                  <span className="h3 mt-1 block text-2xl text-text group-hover:text-accent sm:text-3xl">{ex.title}</span>
                  <span className="mt-2 block max-w-[62ch] leading-relaxed text-muted">{ex.summary}</span>
                  <span className="mt-3 flex flex-wrap gap-1.5">
                    {ex.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="btn btn-ghost btn-sm justify-self-start sm:justify-self-end">
                  Open <ArrowRight size={14} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-[70ch] text-sm leading-relaxed text-muted">
          Want the full version? My{" "}
          <a href="https://github.com/Q9Kawaii/web-vuln-scanner" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">
            VulnScan
          </a>{" "}
          command-line scanner crawls a site and flags SQL injection, XSS and CSRF risks, without ever exploiting them.
        </p>
      </section>
    </>
  );
}

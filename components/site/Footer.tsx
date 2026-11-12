import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { WRAP } from "./ui";

/** Quiet sign-off: one thin rule and a single mono line. */
export default function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer className="border-t border-line">
      {/* Phones: extra bottom room so the fixed tab bar never covers the last line. */}
      <div
        className={`${WRAP} flex flex-col items-start justify-between gap-3 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-8 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted sm:flex-row sm:items-center md:pb-8`}
      >
        <p>
          © {new Date().getFullYear()} {s.name} <span aria-hidden className="mx-1.5 text-line">/</span> End of file
        </p>
        <div className="-ml-2 flex items-center gap-2 sm:ml-0">
          <Link href="/lab" className="link-draw px-2 py-2.5 hover:text-text">
            Security lab
          </Link>
          <Link href="/services" className="link-draw px-2 py-2.5 hover:text-text">
            Services
          </Link>
          <a href="#top" className="link-draw px-2 py-2.5 hover:text-text">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}

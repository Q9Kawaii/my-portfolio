import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { WRAP } from "./ui";

export default function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer className="border-t border-line bg-ink text-on-ink">
      {/* Phones: extra bottom room so the fixed tab bar never covers the last line. */}
      <div className={`${WRAP} pb-[calc(5.6rem+env(safe-area-inset-bottom))] pt-14 md:pb-8`}>
        {/* The name set as one huge condensed line: the page's closing type moment. */}
        <p aria-hidden className="display select-none text-[clamp(3.5rem,17vw,13rem)] leading-[0.8] opacity-95">
          {s.name}
        </p>
        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-on-ink/20 pt-6 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-on-ink/70 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {s.name} · End of file
          </p>
          <div className="flex items-center gap-6">
            <Link href="/services" className="link-draw py-2 hover:text-on-ink">
              Services
            </Link>
            <a href="#top" className="link-draw py-2 hover:text-on-ink">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { WRAP } from "./ui";

export default function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer className="border-t-2 border-line">
      <div className={`${WRAP} flex flex-col items-start justify-between gap-4 py-10 font-display text-xs text-muted sm:flex-row sm:items-center`}>
        <p>
          © {new Date().getFullYear()} {s.name}
        </p>
        <div className="flex items-center gap-5">
          <Link href="/services" className="text-muted underline-offset-4 hover:text-accent hover:underline">
            services
          </Link>
          <a href="#top" className="text-text underline-offset-4 hover:text-accent hover:underline">
            ↑ back to top
          </a>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { WRAP } from "./ui";

export default function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer className="border-t border-line">
      <div className={`${WRAP} flex flex-col items-start justify-between gap-4 py-10 text-sm text-muted sm:flex-row sm:items-center`}>
        <p>
          © {new Date().getFullYear()} {s.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/services" className="hover:text-text">
            Services
          </Link>
          <a href="#top" className="hover:text-text">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}

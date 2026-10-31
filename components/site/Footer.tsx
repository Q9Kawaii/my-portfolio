import { ArrowUp } from "lucide-react";
import type { SiteSettings } from "@/lib/types";
import SocialLinks from "./SocialLinks";

export default function Footer({ s }: { s: SiteSettings }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
        <p className="text-muted">
          © {new Date().getFullYear()} {s.name}. Built with Next.js, React Three Fiber and Firebase.
        </p>
        <div className="flex items-center gap-3">
          <SocialLinks socials={s.socials} size={18} />
          <a
            href="#top"
            aria-label="Back to top"
            className="grid size-11 place-items-center rounded-lg bg-accent text-bg transition hover:brightness-110"
          >
            <ArrowUp size={18} aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}

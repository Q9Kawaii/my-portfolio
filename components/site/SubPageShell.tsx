import Link from "next/link";
import type { ReactNode } from "react";
import ThemeToggle from "../ThemeToggle";
import { WRAP } from "./ui";

/** Header and footer for standalone pages (lab, demos): logo home, one back link, theme switch. */
export default function SubPageShell({
  section,
  backHref = "/",
  backLabel = "Portfolio",
  children,
}: {
  /** Mono label shown next to the logo, e.g. "Security lab". */
  section: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="border-b border-line bg-bg">
        <nav aria-label={section} className={`${WRAP} flex h-16 items-center justify-between gap-4`}>
          <Link href="/" aria-label="Yash Dingar, home" className="flex min-h-11 items-center gap-3">
            <span className="grid size-8 place-items-center bg-ink font-mono text-[0.7rem] font-semibold text-on-ink">YD</span>
            <span className="mono-label hidden sm:inline">{section}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={backHref} className="link-draw px-2 py-2.5 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-muted hover:text-text">
              ← {backLabel}
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="border-t border-line">
        <div className={`${WRAP} flex flex-col gap-3 py-8 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted sm:flex-row sm:items-center sm:justify-between`}>
          <p>
            © {new Date().getFullYear()} Yash Dingar <span aria-hidden className="mx-1.5 text-line">/</span> {section}
          </p>
          <Link href="/" className="link-draw self-start py-2 hover:text-text sm:self-auto">
            yashdingar.in
          </Link>
        </div>
      </footer>
    </>
  );
}

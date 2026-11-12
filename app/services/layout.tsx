import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { WRAP } from "@/components/site/ui";
import { POLICY_LINKS, SERVICES_CONTACT } from "@/lib/services";

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b-2 border-line bg-bg">
        <nav aria-label="Services" className={`${WRAP} flex h-16 items-center justify-between`}>
          <Link href="/" className="flex items-center gap-3 font-display text-sm font-bold text-text">
            <span className="grid size-9 place-items-center border-2 border-line bg-accent text-on-accent">YD</span>
            <span className="hidden sm:inline">yash_dingar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-2 font-display text-[13px] text-text underline-offset-4 hover:text-accent hover:underline"
            >
              ← Portfolio
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="border-t-2 border-line">
        <div className={`${WRAP} flex flex-col gap-4 py-10 font-display text-xs text-muted sm:flex-row sm:items-center sm:justify-between`}>
          <p>
            © {new Date().getFullYear()} {SERVICES_CONTACT.name} · Freelance services
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {POLICY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-text underline-offset-4 hover:text-accent hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    </>
  );
}

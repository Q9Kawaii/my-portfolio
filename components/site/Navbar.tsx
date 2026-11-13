"use client";
import { Award, Briefcase, Download, FolderOpen, Mail, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import { WRAP } from "./ui";

const LINKS = [
  { id: "about", label: "About", short: "About", Icon: User },
  { id: "projects", label: "Projects", short: "Work", Icon: FolderOpen },
  { id: "experience", label: "Experience", short: "Record", Icon: Briefcase },
  { id: "awards", label: "Awards", short: "Awards", Icon: Award },
  { id: "contact", label: "Contact", short: "Contact", Icon: Mail },
] as const;

/**
 * Which section is on screen. One IntersectionObserver (no scroll handler doing layout reads),
 * so it stays cheap on phones. A section counts as active while it crosses the upper-middle band.
 */
function useActiveSection() {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    // Back at the top: nothing active.
    const top = document.getElementById("top");
    const ioTop = new IntersectionObserver(([e]) => e.isIntersecting && setActive(""), { rootMargin: "0px 0px -60% 0px" });
    if (top) ioTop.observe(top);
    return () => {
      io.disconnect();
      ioTop.disconnect();
    };
  }, []);
  return active;
}

export default function Navbar({ name, cvUrl }: { name: string; cvUrl?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();

  useEffect(() => {
    // Only flips a boolean; React skips the render when it doesn't change.
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${
          // Solid on phones (backdrop blur is the classic cause of janky scrolling there); frosted on desktop.
          scrolled ? "border-line bg-bg/95 md:bg-bg/80 md:backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:bg-ink focus:px-3 focus:py-2 focus:text-on-ink"
        >
          Skip to content
        </a>
        <nav aria-label="Primary" className={`${WRAP} flex h-16 items-center justify-between`}>
          <a href="#top" aria-label={`${name}, back to top`} className="flex min-h-11 items-center gap-2.5 font-semibold text-text">
            <span className="grid size-8 place-items-center bg-ink font-mono text-[0.7rem] font-semibold text-on-ink">
              {initials}
            </span>
          </a>

          <div className="flex items-center gap-2">
            <ul className="hidden items-center md:flex">
              {LINKS.map((l, i) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={active === l.id ? "true" : undefined}
                    className={`flex items-baseline gap-1.5 px-3 py-2 font-mono text-[0.72rem] uppercase tracking-[0.1em] transition-colors hover:text-text ${
                      active === l.id ? "text-accent" : "text-muted"
                    }`}
                  >
                    <span className="text-[0.62rem] opacity-70">0{i + 1}</span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            {/* Highlighted: the way to hire me for a project. Accent fill + live dot sets it apart from section links. */}
            <Link
              href="/services"
              className="inline-flex min-h-10 items-center gap-2 bg-accent px-3 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-on-accent shadow-[var(--shadow-hard-sm)] transition-transform hover:-translate-y-px md:ml-2 md:px-3.5"
            >
              <span aria-hidden className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-current" />
              </span>
              <span className="sm:hidden">Hire me</span>
              <span className="hidden sm:inline">Freelance</span>
            </Link>
            {cvUrl && (
              <a href={cvUrl} download className="btn btn-ghost btn-sm md:hidden" aria-label="Download CV">
                <Download size={14} aria-hidden /> CV
              </a>
            )}
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Phones: a thumb-reach tab bar instead of a hamburger. Clears the iPhone home indicator. */}
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg/97 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-5">
          {LINKS.map(({ id, short, label, Icon }) => {
            const on = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-label={label}
                  aria-current={on ? "true" : undefined}
                  className={`relative flex h-[3.6rem] flex-col items-center justify-center gap-1 font-mono text-[0.62rem] uppercase tracking-[0.08em] transition-colors [-webkit-tap-highlight-color:transparent] active:bg-surface-2 ${
                    on ? "text-accent" : "text-muted"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-x-4 top-0 h-0.5 bg-accent transition-transform duration-300 ${on ? "scale-x-100" : "scale-x-0"}`}
                  />
                  <Icon size={18} strokeWidth={on ? 2.2 : 1.8} aria-hidden />
                  {short}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

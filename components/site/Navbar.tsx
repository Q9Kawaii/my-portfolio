"use client";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import { WRAP } from "./ui";

const LINKS = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#awards", label: "Awards" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-line bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>
      <nav aria-label="Primary" className={`${WRAP} flex h-16 items-center justify-between`}>
        <a href="#top" className="flex items-center gap-3 font-display text-sm font-bold text-text">
          <span className="grid size-9 place-items-center border-2 border-line bg-accent text-on-accent">{initials}</span>
          <span className="hidden sm:inline">{name.toLowerCase().replace(/\s+/g, "_")}</span>
        </a>

        <div className="flex items-center gap-1 md:gap-2">
          <ul className="hidden items-center md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="px-3 py-2 font-display text-[13px] text-text underline-offset-4 hover:text-accent hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="ml-2 grid size-10 place-items-center border-2 border-line bg-surface text-text md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t-2 border-line bg-bg md:hidden">
          <ul className={`${WRAP} flex flex-col py-3`}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-display text-base text-text hover:text-accent"
                >
                  <span className="text-accent">&gt;</span> {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}

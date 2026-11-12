"use client";
import { Moon, Sun } from "lucide-react";
import { themeTransition } from "./themeTransition";

export const THEME_KEY = "theme";

/** Points the tab icon (favicon) at the given theme's SVG. Kept as a string so the boot script can share it. */
const SET_ICON = `function(t){document.querySelectorAll('link[rel~="icon"][href*="/icon-"]').forEach(function(l){l.removeAttribute("media");l.href="/icon-"+t+".svg"})}`;

/**
 * Runs inline in <head> before first paint: saved choice, else the system preference.
 * Prevents a flash of the wrong theme, and makes the tab icon follow the site theme
 * (the <link media> queries alone only follow the OS setting).
 */
export const themeBootScript = `try{window.__setIcon=${SET_ICON};var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;__setIcon(t);document.addEventListener("DOMContentLoaded",function(){__setIcon(document.documentElement.dataset.theme)})}catch(e){}`;

type IconWindow = Window & { __setIcon?: (t: string) => void };

/** Sun/moon switch. Icons swap via CSS (see globals.css), so there is no hydration mismatch. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
      (window as IconWindow).__setIcon?.(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply();
      return;
    }
    // The new theme grows out of the button as a circle until it fills the screen.
    const r = e.currentTarget.getBoundingClientRect();
    themeTransition(r.left + r.width / 2, r.top + r.height / 2, apply);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
      className={`grid size-11 place-items-center rounded-[var(--radius-md)] border border-line bg-surface text-text transition-colors hover:bg-surface-2 hover:text-accent ${className}`}
    >
      <Sun size={18} aria-hidden className="theme-icon-sun" />
      <Moon size={18} aria-hidden className="theme-icon-moon" />
    </button>
  );
}

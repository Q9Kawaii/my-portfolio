"use client";
import { Moon, Sun } from "lucide-react";

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
  const toggle = () => {
    const root = document.documentElement;
    const current =
      root.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    (window as IconWindow).__setIcon?.(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
      className={`grid size-10 place-items-center border-2 border-line bg-surface text-text shadow-hard-sm transition hover:-translate-x-px hover:-translate-y-px ${className}`}
    >
      <Sun size={18} aria-hidden className="theme-icon-sun" />
      <Moon size={18} aria-hidden className="theme-icon-moon" />
    </button>
  );
}

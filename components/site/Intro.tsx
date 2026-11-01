"use client";
import { useEffect, useRef } from "react";

export const INTRO_KEY = "intro-seen";

/**
 * Runs before first paint (inline in the HTML): opts in to the intro only on a
 * first visit this session with motion allowed. CSS keeps the overlay hidden
 * otherwise, so returning visitors and crawlers never see it and nothing flashes.
 */
export const introBootScript = `try{if(!sessionStorage.getItem("${INTRO_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="play"}}catch(e){}`;

/**
 * ~1 s retro boot: a terminal line types the name, then the overlay steps out.
 * The motion is pure CSS (globals.css) so it starts at first paint; this component
 * only handles Skip / Esc, the scroll lock and remembering that it played.
 */
export default function Intro({ name }: { name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});
  const line = name.toLowerCase().replace(/\s+/g, "_");

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if (root.dataset.intro !== "play" || !el) return;

    const prevOverflow = root.style.overflow;
    const finish = () => {
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      delete root.dataset.intro;
      root.style.overflow = prevOverflow;
    };
    skipRef.current = finish;

    // Slow hydration: the CSS timeline may already be over.
    const out = el.getAnimations().find((a) => (a as CSSAnimation).animationName === "intro-out");
    if (!out || out.playState === "finished") {
      finish();
      return;
    }

    root.style.overflow = "hidden";
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName === "intro-out") finish();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    el.addEventListener("animationend", onEnd);
    window.addEventListener("keydown", onKey);
    // No finish() here: StrictMode re-runs effects in dev and the intro should keep playing.
    return () => {
      el.removeEventListener("animationend", onEnd);
      window.removeEventListener("keydown", onKey);
      root.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div ref={ref} id="intro" className="intro-overlay">
      <p className="px-4 font-pixel text-4xl text-text sm:text-6xl" aria-label={name}>
        <span className="text-accent" aria-hidden>
          &gt;{" "}
        </span>
        <span aria-hidden className="intro-type" style={{ "--n": line.length } as React.CSSProperties}>
          {line}
        </span>
        <span aria-hidden className="intro-cursor text-accent">
          █
        </span>
      </p>
      <button
        type="button"
        onClick={() => skipRef.current()}
        className="btn btn-ghost btn-sm absolute right-4 top-4 sm:right-8 sm:top-6"
      >
        Skip
      </button>
    </div>
  );
}

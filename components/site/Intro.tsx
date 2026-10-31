"use client";
import { useEffect, useRef } from "react";

export const INTRO_KEY = "intro-seen";

/**
 * Runs before first paint (inline in the HTML): opts in to the intro only on a
 * first visit this session with motion allowed. CSS keeps the overlay hidden
 * otherwise, so returning visitors and crawlers never see it and nothing flashes.
 */
export const introBootScript = `try{if(!sessionStorage.getItem("${INTRO_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="play"}}catch(e){}`;

// Deterministic particle start points (no Math.random, so server and client markup match).
const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2 + (i % 3) * 0.35;
  const d = 38 + ((i * 37) % 22);
  // Rounded so server and client produce identical strings (float output can differ in the last digit).
  const round = (v: number) => Math.round(v * 100) / 100;
  return { x: round(Math.cos(a) * d), y: round(Math.sin(a) * d * 0.75), s: 2 + (i % 3), delay: round((i % 7) * 0.02) };
});
const RAYS = Array.from({ length: 10 }, (_, i) => (i / 10) * 360);
const MONOGRAM = "M30 36 L44 58 L58 36 M44 58 V84 M66 36 V84 H76 Q94 84 94 60 Q94 36 76 36 Z";

/**
 * ~2.5 s intro. The motion itself is pure CSS (see globals.css) so it starts at
 * first paint instead of waiting for hydration; this component only handles
 * Skip / Esc, the scroll lock and remembering that it played this session.
 */
export default function Intro({ name, role }: { name: string; role: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});

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
    const curtain = el.getAnimations().find((a) => (a as CSSAnimation).animationName === "intro-curtain");
    if (!curtain || curtain.playState === "finished") {
      finish();
      return;
    }

    root.style.overflow = "hidden";
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName === "intro-curtain") finish();
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

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} id="intro" className="intro-overlay">
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {RAYS.map((deg) => (
          <span key={deg} className="intro-ray" style={{ "--r": `${deg}deg` } as React.CSSProperties} />
        ))}
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="intro-particle"
            style={
              {
                "--x": `${p.x}vw`,
                "--y": `${p.y}vh`,
                "--d": `${p.delay}s`,
                width: p.s,
                height: p.s,
                backgroundColor: i % 2 ? "#7cf0c5" : "#9db2ff",
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="intro-content relative flex flex-col items-center px-4 text-center">
        <svg aria-hidden viewBox="0 0 120 120" className="size-32 sm:size-40">
          <path className="intro-ring" d="M60 6 a54 54 0 1 1 -0.01 0" fill="none" stroke="#9db2ff" strokeWidth="2" pathLength={1} />
          {initials === "YD" ? (
            <>
              <path
                className="intro-fill"
                d={MONOGRAM}
                fill="none"
                stroke="rgb(124 240 197 / 0.28)"
                strokeWidth="9"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                className="intro-stroke"
                d={MONOGRAM}
                fill="none"
                stroke="#7cf0c5"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={1}
              />
            </>
          ) : (
            <text x="60" y="74" textAnchor="middle" fontSize="40" fontWeight="700" fill="#7cf0c5" className="intro-fill">
              {initials}
            </text>
          )}
        </svg>
        <p className="intro-name mt-6 font-display text-3xl font-bold tracking-tight text-text sm:text-5xl">{name}</p>
        <p className="intro-role mt-2 font-mono text-sm text-accent sm:text-base">{role}</p>
      </div>

      <button
        type="button"
        onClick={() => skipRef.current()}
        className="absolute right-4 top-4 rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold text-text hover:border-accent sm:right-6 sm:top-6"
      >
        Skip intro
      </button>
    </div>
  );
}

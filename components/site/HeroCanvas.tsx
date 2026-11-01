"use client";
import dynamic from "next/dynamic";

// three.js stays out of the initial bundle; a flat ring shows while it loads.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center" aria-hidden>
      <div className="size-2/3 rounded-full border-2 border-dashed border-line" />
    </div>
  ),
});

export default function HeroCanvas() {
  return <HeroScene />;
}

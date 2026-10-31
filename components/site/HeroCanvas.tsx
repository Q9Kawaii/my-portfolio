"use client";
import dynamic from "next/dynamic";

// three.js stays out of the initial bundle; a static orb shows while it loads.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center" aria-hidden>
      <div className="size-48 rounded-full bg-[radial-gradient(circle_at_35%_30%,#7cf0c5,#1b4d5c_55%,transparent_70%)] opacity-70" />
    </div>
  ),
});

export default function HeroCanvas() {
  return <HeroScene />;
}

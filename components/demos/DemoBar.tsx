import Link from "next/link";
import { type Demo, demoPlan } from "@/lib/demos";
import WhatsAppButton from "@/components/site/WhatsAppButton";
import { inr } from "@/lib/services";

/**
 * Thin ink strip above every demo: says plainly that the business is fictional,
 * who built it, and how to get one. Uses the portfolio's own look so it never
 * blends into the demo's design.
 */
export default function DemoBar({ d }: { d: Demo }) {
  const plan = demoPlan(d);
  return (
    <>
    <WhatsAppButton message={`Hi Yash, I saw your ${d.kind.toLowerCase()} demo (${d.business}) and I'd like something similar for my business.`} />
    {/* Pinned on tablets and up; on phones it scrolls away so it doesn't eat the screen. */}
    <div className="relative z-[60] bg-[#141414] font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[#f4efe4] sm:sticky sm:top-0">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2 sm:px-6">
        <p className="flex flex-wrap items-center gap-x-2">
          <span className="border border-[#ffb000] px-1.5 py-px text-[#ffb000]">Concept demo</span>
          <span className="opacity-80">
            Fictional business<span className="hidden md:inline"> · sample data · built by Yash Dingar</span>
          </span>
        </p>
        <p className="flex items-center gap-3">
          <Link href="/demos" className="underline-offset-4 hover:underline">
            All demos
          </Link>
          <Link href="/services#pricing" className="text-[#ffb000] underline-offset-4 hover:underline">
            Get one from {inr(plan.price)} →
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}

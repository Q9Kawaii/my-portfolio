import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import CoachingDemo from "@/components/demos/CoachingDemo";
import DemoBar from "@/components/demos/DemoBar";
import { demo } from "@/lib/demos";

const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const d = demo("coaching");

export const metadata: Metadata = {
  title: `${d.kind} demo`,
  description: `Concept demo: ${d.summary}`,
  alternates: { canonical: `/demos/${d.slug}` },
};

export default function CoachingDemoPage() {
  return (
    <>
      <DemoBar d={d} />
      <CoachingDemo font={grotesk.className} />
    </>
  );
}

import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import CafeDemo from "@/components/demos/CafeDemo";
import DemoBar from "@/components/demos/DemoBar";
import { demo } from "@/lib/demos";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"], display: "swap" });
const d = demo("cafe");

export const metadata: Metadata = {
  title: `${d.kind} demo`,
  description: `Concept demo: ${d.summary}`,
  alternates: { canonical: `/demos/${d.slug}` },
};

export default function CafeDemoPage() {
  return (
    <>
      <DemoBar d={d} />
      <CafeDemo serif={fraunces.className} />
    </>
  );
}

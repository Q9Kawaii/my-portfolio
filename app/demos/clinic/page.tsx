import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import ClinicDemo from "@/components/demos/ClinicDemo";
import DemoBar from "@/components/demos/DemoBar";
import { demo } from "@/lib/demos";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const d = demo("clinic");

export const metadata: Metadata = {
  title: `${d.kind} demo`,
  description: `Concept demo: ${d.summary}`,
  alternates: { canonical: `/demos/${d.slug}` },
};

export default function ClinicDemoPage() {
  return (
    <>
      <DemoBar d={d} />
      <ClinicDemo font={jakarta.className} />
    </>
  );
}

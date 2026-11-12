import type { Metadata } from "next";
import { Inter } from "next/font/google";
import DashboardDemo from "@/components/demos/DashboardDemo";
import DemoBar from "@/components/demos/DemoBar";
import { demo } from "@/lib/demos";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const d = demo("dashboard");

export const metadata: Metadata = {
  title: `${d.kind} demo`,
  description: `Concept demo: ${d.summary}`,
  alternates: { canonical: `/demos/${d.slug}` },
};

export default function DashboardDemoPage() {
  return (
    <>
      <DemoBar d={d} />
      <DashboardDemo font={inter.className} />
    </>
  );
}

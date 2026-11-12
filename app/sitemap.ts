import type { MetadataRoute } from "next";
import { DEMOS } from "@/lib/demos";
import { LAB_EXHIBITS } from "@/lib/lab/exhibits";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.yashdingar.in";
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/lab`, changeFrequency: "monthly", priority: 0.7 },
    ...LAB_EXHIBITS.map((e) => ({ url: `${base}/lab/${e.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/demos`, changeFrequency: "monthly", priority: 0.5 },
    ...DEMOS.map((d) => ({ url: `${base}/demos/${d.slug}`, changeFrequency: "monthly" as const, priority: 0.4 })),
    ...["terms", "privacy", "refund", "delivery", "contact"].map((p) => ({
      url: `${base}/services/${p}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}

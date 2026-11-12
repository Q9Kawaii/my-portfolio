import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.yashdingar.space";
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/services`, changeFrequency: "monthly", priority: 0.6 },
    ...["terms", "privacy", "refund", "delivery", "contact"].map((p) => ({
      url: `${base}/services/${p}`,
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}

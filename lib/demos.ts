import { PLANS } from "./services";

export type Demo = {
  slug: string;
  business: string;
  kind: string;
  summary: string;
  features: string[];
  planId: (typeof PLANS)[number]["id"];
  /** Thumbnail colours on the gallery card: background, ink, accent. */
  swatch: [string, string, string];
};

export const DEMOS: Demo[] = [
  {
    slug: "cafe",
    business: "Kettle & Crumb",
    kind: "Café website",
    summary: "A warm, editorial site for a neighbourhood café: menu with filters, opening hours, location and table booking.",
    features: ["Menu with veg/vegan filters", "Table booking form", "Open-now hours", "Mobile-first"],
    planId: "website",
    swatch: ["#f3e9dc", "#2b1d14", "#c2410c"],
  },
  {
    slug: "clinic",
    business: "Northside Dental Studio",
    kind: "Appointment booking app",
    summary: "Patients pick a treatment, a day and a free slot; the owner sees every booking in a simple dashboard.",
    features: ["Live slot availability", "Booking confirmation", "Owner dashboard", "Cancel & reschedule"],
    planId: "webapp",
    swatch: ["#eef6f8", "#0b2a3a", "#0e9f9a"],
  },
  {
    slug: "coaching",
    business: "Summit Coaching Centre",
    kind: "Coaching institute site",
    summary: "Courses, batch timings and a clear fee table, with an enquiry form that tells parents what happens next.",
    features: ["Course & batch finder", "Fee table with EMI", "Enquiry form", "FAQ"],
    planId: "website",
    swatch: ["#0f1530", "#ffffff", "#facc15"],
  },
  {
    slug: "dashboard",
    business: "Sharma Traders",
    kind: "Stock & invoice dashboard",
    summary: "A small-business back office: sales at a glance, low-stock alerts, searchable inventory and CSV export.",
    features: ["Sales chart", "Low-stock alerts", "Search & filter", "Export to CSV"],
    planId: "software",
    swatch: ["#f6f7f9", "#111827", "#4f46e5"],
  },
];

export const demo = (slug: string) => DEMOS.find((d) => d.slug === slug)!;
export const demoPlan = (d: Demo) => PLANS.find((p) => p.id === d.planId)!;

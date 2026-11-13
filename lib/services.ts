// Freelance services shown on /services. Each plan's pay link is a fixed-amount Razorpay
// Payment Page that redirects to /services/thank-you after a successful payment.

export const SERVICES_CONTACT = {
  name: "Yash Dingar",
  email: "yashdingar17@gmail.com",
  location: "India",
  updated: "12 November 2026",
  /** WhatsApp number in international format, digits only (used for wa.me links). */
  whatsapp: "917007651602",
};

/** wa.me link that opens a chat with a pre-filled message. */
export const whatsappLink = (message: string) =>
  `https://wa.me/${SERVICES_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;

export type Plan = {
  id: string;
  name: string;
  blurb: string;
  price: number;
  unit?: string;
  features: string[];
  /** Razorpay Payment Page for exactly `price`. Empty hides the pay button. */
  payUrl: string;
  featured?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "fix",
    name: "Fixes & maintenance",
    blurb: "Bug fixes, updates and small changes to an existing site or app.",
    price: 499,
    unit: "/ task",
    features: ["Bug fixes & small edits", "Content updates", "Delivered in 1–3 days"],
    payUrl: "https://rzp.io/rzp/yashdingar-fix",
  },
  {
    id: "website",
    name: "Website",
    blurb: "Business, portfolio or landing website.",
    price: 4999,
    features: ["Up to 5 pages", "Mobile-friendly design", "Contact form & hosting setup", "Delivered in 7–10 days"],
    payUrl: "https://rzp.io/rzp/yashdingar-website",
    featured: true,
  },
  {
    id: "software",
    name: "Custom software",
    blurb: "Automation scripts and custom tools.",
    price: 7999,
    features: ["Data processing & automation", "Integrations with your tools", "Delivered in 1–2 weeks"],
    payUrl: "https://rzp.io/rzp/yashdingar-software",
  },
  {
    id: "webapp",
    name: "Web application",
    blurb: "Dashboards, portals and booking tools.",
    price: 14999,
    features: ["User login & database", "Admin dashboard", "Delivered in 2–4 weeks"],
    payUrl: "https://rzp.io/rzp/yashdingar-webapp",
  },
];

export const SERVICE_AREAS = [
  { title: "Websites", description: "Fast, responsive sites for businesses, portfolios and personal brands." },
  { title: "Web applications", description: "Dashboards, portals and booking tools with logins, databases and admin panels." },
  { title: "Custom software", description: "Scripts and tools that automate repetitive work and connect your systems." },
  { title: "Fixes & maintenance", description: "Bug fixes, speed improvements and small changes to an existing site or app." },
  { title: "Security check-up", description: "A review of a site or app you already have: find the security holes and get a clear plan to fix them." },
];

/** The security check-up service: what's checked, and what you get. Quoted per project. */
export const SECURITY_AUDIT = {
  checks: [
    "Security headers, HTTPS and cookie settings",
    "Login, sessions and password handling",
    "Access control: can users see or change data that isn't theirs?",
    "Injection and XSS in forms, search boxes and URLs",
    "Database and Firebase / Supabase security rules",
    "Exposed secrets, admin pages and outdated dependencies",
  ],
  deliverables: [
    "A plain-language report ranked by risk",
    "Step-by-step fixes, or I fix them for you",
    "A free re-check after the fixes",
  ],
};

export const PROCESS = [
  { title: "Discuss", description: "Tell me what you need over email. I'll ask the right questions." },
  { title: "Quote", description: "You get a fixed price, scope and timeline in writing." },
  { title: "Pay", description: "Pay the agreed amount securely through Razorpay (UPI, cards, netbanking)." },
  { title: "Deliver", description: "I build it, share progress, and deliver files or a live link." },
];

export const POLICY_LINKS = [
  { href: "/services/terms", label: "Terms" },
  { href: "/services/privacy", label: "Privacy" },
  { href: "/services/refund", label: "Refunds" },
  { href: "/services/delivery", label: "Delivery" },
  { href: "/services/contact", label: "Contact" },
];

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

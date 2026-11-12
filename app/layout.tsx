import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { themeBootScript } from "@/components/ThemeToggle";
import "./globals.css";

// Type system ("case file"): two families, so phones download little.
// - Archivo, one variable file with a width axis: condensed heavy caps for headlines, normal width for body.
// - IBM Plex Mono: file labels, metadata and stamps (typewriter-adjacent, but crisp at small sizes).
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const SITE_URL = "https://www.yashdingar.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Yash Dingar | Full-Stack & Security Engineer",
    template: "%s | Yash Dingar",
  },
  description:
    "Portfolio of Yash Dingar, a full-stack and security engineer building secure, scalable web platforms with Next.js, Angular and Firebase.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Yash Dingar | Full-Stack & Security Engineer",
    description: "Secure, scalable web platforms: projects, experience and awards.",
    images: [{ url: "/images/projects/taskmesh.webp", width: 1200, height: 750 }],
  },
  twitter: { card: "summary_large_image", creator: "@q9kawaii" },
  // Google Search Console ownership of https://www.yashdingar.in/ (HTML tag method). Keep it so the property stays verified.
  verification: { google: "tx9B6UPcAiYJGrzPgtXHyEUmE-msELfRHEUVaJLeRZY" },
  // Pixel "YD" tab icon in each theme's colours; ThemeToggle keeps it in sync with the site toggle.
  // The plain PNG (and app/favicon.ico) are for Google Search and other crawlers, which
  // need an unconditional icon that's a multiple of 48px.
  icons: {
    icon: [
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-light.svg", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark.svg", type: "image/svg+xml", media: "(prefers-color-scheme: dark)" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe4" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1b1d" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable}`}
      // The theme and intro boot scripts set data-* attributes before hydration.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-dvh overflow-x-hidden bg-bg text-text">{children}</body>
    </html>
  );
}

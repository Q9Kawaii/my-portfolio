import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { themeBootScript } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains", display: "swap" });

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
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e17" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable}`}
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

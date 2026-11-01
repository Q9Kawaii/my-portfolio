import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Space_Mono, VT323 } from "next/font/google";
import { themeBootScript } from "@/components/ThemeToggle";
import "./globals.css";

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-space-mono", display: "swap" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt323", display: "swap" });

const SITE_URL = "https://www.yashdingar.space";

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
  // Pixel "YD" tab icon in each theme's colours; ThemeToggle keeps it in sync with the site toggle.
  icons: {
    icon: [
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
      className={`${plex.variable} ${spaceMono.variable} ${vt323.variable}`}
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

import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

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
};

export const viewport: Viewport = {
  themeColor: "#07080c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}
      // The intro boot script sets data-intro before hydration.
      suppressHydrationWarning
    >
      <body className="min-h-dvh overflow-x-hidden bg-bg text-text">{children}</body>
    </html>
  );
}

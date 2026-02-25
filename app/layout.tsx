import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import styles from "./container.module.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const websiteUrl = "https://seo-generator.vercel.app";
const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SEO Generator",
  applicationCategory: "DeveloperApplication",
  url: websiteUrl,
  author: {
    "@type": "Person",
    name: "mrluisfer",
  },
  description:
    "Generate SEO metadata, JSON-LD and LLM-friendly content blocks with live previews for multiple social/search platforms.",
};

export const metadata: Metadata = {
  title: "SEO Generator - Create SEO metadata for your web pages",
  description:
    "With SEO Generator you can edit and experiment with your content then preview how your webpage will look on Google, Facebook, X and more!",
  keywords: [
    "SEO",
    "SEO generator",
    "metadata",
    "meta tags",
    "Google preview",
    "Open Graph",
    "Twitter cards",
    "website optimization",
  ],
  authors: [{ name: "mrluisfer", url: websiteUrl }],
  creator: "mrluisfer",
  publisher: "mrluisfer",
  metadataBase: new URL(websiteUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SEO Generator - Create SEO metadata for your web pages",
    description: "Generate and preview SEO metadata for Google, Facebook, X and more in one place.",
    url: websiteUrl,
    siteName: "SEO Generator",
    images: [
      {
        url: `${websiteUrl}/seo-preview-structure.png`,
        width: 1600,
        height: 825,
        alt: "SEO Generator Open Graph Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Generator - Create SEO metadata for your web pages",
    description: "Preview how your site looks on Google, Facebook, and X with SEO Generator.",
    creator: "@mrluisfer",
    images: [`${websiteUrl}/seo-preview-structure.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(geistSans.variable, geistMono.variable, "antialiased", styles.container)}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }} />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";

import "./globals.css";
import { JsonLd } from "@/components/JsonLd";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://angkor-typing.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Typing Quest — Master Khmer & English Touch Typing | ដំណើរផ្សងព្រេងវាយអក្សរ",
    template: "%s | Typing Quest",
  },
  description:
    "A Mario-style typing tutor for Khmer and English: consonants, coeng sub-consonants (ជើងអក្សរ), vowel signs and English speed drills, with a live virtual NiDA keyboard and finger guide. 100% free and offline PWA.",
  applicationName: "Typing Quest",
  keywords: [
    "Khmer typing",
    "Khmer typing tutor",
    "learn Khmer typing",
    "Khmer Unicode keyboard",
    "NiDA keyboard",
    "Khmer keyboard layout",
    "touch typing",
    "coeng typing",
    "ជើងអក្សរ",
    "រៀនវាយអក្សរខ្មែរ",
    "វាយអក្សរខ្មែរ",
    "ក្ដារចុចខ្មែរ",
    "របៀបវាយអក្សរខ្មែរ",
    "តារាងក្ដារចុចយូនីកូដ",
    "ល្បែងវាយអក្សរ",
    "English typing speed test",
    "bilingual typing tutor",
    "Mario typing game",
    "Khmer typing PWA",
  ],
  authors: [{ name: "Typing Quest Team" }],
  creator: "Typing Quest",
  publisher: "Typing Quest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/?lang=en",
      "km-KH": "/?lang=kh",
      "x-default": "/",
    },
  },
  openGraph: {
    title:
      "Typing Quest — Master Khmer & English Touch Typing | ដំណើរផ្សងព្រេងវាយអក្សរ",
    description:
      "Learn Khmer Unicode (NiDA layout) and English touch typing with this retro Mario-style arcade adventure. 33 consonants, subscript coeng, vowels, and speed drills. Works 100% offline.",
    url: "/",
    siteName: "Typing Quest",
    locale: "en_US",
    alternateLocale: ["km_KH"],
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Typing Quest — Khmer & English Typing Adventure Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Typing Quest — Master Khmer & English Touch Typing",
    description:
      "Playful retro typing tutor for Khmer and English with live keyboard, hand guide, and 100% offline PWA support.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Typing Quest",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#cfeeff" },
    { media: "(prefers-color-scheme: dark)", color: "#131a3a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Applies the persisted theme and language to <html> BEFORE React hydrates.
 *
 * Without this the first painted frame uses the default theme, producing the
 * familiar white flash for dark-mode users. It is deliberately tiny, dependency
 * free and wrapped in try/catch — storage access throws outright in Safari
 * private mode. Falls back to the OS colour-scheme preference.
 */
const BOOTSTRAP_SCRIPT = `(function(){try{
var d=document.documentElement;
var t=localStorage.getItem("tq:theme");
if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}
d.classList.toggle("dark",t==="dark");
d.style.colorScheme=t;
var l=localStorage.getItem("tq:lang");
if(l==="kh"||l==="en"){d.dataset.lang=l;d.lang=l==="kh"?"km":"en";}
}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `suppressHydrationWarning`: the bootstrap script mutates class/lang on this
    // element before hydration, which React would otherwise flag.
    <html lang="en" data-lang="en" suppressHydrationWarning>
      <head>
        {/* Schema.org Structured Data */}
        <JsonLd />

        {/* Fonts are linked at runtime rather than imported through next/font so
            the production build never depends on network access. Both stacks
            degrade to system fonts if the request fails. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font --
            The rule targets the Pages Router (`pages/_document.js`). In the App
            Router this root layout wraps every route, so the stylesheet is not
            per-page. Deliberately not `next/font`, which would make the
            production build depend on network access at compile time. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Noto+Sans+Khmer:wght@400..700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

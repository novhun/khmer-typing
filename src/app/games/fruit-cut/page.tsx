import type { Metadata } from "next";
import { FruitCutGame } from "@/components/fruit-cut";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://angkor-typing.vercel.app";

export const metadata: Metadata = {
  title: "Khmer Word Slicer — Arcade Typing Game | ល្បែងកាត់ផ្លែឈើវាយអក្សរ",
  description:
    "Slash airborne fruit targets by typing Khmer Unicode words and English vocabulary in high-speed arcade action. Features gravity physics, juice splatters, and 3 difficulty tiers. 100% free and offline.",
  keywords: [
    "Khmer typing game",
    "Khmer word slicer",
    "fruit ninja typing",
    "វាយអក្សរខ្មែរ",
    "ល្បែងកាត់ផ្លែឈើ",
    "រៀនវាយអក្សរខ្មែរ",
    "Khmer Unicode game",
    "Khmer typing test",
    "តេស្តល្បឿនវាយអក្សរ",
    "កាត់ផ្លែឈើ",
    "Khmer typing tutor",
  ],
  alternates: {
    canonical: `${SITE_URL}/games/fruit-cut`,
    languages: {
      "en-US": `${SITE_URL}/games/fruit-cut?lang=en`,
      "km-KH": `${SITE_URL}/games/fruit-cut?lang=km`,
    },
  },
  openGraph: {
    title: "Khmer Word Slicer — Arcade Typing Game | ល្បែងកាត់ផ្លែឈើវាយអក្សរ",
    description:
      "Slice flying fruits by typing Khmer words and English letters before they hit the ground! Combo streaks, juice splatters, and 3 difficulty tiers.",
    url: `${SITE_URL}/games/fruit-cut`,
    siteName: "Typing Quest",
    locale: "en_US",
    alternateLocale: ["km_KH"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Khmer Word Slicer — Arcade Typing Game",
    description: "Slash flying fruit targets with fast-paced Khmer & English touch typing!",
  },
};

export default function FruitCutPage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-950 font-khmer">
      {/* Main Game Arena */}
      <FruitCutGame />
    </main>
  );
}

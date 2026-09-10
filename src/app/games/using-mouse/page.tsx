import type { Metadata } from "next";
import { MouseGame } from "@/components/mouse-game";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.khmertyping.asia";

export const metadata: Metadata = {
  title: "Mouse Skills & Blade Slicer | ហ្វឹកហាត់ប្រើ Mouse កាត់ផ្លែឈើ",
  description:
    "Master your mouse speed, precision, and reflexes with bilingual Khmer & English slicing action. Left-drag continuous slicing, right-click 360° EMP shockwaves, and scroll-wheel blade adjustments.",
  keywords: [
    "Mouse practice",
    "using mouse",
    "Khmer mouse training",
    "ហ្វឹកហាត់ Mouse",
    "ល្បែងកាត់ផ្លែឈើ Mouse",
    "កាត់ផ្លែឈើខ្មែរ",
    "រៀនប្រើ Mouse",
    "mouse accuracy trainer",
    "mouse aim trainer",
  ],
  alternates: {
    canonical: `${SITE_URL}/games/using-mouse`,
    languages: {
      "en-US": `${SITE_URL}/games/using-mouse?lang=en`,
      "km-KH": `${SITE_URL}/games/using-mouse?lang=km`,
    },
  },
  openGraph: {
    title: "Mouse Skills & Blade Slicer | ហ្វឹកហាត់ប្រើ Mouse កាត់ផ្លែឈើ",
    description:
      "Slice airborne fruits with mouse trails, trigger 360° shockwaves, and resize your blade using the scroll wheel. Bilingual Khmer & English support.",
    url: `${SITE_URL}/games/using-mouse`,
    siteName: "Typing Quest",
    locale: "en_US",
    alternateLocale: ["km_KH"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mouse Skills & Blade Slicer — Arcade Mouse Trainer",
    description: "Sharpen mouse reflexes and precision with slicing trails and EMP shockwaves!",
  },
};

export default function UsingMousePage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-950 font-khmer">
      <MouseGame />
    </main>
  );
}

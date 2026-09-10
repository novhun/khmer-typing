import type { Metadata } from "next";
import { ZombieGame } from "@/components/zombie-defense";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.khmertyping.asia";

export const metadata: Metadata = {
  title: "Zombie Typing Defense — Arcade Defense Game | ល្បែងការពារបន្ទាយពីខ្មោចឆៅ",
  description:
    "Defend your bunker from waves of invading zombies by typing Khmer Unicode words and English vocabulary in intense arcade defense action! Multi-lane defense, plasma turrets, and escalating horde waves.",
  keywords: [
    "Zombie typing defense",
    "Khmer zombie typing",
    "វាយអក្សរខ្មោចឆៅ",
    "ល្បែងការពារបន្ទាយ",
    "រៀនវាយអក្សរខ្មែរ",
    "Khmer Unicode defense game",
    "Khmer typing tutor",
    "ការពារបន្ទាយ",
    "ហ្គេមវាយអក្សរ",
    "Khmer typing practice",
  ],
  alternates: {
    canonical: `${SITE_URL}/games/zombie`,
    languages: {
      "en-US": `${SITE_URL}/games/zombie?lang=en`,
      "km-KH": `${SITE_URL}/games/zombie?lang=km`,
    },
  },
  openGraph: {
    title: "Zombie Typing Defense — Arcade Defense Game | ល្បែងការពារបន្ទាយពីខ្មោចឆៅ",
    description:
      "Type words above incoming zombies to lock on and obliterate them with plasma laser turrets. 4-lane defense, shields, and multi-tier horde modes.",
    url: `${SITE_URL}/games/zombie`,
    siteName: "Typing Quest",
    locale: "en_US",
    alternateLocale: ["km_KH"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zombie Typing Defense — Arcade Defense Game",
    description: "Defend your base from advancing undead hordes using rapid Khmer touch typing!",
  },
};

export default function ZombieDefensePage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-950 font-khmer">
      <ZombieGame />
    </main>
  );
}

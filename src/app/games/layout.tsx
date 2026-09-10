import type { Metadata } from "next";
import { AppProviders } from "@/context/AppProviders";

export const metadata: Metadata = {
  title: "Khmer Arcade Games | ល្បែងកម្សាន្តខ្មែរ",
  description:
    "Play thrilling arcade typing and mouse games in Khmer and English with retro Typing Quest UI styling!",
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders defaultLang="kh" defaultTheme="dark">
      <div className="min-h-screen bg-slate-950 text-white font-khmer selection:bg-emerald-500 selection:text-white">
        {children}
      </div>
    </AppProviders>
  );
}

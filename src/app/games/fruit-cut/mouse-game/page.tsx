import type { Metadata } from "next";
import { MouseGame } from "@/components/mouse-game";

export const metadata: Metadata = {
  title: "Mouse Blade Master — Slicer Arcade | កំពូលដាវកាត់ផ្លែឈើដោយ Mouse",
  description:
    "Master mouse controls in this thrilling bilingual arcade slicer! Slice fruits with left-drag trails, unleash 360° shockwaves with right-click, and adjust blade reach with the scroll wheel.",
  keywords: [
    "Mouse game",
    "Khmer mouse game",
    "fruit slicer mouse",
    "blade master",
    "ល្បែង Mouse",
    "កាត់ផ្លែឈើ",
    "ហ្គេម Mouse ខ្មែរ",
    "touch typing and mouse skills",
  ],
};

export default function MouseGamePage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-950 font-khmer">
      <MouseGame />
    </main>
  );
}

import type { Metadata } from "next";
import { ZombieGame } from "@/components/zombie-defense";

export const metadata: Metadata = {
  title: "Zombie Typing Defense — Arcade Defense Game | ល្បែងការពារបន្ទាយពីខ្មោចឆៅ",
  description:
    "Defend your bunker from waves of invading zombies by typing Khmer Unicode words and English vocabulary in intense arcade defense action!",
};

export default function GamesFruitCutZombiePage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-950 font-khmer">
      <ZombieGame />
    </main>
  );
}

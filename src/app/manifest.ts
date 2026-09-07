import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Typing Quest — Khmer & English Typing Adventure",
    short_name: "Typing Quest",
    description:
      "A Mario-style typing tutor for Khmer and English: consonants, coeng sub-consonants, vowel signs and English speed drills, with a live virtual keyboard and finger guide.",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#131a3a",
    orientation: "any",
    scope: "/",
    id: "/?source=pwa",
    categories: ["education", "games", "productivity"],
    lang: "en",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Khmer Home Row",
        short_name: "Khmer Home",
        description: "Practice Khmer home row keys: ា ស ដ ថ ង ហ ក ល",
        url: "/?mission=kh-home-row",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "33 Consonants",
        short_name: "Consonants",
        description: "Master all 33 Khmer Unicode consonants",
        url: "/?mission=kh-consonants",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "English Speed Drill",
        short_name: "English Drill",
        description: "Practice English touch typing speed drill",
        url: "/?mission=en-home-row",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}

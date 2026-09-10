import type { MetadataRoute } from "next";
import { MISSIONS } from "@/lib/missions";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.khmertyping.asia";
  const now = new Date();

  // 1. Core Primary Pages (with ISO-compliant alternates, zero & entities)
  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}/?lang=en`,
          km: `${baseUrl}/?lang=km`,
          "x-default": baseUrl,
        },
      },
    },
    {
      url: `${baseUrl}/games/fruit-cut`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/games/fruit-cut?lang=en`,
          km: `${baseUrl}/games/fruit-cut?lang=km`,
          "x-default": `${baseUrl}/games/fruit-cut`,
        },
      },
    },
    {
      url: `${baseUrl}/games/zombie`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/games/zombie?lang=en`,
          km: `${baseUrl}/games/zombie?lang=km`,
          "x-default": `${baseUrl}/games/zombie`,
        },
      },
    },
    {
      url: `${baseUrl}/games/using-mouse`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/games/using-mouse?lang=en`,
          km: `${baseUrl}/games/using-mouse?lang=km`,
          "x-default": `${baseUrl}/games/using-mouse`,
        },
      },
    },
  ];

  // 2. Main Hub Views & Dedicated Modules
  const viewRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/?view=quest`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/?view=guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/?view=custom`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  // 3. Game Difficulty & Play Modes
  const modeRoutes: MetadataRoute.Sitemap = [
    // Fruit Cut Modes
    {
      url: `${baseUrl}/games/fruit-cut?mode=casual`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/fruit-cut?mode=arcade`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/games/fruit-cut?mode=master`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // Zombie Defense Modes
    {
      url: `${baseUrl}/games/zombie?mode=easy`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/zombie?mode=survivor`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/games/zombie?mode=nightmare`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // Using Mouse Modes
    {
      url: `${baseUrl}/games/using-mouse?mode=practice`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/using-mouse?mode=arcade`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/games/using-mouse?mode=blitz`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // 4. All 18 Progressive Mission Drills
  const missionRoutes: MetadataRoute.Sitemap = MISSIONS.map((m, index) => ({
    url: `${baseUrl}/?mission=${m.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: Number((0.85 - index * 0.005).toFixed(2)),
  }));

  // 5. Standalone Direct Language Landings
  const languageRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/?lang=en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/?lang=km`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/games/fruit-cut?lang=en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/fruit-cut?lang=km`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/zombie?lang=en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/zombie?lang=km`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/using-mouse?lang=en`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/games/using-mouse?lang=km`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  return [
    ...coreRoutes,
    ...viewRoutes,
    ...modeRoutes,
    ...missionRoutes,
    ...languageRoutes,
  ];
}

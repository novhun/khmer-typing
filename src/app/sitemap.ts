import type { MetadataRoute } from "next";
import { MISSIONS } from "@/lib/missions";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.khmertyping.asia";
  const now = new Date();

  // 1. Core Pages & Hub Views
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
      url: `${baseUrl}/?view=quest`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
      alternates: {
        languages: {
          en: `${baseUrl}/?view=quest&lang=en`,
          km: `${baseUrl}/?view=quest&lang=km`,
          "x-default": `${baseUrl}/?view=quest`,
        },
      },
    },
    {
      url: `${baseUrl}/?view=guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: {
        languages: {
          en: `${baseUrl}/?view=guide&lang=en`,
          km: `${baseUrl}/?view=guide&lang=km`,
          "x-default": `${baseUrl}/?view=guide`,
        },
      },
    },
    {
      url: `${baseUrl}/?view=custom`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: {
        languages: {
          en: `${baseUrl}/?view=custom&lang=en`,
          km: `${baseUrl}/?view=custom&lang=km`,
          "x-default": `${baseUrl}/?view=custom`,
        },
      },
    },
  ];

  // 2. Main Arcade Games & Modes
  const gameRoutes: MetadataRoute.Sitemap = [
    // Fruit Cut
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

    // Zombie Defense
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

    // Using Mouse
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

  // 3. All 18 Progressive Missions & Drill Modules
  const missionRoutes: MetadataRoute.Sitemap = MISSIONS.map((m, index) => ({
    url: `${baseUrl}/?mission=${m.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: Number((0.85 - index * 0.005).toFixed(2)),
    alternates: {
      languages: {
        en: `${baseUrl}/?mission=${m.id}&lang=en`,
        km: `${baseUrl}/?mission=${m.id}&lang=km`,
        "x-default": `${baseUrl}/?mission=${m.id}`,
      },
    },
  }));

  // 4. Standalone Language Landings for Direct Crawler Indexing
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
    ...gameRoutes,
    ...missionRoutes,
    ...languageRoutes,
  ];
}

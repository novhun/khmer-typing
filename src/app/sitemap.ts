import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://angkor-typing.vercel.app";
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}/?lang=en`,
          km: `${baseUrl}/?lang=kh`,
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
}

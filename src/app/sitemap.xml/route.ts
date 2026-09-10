import { MISSIONS } from "@/lib/missions";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.khmertyping.asia";
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  const urls = [
    // 1. Core Primary Pages
    { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0" },
    { loc: `${baseUrl}/games/fruit-cut`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseUrl}/games/zombie`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseUrl}/games/using-mouse`, changefreq: "daily", priority: "0.9" },

    // 2. Hub Views & Tool Modals
    { loc: `${baseUrl}/?view=quest`, changefreq: "daily", priority: "0.9" },
    { loc: `${baseUrl}/?view=guide`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/?view=custom`, changefreq: "weekly", priority: "0.8" },

    // 3. Arcade Game Modes
    { loc: `${baseUrl}/games/fruit-cut?mode=casual`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/fruit-cut?mode=arcade`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/fruit-cut?mode=master`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/zombie?mode=easy`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/zombie?mode=survivor`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/zombie?mode=nightmare`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/using-mouse?mode=practice`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/using-mouse?mode=arcade`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/using-mouse?mode=blitz`, changefreq: "weekly", priority: "0.8" },

    // 4. All 18 Progressive Missions / Lessons
    ...MISSIONS.map((m, idx) => ({
      loc: `${baseUrl}/?mission=${m.id}`,
      changefreq: "weekly",
      priority: (0.85 - idx * 0.005).toFixed(2),
    })),

    // 5. Standalone Language Landings
    { loc: `${baseUrl}/?lang=en`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/?lang=km`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/fruit-cut?lang=en`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/fruit-cut?lang=km`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/zombie?lang=en`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/zombie?lang=km`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/using-mouse?lang=en`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/using-mouse?lang=km`, changefreq: "daily", priority: "0.8" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `<url>
<loc>${u.loc}</loc>
<lastmod>${today}</lastmod>
<changefreq>${u.changefreq}</changefreq>
<priority>${u.priority}</priority>
</url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

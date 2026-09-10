import { MISSIONS } from "@/lib/missions";

export const dynamic = "force-static";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.khmertyping.asia";
  const now = new Date().toISOString();

  type Alternate = { lang: string; href: string };
  type SitemapItem = {
    loc: string;
    changefreq: string;
    priority: string;
    alternates?: Alternate[];
  };

  const urls: SitemapItem[] = [
    // 1. Core Primary Pages (with alternates)
    {
      loc: baseUrl,
      changefreq: "daily",
      priority: "1.0",
      alternates: [
        { lang: "en", href: `${baseUrl}/?lang=en` },
        { lang: "km", href: `${baseUrl}/?lang=km` },
        { lang: "x-default", href: baseUrl },
      ],
    },
    {
      loc: `${baseUrl}/games/fruit-cut`,
      changefreq: "daily",
      priority: "0.9",
      alternates: [
        { lang: "en", href: `${baseUrl}/games/fruit-cut?lang=en` },
        { lang: "km", href: `${baseUrl}/games/fruit-cut?lang=km` },
        { lang: "x-default", href: `${baseUrl}/games/fruit-cut` },
      ],
    },
    {
      loc: `${baseUrl}/games/zombie`,
      changefreq: "daily",
      priority: "0.9",
      alternates: [
        { lang: "en", href: `${baseUrl}/games/zombie?lang=en` },
        { lang: "km", href: `${baseUrl}/games/zombie?lang=km` },
        { lang: "x-default", href: `${baseUrl}/games/zombie` },
      ],
    },
    {
      loc: `${baseUrl}/games/using-mouse`,
      changefreq: "daily",
      priority: "0.9",
      alternates: [
        { lang: "en", href: `${baseUrl}/games/using-mouse?lang=en` },
        { lang: "km", href: `${baseUrl}/games/using-mouse?lang=km` },
        { lang: "x-default", href: `${baseUrl}/games/using-mouse` },
      ],
    },

    // 2. Hub Views & Tool Modals
    { loc: `${baseUrl}/?view=quest`, changefreq: "daily", priority: "0.95" },
    { loc: `${baseUrl}/?view=guide`, changefreq: "weekly", priority: "0.85" },
    { loc: `${baseUrl}/?view=custom`, changefreq: "weekly", priority: "0.85" },

    // 3. Arcade Game Modes
    { loc: `${baseUrl}/games/fruit-cut?mode=casual`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/fruit-cut?mode=arcade`, changefreq: "weekly", priority: "0.85" },
    { loc: `${baseUrl}/games/fruit-cut?mode=master`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/zombie?mode=easy`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/zombie?mode=survivor`, changefreq: "weekly", priority: "0.85" },
    { loc: `${baseUrl}/games/zombie?mode=nightmare`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/using-mouse?mode=practice`, changefreq: "weekly", priority: "0.8" },
    { loc: `${baseUrl}/games/using-mouse?mode=arcade`, changefreq: "weekly", priority: "0.85" },
    { loc: `${baseUrl}/games/using-mouse?mode=blitz`, changefreq: "weekly", priority: "0.8" },

    // 4. All 18 Progressive Missions / Lessons
    ...MISSIONS.map((m, index) => ({
      loc: `${baseUrl}/?mission=${m.id}`,
      changefreq: "weekly",
      priority: (0.85 - index * 0.005).toFixed(2),
    })),

    // 5. Standalone Language Landings
    { loc: `${baseUrl}/?lang=en`, changefreq: "daily", priority: "0.85" },
    { loc: `${baseUrl}/?lang=km`, changefreq: "daily", priority: "0.85" },
    { loc: `${baseUrl}/games/fruit-cut?lang=en`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/fruit-cut?lang=km`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/zombie?lang=en`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/zombie?lang=km`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/using-mouse?lang=en`, changefreq: "daily", priority: "0.8" },
    { loc: `${baseUrl}/games/using-mouse?lang=km`, changefreq: "daily", priority: "0.8" },
  ];

  const xmlEntries = urls
    .map((item) => {
      const alternatesXml = item.alternates
        ? item.alternates
            .map(
              (a) =>
                `    <xhtml:link rel="alternate" hreflang="${a.lang}" href="${a.href}" />`,
            )
            .join("\n") + "\n"
        : "";

      return `  <url>
    <loc>${item.loc}</loc>
${alternatesXml}    <lastmod>${now}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="${baseUrl}/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

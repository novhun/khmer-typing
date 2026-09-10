<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>XML Sitemap | Khmer Typing Quest</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style type="text/css">
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 24px 16px;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            background: #1e293b;
            border-radius: 12px;
            padding: 28px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border: 1px solid #334155;
          }
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 16px;
            border-bottom: 1px solid #334155;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0 0 8px 0;
            font-size: 22px;
            color: #38bdf8;
            letter-spacing: -0.02em;
          }
          p.desc {
            color: #94a3b8;
            font-size: 13px;
            margin: 0;
            line-height: 1.5;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 14px;
            background: #0284c7;
            color: #fff;
            border-radius: 9999px;
            font-size: 13px;
            font-weight: bold;
          }
          .hint-box {
            background: #0f172a;
            border-left: 4px solid #38bdf8;
            padding: 12px 16px;
            border-radius: 4px;
            font-size: 12px;
            color: #cbd5e1;
            margin-bottom: 24px;
          }
          .hint-box code {
            background: #1e293b;
            padding: 2px 6px;
            border-radius: 4px;
            color: #38bdf8;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background: #0f172a;
            color: #94a3b8;
            text-align: left;
            padding: 12px 14px;
            border-bottom: 2px solid #334155;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 11px;
          }
          td {
            padding: 12px 14px;
            border-bottom: 1px solid #334155;
          }
          tr:hover td {
            background: rgba(51, 65, 85, 0.5);
          }
          a {
            color: #38bdf8;
            text-decoration: none;
            word-break: break-all;
            font-family: monospace;
            font-size: 12px;
          }
          a:hover {
            text-decoration: underline;
            color: #7dd3fc;
          }
          .prio-tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 11px;
            background: #064e3b;
            color: #34d399;
          }
          .freq-tag {
            color: #cbd5e1;
            font-size: 12px;
          }
          .time-tag {
            color: #94a3b8;
            font-size: 11px;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-row">
            <div>
              <h1>⚡ XML Sitemap — Khmer Typing Quest</h1>
              <p class="desc">
                Standard XML Sitemap protocol compliant for <strong>Googlebot</strong> and <strong>Bingbot</strong> indexing.
              </p>
            </div>
            <div>
              <span class="badge">Total URLs: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span>
            </div>
          </div>

          <div class="hint-box">
            💡 <strong>Note for developers:</strong> This is an XML document styled with XSL for browser readability. To inspect the raw XML tags (<code translate="no">&lt;loc&gt;</code>, <code translate="no">&lt;priority&gt;</code>), right-click and select <strong>View Page Source</strong> (<code translate="no">Ctrl + U</code>).
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 52%;">URL Location</th>
                <th style="width: 14%;">Priority</th>
                <th style="width: 14%;">Change Frequency</th>
                <th style="width: 20%;">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <xsl:variable name="itemURL">
                      <xsl:value-of select="sitemap:loc"/>
                    </xsl:variable>
                    <a href="{$itemURL}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td>
                    <span class="prio-tag">
                      <xsl:value-of select="sitemap:priority"/>
                    </span>
                  </td>
                  <td class="freq-tag">
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td class="time-tag">
                    <xsl:value-of select="sitemap:lastmod"/>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

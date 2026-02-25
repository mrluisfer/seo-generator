import { buildSeoOutputContext } from "@/lib/build-seo-context";
import { SeoFormData } from "@/store/use-seo-form-store";

export function getRobotsTxtCode(props: SeoFormData) {
  const context = buildSeoOutputContext(props);
  const baseUrl = context.siteOrigin ?? "https://example.com";

  return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
}

export function getSitemapXmlCode(props: SeoFormData) {
  const context = buildSeoOutputContext(props);
  const pageUrl = context.canonicalUrl ?? "https://example.com/current-page";
  const lastmod = context.modifiedDate || new Date().toISOString().slice(0, 10);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
}

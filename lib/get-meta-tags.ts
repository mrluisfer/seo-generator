import { buildSeoOutputContext } from "@/lib/build-seo-context";
import { escapeHtmlAttribute } from "@/lib/escape-code";
import { SeoFormData } from "@/store/use-seo-form-store";

export function getMetaTagsCode(props: SeoFormData) {
  const context = buildSeoOutputContext(props);
  const title = escapeHtmlAttribute(context.title);
  const description = escapeHtmlAttribute(context.description);
  const canonical = context.canonicalUrl ? escapeHtmlAttribute(context.canonicalUrl) : "";
  const image = context.imageUrl ? escapeHtmlAttribute(context.imageUrl) : "";
  const siteName = escapeHtmlAttribute(context.siteName);
  const author = escapeHtmlAttribute(context.authorName);
  const publishedDate = escapeHtmlAttribute(context.publishedDate);
  const modifiedDate = escapeHtmlAttribute(context.modifiedDate);

  return `
    <!-- Charset & Viewport -->
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />
    <meta name="author" content="${author}" />

    <!-- Canonical -->
    ${canonical ? `<link rel="canonical" href="${canonical}" />` : ""}

    <!-- Robots -->
    <meta name="robots" content="index, follow" />

    <!-- Article signals -->
    <meta property="article:author" content="${author}" />
    ${publishedDate ? `<meta property="article:published_time" content="${publishedDate}" />` : ""}
    ${modifiedDate ? `<meta property="article:modified_time" content="${modifiedDate}" />` : ""}

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    ${canonical ? `<meta property="og:url" content="${canonical}" />` : ""}
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    ${image ? `<meta property="og:image" content="${image}" />` : ""}
    ${image ? `<meta property="og:image:alt" content="${title}" />` : ""}
    <meta property="og:site_name" content="${siteName}" />

    <!-- X (Twitter) -->
    <meta name="twitter:card" content="summary_large_image" />
    ${canonical ? `<meta name="twitter:url" content="${canonical}" />` : ""}
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    ${image ? `<meta name="twitter:image" content="${image}" />` : ""}
    ${image ? `<meta name="twitter:image:alt" content="${title}" />` : ""}

    <!-- Pair this with JSON-LD + LLM content blocks for stronger machine readability -->
    <!-- Tags generated with https://seo-generator.vercel.app -->
  `;
}

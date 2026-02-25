import { buildSeoOutputContext } from "@/lib/build-seo-context";
import { SeoFormData } from "@/store/use-seo-form-store";

export function getAstroMetadataCode(props: SeoFormData) {
  const context = buildSeoOutputContext(props);

  return `---
import { defineAstroMetadata } from "astro:metadata";

export const metadata = defineAstroMetadata({
  title: ${JSON.stringify(context.title)},
  description: ${JSON.stringify(context.description)},
  canonical: ${JSON.stringify(context.canonicalUrl ?? "")},
  authors: [{ name: ${JSON.stringify(context.authorName)} }],
  openGraph: {
    type: "article",
    title: ${JSON.stringify(context.title)},
    description: ${JSON.stringify(context.description)},
    ${context.canonicalUrl ? `url: ${JSON.stringify(context.canonicalUrl)},` : ""}
    siteName: ${JSON.stringify(context.siteName)},
    publishedTime: ${JSON.stringify(context.publishedDate)},
    modifiedTime: ${JSON.stringify(context.modifiedDate)},
    ${context.imageUrl ? `images: [${JSON.stringify(context.imageUrl)}],` : ""}
  },
  twitter: {
    card: "summary_large_image",
    title: ${JSON.stringify(context.title)},
    description: ${JSON.stringify(context.description)},
    ${context.imageUrl ? `images: [${JSON.stringify(context.imageUrl)}],` : ""}
  },
  robots: {
    index: true,
    follow: true,
  },
});
---

<!-- Add generated JSON-LD schemas in the page head -->
`;
}

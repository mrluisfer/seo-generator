import { buildSeoOutputContext } from "@/lib/build-seo-context";
import { SeoFormData } from "@/store/use-seo-form-store";

export function getNextJsMetadataCode(props: SeoFormData) {
  const context = buildSeoOutputContext(props);
  const websiteOrigin = context.siteOrigin ?? "https://example.com";

  return `import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(${JSON.stringify(websiteOrigin)}),
  title: ${JSON.stringify(context.title)},
  description: ${JSON.stringify(context.description)},
  alternates: {
    canonical: ${JSON.stringify(context.canonicalUrl ?? "")},
  },
  authors: [{ name: ${JSON.stringify(context.authorName)} }],
  openGraph: {
    type: "article",
    ${context.canonicalUrl ? `url: ${JSON.stringify(context.canonicalUrl)},` : ""}
    title: ${JSON.stringify(context.title)},
    description: ${JSON.stringify(context.description)},
    siteName: ${JSON.stringify(context.siteName)},
    publishedTime: ${JSON.stringify(context.publishedDate)},
    modifiedTime: ${JSON.stringify(context.modifiedDate)},
    authors: [${JSON.stringify(context.authorName)}],
    ${context.imageUrl ? `images: [{ url: ${JSON.stringify(context.imageUrl)}, alt: ${JSON.stringify(context.title)} }],` : ""}
  },
  twitter: {
    card: "summary_large_image",
    ${context.canonicalUrl ? `url: ${JSON.stringify(context.canonicalUrl)},` : ""}
    title: ${JSON.stringify(context.title)},
    description: ${JSON.stringify(context.description)},
    ${context.imageUrl ? `images: [${JSON.stringify(context.imageUrl)}],` : ""}
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Add JSON-LD using <Script type=\"application/ld+json\" /> with the generated schema snippets.
`;
}

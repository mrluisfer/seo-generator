import { buildSeoOutputContext } from "@/lib/build-seo-context";
import { SeoFormData } from "@/store/use-seo-form-store";

export function getJsonLdCode(props: SeoFormData) {
  const context = buildSeoOutputContext(props);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: context.title,
    description: context.description,
    author: {
      "@type": "Person",
      name: context.authorName,
    },
    datePublished: context.publishedDate,
    dateModified: context.modifiedDate,
    ...(context.canonicalUrl
      ? {
          mainEntityOfPage: context.canonicalUrl,
          url: context.canonicalUrl,
        }
      : {}),
    ...(context.imageUrl ? { image: [context.imageUrl] } : {}),
    ...(context.referencesList.length > 0 ? { citation: context.referencesList } : {}),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: context.faqList.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: context.breadcrumbList.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };

  const howToSchema =
    context.howToStepList.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How to optimize ${context.title}`,
          description: context.tldr,
          step: context.howToStepList.map((step, index) => ({
            "@type": "HowToStep",
            position: index + 1,
            name: `Step ${index + 1}`,
            text: step,
          })),
        }
      : null;

  const schemas = [articleSchema, faqSchema, breadcrumbSchema, howToSchema].filter(Boolean);

  return schemas
    .map((schema) => {
      const content = JSON.stringify(schema, null, 2);
      return `<script type="application/ld+json">\n${content}\n</script>`;
    })
    .join("\n\n");
}

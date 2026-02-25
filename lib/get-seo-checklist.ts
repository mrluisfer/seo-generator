import { buildSeoOutputContext } from "@/lib/build-seo-context";
import { SeoFormData } from "@/store/use-seo-form-store";

export type SeoChecklistItem = {
  id: string;
  title: string;
  pass: boolean;
  detail: string;
};

export function getSeoChecklist(props: SeoFormData): SeoChecklistItem[] {
  const context = buildSeoOutputContext(props);

  return [
    {
      id: "meta-core",
      title: "Core metadata",
      pass: Boolean(context.title && context.description && context.canonicalUrl),
      detail: "Title, description and canonical URL are present.",
    },
    {
      id: "social-meta",
      title: "OpenGraph/Twitter",
      pass: Boolean(context.title && context.description),
      detail: "Social metadata has title/description and optional image.",
    },
    {
      id: "structured-data",
      title: "JSON-LD schemas",
      pass: Boolean(context.authorName && context.publishedDate && context.modifiedDate),
      detail: "Article, FAQ and Breadcrumb schemas are ready. HowTo is conditional.",
    },
    {
      id: "llm-blocks",
      title: "LLM content blocks",
      pass: Boolean(context.tldr && context.keyFactsList.length > 0 && context.faqList.length > 0),
      detail: "TL;DR, Key Facts and FAQ sections are available.",
    },
    {
      id: "crawlability",
      title: "Crawlability files",
      pass: true,
      detail: "robots.txt and sitemap.xml snippets are generated.",
    },
    {
      id: "eeat",
      title: "E-E-A-T signals",
      pass: Boolean(
        context.authorName &&
          context.publishedDate &&
          context.modifiedDate &&
          context.referencesList.length > 0,
      ),
      detail: "Author, dates and references are visible for trust signals.",
    },
  ];
}

export function getSeoChecklistMarkdown(props: SeoFormData): string {
  const checks = getSeoChecklist(props);

  return checks
    .map((check) => `- [${check.pass ? "x" : " "}] ${check.title}: ${check.detail}`)
    .join("\n");
}

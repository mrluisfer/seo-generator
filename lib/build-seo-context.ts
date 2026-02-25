import { SeoFormData } from "@/store/use-seo-form-store";

export type FaqEntry = {
  question: string;
  answer: string;
};

export type BreadcrumbEntry = {
  name: string;
  item: string;
};

export type SeoOutputContext = Omit<SeoFormData, "imageFile"> & {
  canonicalUrl?: string;
  siteOrigin?: string;
  imageUrl?: string;
  description: string;
  tldr: string;
  keyFactsList: string[];
  faqList: FaqEntry[];
  howToStepList: string[];
  referencesList: string[];
  breadcrumbList: BreadcrumbEntry[];
};

const FAQ_SEPARATOR = "::";

function normalizeNewLineList(value?: string): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^([-*]|\d+\.)\s+/, ""))
    .filter(Boolean);
}

function parseFaq(value?: string): FaqEntry[] {
  return normalizeNewLineList(value)
    .map((line) => {
      const [question, ...answerParts] = line.split(FAQ_SEPARATOR);
      const answer = answerParts.join(FAQ_SEPARATOR).trim();

      if (!question?.trim() || !answer) {
        return null;
      }

      return {
        question: question.trim(),
        answer,
      };
    })
    .filter((entry): entry is FaqEntry => Boolean(entry));
}

function normalizeUrl(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return undefined;
  }

  try {
    const normalizedUrl = new URL(trimmed);
    return normalizedUrl.toString();
  } catch {
    return undefined;
  }
}

function resolveSiteOrigin(canonicalUrl?: string): string | undefined {
  if (!canonicalUrl) {
    return undefined;
  }

  try {
    return new URL(canonicalUrl).origin;
  } catch {
    return undefined;
  }
}

function humanizeSlug(value: string): string {
  return decodeURIComponent(value)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildBreadcrumbs(canonicalUrl: string | undefined, siteName: string, title: string): BreadcrumbEntry[] {
  if (!canonicalUrl) {
    return [
      { name: siteName, item: "https://example.com/" },
      { name: title, item: "https://example.com/current-page" },
    ];
  }

  const parsedUrl = new URL(canonicalUrl);
  const segments = parsedUrl.pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbEntry[] = [{ name: siteName, item: `${parsedUrl.origin}/` }];

  if (segments.length === 0) {
    breadcrumbs.push({ name: title, item: canonicalUrl });
    return breadcrumbs;
  }

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      name: isLast ? title : humanizeSlug(segment),
      item: `${parsedUrl.origin}${currentPath}`,
    });
  });

  return breadcrumbs;
}

function resolveImageUrl(input: SeoFormData, siteOrigin?: string): string | undefined {
  if (!input.imageFile) {
    return undefined;
  }

  const source = input.imageFile.file;
  if (typeof File !== "undefined" && source instanceof File) {
    return siteOrigin ? `${siteOrigin}/${source.name}` : `/${source.name}`;
  }

  if (!("url" in source) || typeof source.url !== "string") {
    return undefined;
  }

  const sourceUrl = source.url.trim();
  if (!sourceUrl) {
    return undefined;
  }

  if (siteOrigin && sourceUrl.startsWith("/")) {
    return `${siteOrigin}${sourceUrl}`;
  }

  return sourceUrl;
}

export function buildSeoOutputContext(input: SeoFormData): SeoOutputContext {
  const canonicalUrl = normalizeUrl(input.url);
  const description = input.description?.trim() ?? "";
  const tldr = input.tldr.trim() || description;
  const keyFactsList = normalizeNewLineList(input.keyFacts);
  const howToStepList = normalizeNewLineList(input.howToSteps);
  const referencesList = normalizeNewLineList(input.references);
  const faqList = parseFaq(input.faq);
  const siteOrigin = resolveSiteOrigin(canonicalUrl);
  const imageUrl = resolveImageUrl(input, siteOrigin);
  const breadcrumbList = buildBreadcrumbs(canonicalUrl, input.siteName.trim(), input.title.trim());

  const fallbackKeyFacts =
    keyFactsList.length > 0
      ? keyFactsList
      : [
          `Author: ${input.authorName.trim()}`,
          `Published: ${input.publishedDate.trim()}`,
          `Updated: ${input.modifiedDate.trim()}`,
        ];

  const fallbackFaq =
    faqList.length > 0
      ? faqList
      : [
          {
            question: `What is ${input.title.trim()}?`,
            answer: tldr || description,
          },
        ];

  return {
    title: input.title.trim(),
    description,
    url: input.url?.trim(),
    canonicalUrl,
    siteOrigin,
    imageUrl,
    siteName: input.siteName.trim(),
    authorName: input.authorName.trim(),
    publishedDate: input.publishedDate.trim(),
    modifiedDate: input.modifiedDate.trim(),
    tldr,
    keyFacts: input.keyFacts,
    keyFactsList: fallbackKeyFacts,
    faq: input.faq,
    faqList: fallbackFaq,
    howToSteps: input.howToSteps,
    howToStepList,
    references: input.references,
    referencesList,
    breadcrumbList,
  };
}

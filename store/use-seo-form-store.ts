import { FileWithPreview } from "@/hooks/use-file-upload";
import { create } from "zustand";

const today = new Date().toISOString().slice(0, 10);

export type SeoFormData = {
  title: string;
  description?: string;
  imageFile: FileWithPreview | undefined;
  url?: string;
  siteName: string;
  authorName: string;
  publishedDate: string;
  modifiedDate: string;
  tldr: string;
  keyFacts: string;
  faq: string;
  howToSteps: string;
  references: string;
};

export type SeoFormState = SeoFormData & {
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setImageFile: (image: FileWithPreview | undefined) => void;
  setUrl: (url: string) => void;
  setSiteName: (siteName: string) => void;
  setAuthorName: (authorName: string) => void;
  setPublishedDate: (publishedDate: string) => void;
  setModifiedDate: (modifiedDate: string) => void;
  setTldr: (tldr: string) => void;
  setKeyFacts: (keyFacts: string) => void;
  setFaq: (faq: string) => void;
  setHowToSteps: (howToSteps: string) => void;
  setReferences: (references: string) => void;
  getIsFormComplete: () => boolean;
};

export const useSeoFormStore = create<SeoFormState>((set) => ({
  title: "SEO Generator - Create SEO metadata for your web pages",
  setTitle: (title: string) => set({ title }),
  description:
    "With SEO Generator you can edit and experiment with your content then preview how your webpage will look on Google, Facebook, X and more!",
  setDescription: (description: string) => set({ description }),
  imageFile: undefined,
  setImageFile: (imageFile: FileWithPreview | undefined) => set({ imageFile }),
  url: "https://seo-generator.vercel.app",
  setUrl: (url: string) => set({ url }),
  siteName: "SEO Generator",
  setSiteName: (siteName: string) => set({ siteName }),
  authorName: "mrluisfer",
  setAuthorName: (authorName: string) => set({ authorName }),
  publishedDate: today,
  setPublishedDate: (publishedDate: string) => set({ publishedDate }),
  modifiedDate: today,
  setModifiedDate: (modifiedDate: string) => set({ modifiedDate }),
  tldr:
    "SEO Generator helps you create SEO metadata and LLM-friendly content blocks in one workflow, with live previews and copy-ready snippets.",
  setTldr: (tldr: string) => set({ tldr }),
  keyFacts: [
    "Includes metadata for title, description, canonical, Open Graph, and Twitter.",
    "Generates JSON-LD snippets for Article, FAQ, Breadcrumbs, and optional HowTo.",
    "Adds TL;DR, Key Facts, FAQ, and References sections for better LLM readability.",
  ].join("\n"),
  setKeyFacts: (keyFacts: string) => set({ keyFacts }),
  faq: [
    "Why should I optimize for LLMs?::LLMs increasingly drive discovery, so structured and concise content improves citation potential.",
    "What schemas are generated?::Article, FAQPage, BreadcrumbList, and HowTo (when steps are provided).",
  ].join("\n"),
  setFaq: (faq: string) => set({ faq }),
  howToSteps: [
    "Complete the metadata fields with title, description, canonical URL, and image.",
    "Fill in TL;DR, Key Facts, FAQ, and references.",
    "Copy the generated HTML + JSON-LD snippets into your page templates.",
  ].join("\n"),
  setHowToSteps: (howToSteps: string) => set({ howToSteps }),
  references: ["https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data"].join(
    "\n",
  ),
  setReferences: (references: string) => set({ references }),
  getIsFormComplete: (): boolean => {
    const { title, description, url, authorName, publishedDate, modifiedDate } = useSeoFormStore.getState();

    const hasTitle = typeof title === "string" && title.trim().length > 0;
    const hasDescription = typeof description === "string" && description.trim().length > 0;
    const hasUrl = typeof url === "string" && /^https?:\/\/.+/.test(url.trim());
    const hasAuthorName = typeof authorName === "string" && authorName.trim().length > 0;
    const hasPublishedDate = typeof publishedDate === "string" && publishedDate.trim().length > 0;
    const hasModifiedDate = typeof modifiedDate === "string" && modifiedDate.trim().length > 0;

    return hasTitle && hasDescription && hasUrl && hasAuthorName && hasPublishedDate && hasModifiedDate;
  },
}));

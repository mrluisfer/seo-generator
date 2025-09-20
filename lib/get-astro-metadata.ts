import { SeoFormState } from "@/store/use-seo-form-store";

type MetaTagsProps = Omit<
  SeoFormState,
  "setTitle" | "setDescription" | "setImageFile" | "setUrl" | "getIsFormComplete"
>;

export function getAstroMetadataCode(props: MetaTagsProps) {
  const imageUrl = props.imageFile ? `/${props.imageFile.file.name}` : null;

  return `---
import { defineAstroMetadata } from "astro:metadata";

export const metadata = defineAstroMetadata({
  title: "${props.title}",
  description: "${props.description}",
  ${props.url ? `canonical: "${props.url}",` : ""}
  openGraph: {
    title: "${props.title}",
    description: "${props.description}",
    ${props.url ? `url: "${props.url}",` : ""}
    ${imageUrl ? `images: ["${imageUrl}"],` : ""}
  },
  twitter: {
    card: "summary_large_image",
    title: "${props.title}",
    description: "${props.description}",
    ${imageUrl ? `images: ["${imageUrl}"],` : ""}
  },
});
---`;
}

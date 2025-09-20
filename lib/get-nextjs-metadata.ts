import { SeoFormState } from "@/store/use-seo-form-store";

type MetaTagsProps = Omit<
  SeoFormState,
  "setTitle" | "setDescription" | "setImageFile" | "setUrl" | "getIsFormComplete"
>;

export function getNextJsMetadataCode(props: MetaTagsProps) {
  const imageUrl = props.imageFile ? `/${props.imageFile.file.name}` : null;

  return `export const metadata = {
  title: "${props.title}",
  description: "${props.description}",
  openGraph: {
    type: "website",
    ${props.url ? `url: "${props.url}",` : ""}
    title: "${props.title}",
    description: "${props.description}",
    ${imageUrl ? `images: ["${imageUrl}"],` : ""}
    siteName: "${props.title}",
  },
  twitter: {
    card: "summary_large_image",
    ${props.url ? `url: "${props.url}",` : ""}
    title: "${props.title}",
    description: "${props.description}",
    ${imageUrl ? `images: ["${imageUrl}"],` : ""}
  },
};`;
}

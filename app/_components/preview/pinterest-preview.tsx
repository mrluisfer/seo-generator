import { Pinterest } from "@/components/icons/pinterest";
import { Label } from "@/components/ui/label";
import { useSeoFormStore } from "@/store/use-seo-form-store";
import Image from "next/image";
import Link from "next/link";

export default function PinterestPreview() {
  const { title, url, imageFile } = useSeoFormStore();
  const canonicalUrl = url?.trim() ?? "";
  const hasValidUrl = /^https?:\/\/.+/i.test(canonicalUrl);
  const pageUrl = hasValidUrl ? canonicalUrl : "#";

  return (
    <div>
      <Label className="mb-6">
        <Pinterest />
        Pinterest
      </Label>
      <Link
        href={pageUrl}
        target={hasValidUrl ? "_blank" : undefined}
        rel={hasValidUrl ? "noopener noreferrer" : undefined}
        className="group block w-full max-w-[320px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80"
        aria-disabled={!hasValidUrl}
        aria-label={hasValidUrl ? `Open Pinterest preview for ${title}` : "Provide a valid URL to enable preview link"}
        tabIndex={hasValidUrl ? 0 : -1}
      >
        <div className="relative aspect-[3/2] w-full">
          <Image src={imageFile?.preview || "/placeholder.jpg"} alt="Pinterest Preview" fill className="rounded-md" />
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-300 group-hover:underline">{title}</p>
      </Link>
    </div>
  );
}

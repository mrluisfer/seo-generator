import { Facebook } from "@/components/icons/facebook";
import { Label } from "@/components/ui/label";
import { getHostnameFromUrl } from "@/lib/get-hostname-from-url";
import { useSeoFormStore } from "@/store/use-seo-form-store";
import Image from "next/image";
import Link from "next/link";

export default function FacebookPreview() {
  const { url, title, description, imageFile } = useSeoFormStore();
  const canonicalUrl = url?.trim() ?? "";
  const hasValidUrl = /^https?:\/\/.+/i.test(canonicalUrl);
  const pageUrl = hasValidUrl ? canonicalUrl : "#";
  const hostname = getHostnameFromUrl(url || "") || "your-domain.com";

  return (
    <div>
      <Label className="mb-6">
        <Facebook />
        Facebook
      </Label>
      <Link
        href={pageUrl}
        target={hasValidUrl ? "_blank" : undefined}
        rel={hasValidUrl ? "noopener noreferrer" : undefined}
        className="group block cursor-pointer rounded-sm border bg-neutral-800 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80"
        aria-disabled={!hasValidUrl}
        aria-label={hasValidUrl ? `Open Facebook preview for ${title}` : "Provide a valid URL to enable preview link"}
        tabIndex={hasValidUrl ? 0 : -1}
      >
        <Image
          src={imageFile?.preview || "/placeholder.jpg"}
          alt="Facebook Preview"
          width={500}
          height={250}
          className="h-auto w-full"
        />
        <div className="border-t px-3 py-2.5">
          <p className="text-sm uppercase text-neutral-400">{hostname}</p>
          <p className="line-clamp-2 font-semibold">{title}</p>
          <p className="line-clamp-2 text-sm text-neutral-400">{description}</p>
        </div>
      </Link>
    </div>
  );
}

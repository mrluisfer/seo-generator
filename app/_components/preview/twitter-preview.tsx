import { Twitter, XformerlyTwitter } from "@/components/icons/twitter";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getHostnameFromUrl } from "@/lib/get-hostname-from-url";
import { cn } from "@/lib/utils";
import { useSeoFormStore } from "@/store/use-seo-form-store";
import Image from "next/image";
import Link from "next/link";

export default function TwitterPreview() {
  const { title, imageFile, url } = useSeoFormStore();
  const canonicalUrl = url?.trim() ?? "";
  const hasValidUrl = /^https?:\/\/.+/i.test(canonicalUrl);
  const pageUrl = hasValidUrl ? canonicalUrl : "#";
  const hostname = getHostnameFromUrl(url || "") || "your-domain.com";

  return (
    <div>
      <Label className="mb-4">
        <XformerlyTwitter />
        Formerly
        <Twitter />
        Twitter
      </Label>
      <Link
        href={pageUrl}
        target={hasValidUrl ? "_blank" : undefined}
        rel={hasValidUrl ? "noopener noreferrer" : undefined}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80"
        aria-disabled={!hasValidUrl}
        aria-label={hasValidUrl ? `Open Twitter preview for ${title}` : "Provide a valid URL to enable preview link"}
        tabIndex={hasValidUrl ? 0 : -1}
      >
        <div className={cn("relative flex h-[220px] items-end rounded-2xl bg-cover bg-center bg-no-repeat p-4 sm:h-[250px]")}>
          <Image
            src={imageFile?.preview || "/placeholder.jpg"}
            fill
            className="rounded-2xl object-cover"
            alt="Twitter Preview"
          />
          <Badge variant={"secondary"} className="z-10 w-fit max-w-full justify-start truncate">
            {title}
          </Badge>
        </div>
        <span className="mt-1 text-xs text-neutral-400 group-hover:underline">From {hostname}</span>
      </Link>
    </div>
  );
}

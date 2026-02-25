import { Google } from "@/components/icons/google";
import { Label } from "@/components/ui/label";
import { useSeoFormStore } from "@/store/use-seo-form-store";
import { ChevronDownIcon } from "lucide-react";
import Link from "next/link";

export default function GooglePreview() {
  const { title, description, url } = useSeoFormStore();
  const canonicalUrl = url?.trim() ?? "";
  const hasValidUrl = /^https?:\/\/.+/i.test(canonicalUrl);
  const displayUrl = hasValidUrl ? canonicalUrl : "https://your-domain.com/page";

  return (
    <div>
      <Label className="mb-6">
        <Google />
        Google
      </Label>
      <div className="space-y-1">
        <Link
          href={hasValidUrl ? canonicalUrl : "#"}
          className="line-clamp-2 font-semibold text-[#99c3ff] transition hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80"
          aria-disabled={!hasValidUrl}
          tabIndex={hasValidUrl ? 0 : -1}
        >
          {title}
        </Link>
        <span className="flex items-center break-all text-sm text-[#00b339] transition hover:underline">
          {displayUrl} <ChevronDownIcon className="size-4 shrink-0" />
        </span>
        <p className="line-clamp-3 text-sm text-neutral-400">{description}</p>
      </div>
    </div>
  );
}

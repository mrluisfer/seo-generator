import { FaviconExample } from "@/components/favicon";
import { Slack } from "@/components/icons/slack";
import { Label } from "@/components/ui/label";
import { useSeoFormStore } from "@/store/use-seo-form-store";
import Image from "next/image";
import Link from "next/link";

export default function SlackPreview() {
  const { title, description, url, imageFile } = useSeoFormStore();
  const canonicalUrl = url?.trim() ?? "";
  const hasValidUrl = /^https?:\/\/.+/i.test(canonicalUrl);
  const pageUrl = hasValidUrl ? canonicalUrl : "#";
  return (
    <div>
      <Label className="mb-6">
        <Slack />
        Slack
      </Label>
      <Link
        href={pageUrl}
        target={hasValidUrl ? "_blank" : undefined}
        rel={hasValidUrl ? "noopener noreferrer" : undefined}
        className="group block cursor-pointer space-y-2 rounded-r-lg border-l-4 border-neutral-700 bg-neutral-900/50 p-4 pl-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80"
        aria-disabled={!hasValidUrl}
        aria-label={hasValidUrl ? `Open Slack preview for ${title}` : "Provide a valid URL to enable preview link"}
        tabIndex={hasValidUrl ? 0 : -1}
      >
        <div className="flex items-center gap-2">
          <FaviconExample color="#2a81fb" className="size-5" />
          <span className="line-clamp-1 capitalize text-neutral-500">{title.slice(0, 35)}</span>
        </div>
        <p className="line-clamp-2 font-semibold text-[#1698e4] group-hover:underline">{title}</p>
        <p className="line-clamp-3 text-neutral-300">{description}</p>
        <Image
          src={imageFile?.preview || "/placeholder.jpg"}
          alt="Slack Preview"
          width={350}
          height={200}
          className="h-auto w-full max-w-[360px] rounded-md"
        />
      </Link>
    </div>
  );
}

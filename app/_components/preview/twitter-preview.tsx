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
  const pageUrl = url || "#";
  const hostname = getHostnameFromUrl(url || "") || "your-domain.com";

  return (
    <div>
      <Label className="mb-4">
        <XformerlyTwitter />
        Formerly
        <Twitter />
        Twitter
      </Label>
      <Link href={pageUrl} target="_blank" rel="noopener noreferrer" className="group">
        <div className={cn("relative flex h-[250px] items-end rounded-2xl bg-cover bg-center bg-no-repeat p-4")}>
          <Image
            src={imageFile?.preview || "/placeholder.jpg"}
            layout="fill"
            className="rounded-2xl object-cover"
            alt="Twitter Preview"
          />
          <Badge variant={"secondary"} className="z-10 w-fit justify-start truncate">
            {title}
          </Badge>
        </div>
        <span className="mt-1 text-xs text-neutral-400 group-hover:underline">From {hostname}</span>
      </Link>
    </div>
  );
}

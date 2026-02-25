import { LinkedIn } from "@/components/icons/linkedin";
import { Label } from "@/components/ui/label";
import { getHostnameFromUrl } from "@/lib/get-hostname-from-url";
import { useSeoFormStore } from "@/store/use-seo-form-store";
import Image from "next/image";
import Link from "next/link";

export default function LinkedinPreview() {
  const { url, title, description, imageFile } = useSeoFormStore();
  const pageUrl = url || "#";
  const hostname = getHostnameFromUrl(url || "") || "your-domain.com";

  return (
    <div>
      <Label className="mb-6">
        <LinkedIn />
        LinkedIn
      </Label>
      <Link
        href={pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block cursor-pointer rounded-sm border bg-neutral-800 transition hover:brightness-95"
      >
        <Image
          src={imageFile?.preview || "/placeholder.jpg"}
          alt="Facebook Preview"
          layout="responsive"
          width={500}
          height={250}
        />
        <div className="border-t px-3 py-2.5" title={description}>
          <p>{title}</p>
          <p className="text-xs uppercase text-neutral-400">{hostname}</p>
        </div>
      </Link>
    </div>
  );
}

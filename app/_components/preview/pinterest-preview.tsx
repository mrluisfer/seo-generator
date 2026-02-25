import { Pinterest } from "@/components/icons/pinterest";
import { Label } from "@/components/ui/label";
import { useSeoFormStore } from "@/store/use-seo-form-store";
import Image from "next/image";
import Link from "next/link";

export default function PinterestPreview() {
  const { title, url, imageFile } = useSeoFormStore();
  const pageUrl = url || "#";

  return (
    <div>
      <Label className="mb-6">
        <Pinterest />
        Pinterest
      </Label>
      <Link href={pageUrl} target="_blank" rel="noopener noreferrer" className="group block w-[300px]">
        <div className="relative h-[200px] w-[300px]">
          <Image src={imageFile?.preview || "/placeholder.jpg"} alt="Pinterest Preview" fill className="rounded-md" />
        </div>
        <p className="mt-1 text-sm text-neutral-300 group-hover:underline">{title}</p>
      </Link>
    </div>
  );
}

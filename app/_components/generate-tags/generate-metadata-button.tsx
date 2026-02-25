import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { ArrowRightIcon } from "lucide-react";
import { ComponentProps } from "react";

export default function GenerateMetadataButton({
  className,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  return (
    <Button
      {...props}
      className={cn(
        "cursor-pointer whitespace-normal bg-blue-600 text-center text-white transition-all hover:bg-blue-500/90 active:scale-95",
        className,
      )}
    >
      Generate SEO + LLM Pack
      <ArrowRightIcon size={16} aria-hidden="true" />
    </Button>
  );
}

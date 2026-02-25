import * as React from "react";

import { highlightCode } from "@/lib/highlight-code";
import { cn } from "@/lib/utils";

const accentByLanguage: Record<string, string> = {
  html: "border-cyan-400/30",
  xml: "border-emerald-400/30",
  bash: "border-blue-400/30",
  tsx: "border-amber-400/30",
  astro: "border-violet-400/30",
  md: "border-rose-400/30",
  markdown: "border-rose-400/30",
};

export function ComponentSource({
  src,
  title,
  language,
  className,
}: React.ComponentProps<"div"> & {
  src?: string;
  title?: string;
  language?: string;
}) {
  const [highlightedCode, setHighlightedCode] = React.useState<string | undefined>();

  const code: string | undefined = src;

  const lang = language ?? title?.split(".").pop() ?? "tsx";

  // const highlightedCode = await highlightCode(code);
  React.useEffect(() => {
    async function load() {
      const highlighted = await highlightCode(code ?? "", lang);
      setHighlightedCode(highlighted);
    }

    load();
  }, [code, lang]);

  if (!code) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <ComponentCode
        highlightedCode={highlightedCode ?? ""}
        language={lang}
        title={title}
        accentClass={accentByLanguage[lang.toLowerCase()] ?? "border-white/15"}
      />
    </div>
  );
}

function ComponentCode({
  highlightedCode,
  language,
  title,
  accentClass,
}: {
  highlightedCode: string;
  language: string;
  title: string | undefined;
  accentClass: string;
}) {
  return (
    <figure data-rehype-pretty-code-figure="" className={cn("rounded-lg border", accentClass, "[&>pre]:max-h-96")}>
      {title && (
        <figcaption
          data-rehype-pretty-code-title=""
          className="text-code-foreground border-b border-white/10 px-3 py-2 [&_svg]:text-code-foreground flex items-center gap-2 text-xs font-medium uppercase tracking-wide [&_svg]:size-4 [&_svg]:opacity-70"
          data-language={language}
        >
          {title}
        </figcaption>
      )}
      <div
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className="custom-scroll [&>pre]:text-wrap [&>pre]:rounded-md [&>pre]:p-3 [&_code]:text-[13px] [&_pre]:max-h-[450px] [&_pre]:overflow-auto"
      />
    </figure>
  );
}

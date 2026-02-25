import { bundledLanguages, codeToHtml } from "shiki";

const languageAliases: Record<string, string> = {
  md: "markdown",
  shell: "bash",
  sh: "bash",
};

const themeByLanguage: Record<string, string> = {
  html: "github-dark-default",
  xml: "houston",
  bash: "nord",
  tsx: "one-dark-pro",
  astro: "material-theme-palenight",
  markdown: "vitesse-dark",
};

function resolveLanguage(language: string): string {
  const normalizedLanguage = language.toLowerCase();
  const resolvedLanguage = languageAliases[normalizedLanguage] ?? normalizedLanguage;

  if (resolvedLanguage in bundledLanguages) {
    return resolvedLanguage;
  }

  return "html";
}

export async function highlightCode(code: string, language = "html") {
  const resolvedLanguage = resolveLanguage(language);
  const selectedTheme = themeByLanguage[resolvedLanguage] ?? "github-dark-default";

  const html = await codeToHtml(code, {
    lang: resolvedLanguage,
    theme: selectedTheme,
    transformers: [
      {
        code(node) {
          node.properties["data-line-numbers"] = "";
        },
      },
    ],
  });

  return html;
}

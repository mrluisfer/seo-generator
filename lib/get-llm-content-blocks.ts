import { buildSeoOutputContext } from "@/lib/build-seo-context";
import { escapeHtmlText } from "@/lib/escape-code";
import { SeoFormData } from "@/store/use-seo-form-store";

export function getLlmContentBlocksCode(props: SeoFormData) {
  const context = buildSeoOutputContext(props);

  const facts = context.keyFactsList.map((fact) => `    <li>${escapeHtmlText(fact)}</li>`).join("\n");

  const faq = context.faqList
    .map(
      (entry) => `    <details>
      <summary>${escapeHtmlText(entry.question)}</summary>
      <p>${escapeHtmlText(entry.answer)}</p>
    </details>`,
    )
    .join("\n");

  const howToSteps =
    context.howToStepList.length > 0
      ? `
  <section id="how-to">
    <h2>How To</h2>
    <ol>
${context.howToStepList.map((step) => `      <li>${escapeHtmlText(step)}</li>`).join("\n")}
    </ol>
  </section>`
      : "";

  const references =
    context.referencesList.length > 0
      ? `
  <section id="references">
    <h2>References</h2>
    <ul>
${context.referencesList.map((reference) => `      <li><a href="${escapeHtmlText(reference)}" rel="noopener noreferrer">${escapeHtmlText(reference)}</a></li>`).join("\n")}
    </ul>
  </section>`
      : "";

  return `<article aria-labelledby="article-title">
  <header>
    <h1 id="article-title">${escapeHtmlText(context.title)}</h1>
    <p><strong>Author:</strong> ${escapeHtmlText(context.authorName)}</p>
    <p>
      <time datetime="${escapeHtmlText(context.publishedDate)}">Published: ${escapeHtmlText(context.publishedDate)}</time>
      <span> | </span>
      <time datetime="${escapeHtmlText(context.modifiedDate)}">Updated: ${escapeHtmlText(context.modifiedDate)}</time>
    </p>
  </header>

  <section id="tldr">
    <h2>TL;DR</h2>
    <p>${escapeHtmlText(context.tldr)}</p>
  </section>

  <section id="key-facts">
    <h2>Key Facts</h2>
    <ul>
${facts}
    </ul>
  </section>

  <section id="faq">
    <h2>FAQ</h2>
${faq}
  </section>${howToSteps}${references}
</article>`;
}

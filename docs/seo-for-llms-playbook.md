# SEO for LLMs Playbook

This playbook defines how content in **seo-generator** should be written and generated so it can be indexed and cited by both search engines and LLMs.

## 1. Metadata standard

Every content page should include:

- Title (`<title>` + `meta[name="title"]`)
- Description (`meta[name="description"]`)
- Canonical URL (`link[rel="canonical"]`)
- OpenGraph metadata (`og:title`, `og:description`, `og:url`, `og:image`)
- Twitter metadata (`twitter:title`, `twitter:description`, `twitter:card`, `twitter:image`)
- Author and article dates (`meta[name="author"]`, `article:published_time`, `article:modified_time`)

## 2. Structured data (JSON-LD)

Use schema blocks based on content type:

- `Article` for regular page content
- `FAQPage` when FAQ questions/answers are present
- `BreadcrumbList` for page hierarchy
- `HowTo` only when instructions are step-based

Rules:

- Include `author`, `datePublished`, `dateModified`
- Keep `headline`, `description`, and URLs aligned with metadata values
- Keep schema values concise and factual

## 3. LLM-friendly content blocks

Expose these sections in page body templates:

- **TL;DR**: 1-2 short sentences
- **Key Facts**: bullet list, one fact per line
- **FAQ**: direct questions and direct answers
- **References**: trustworthy source links

Optional:

- **HowTo**: ordered steps for procedural content
- **Section anchors** (`id` attributes) for easier citation targeting

## 4. Crawlability requirements

- Generate and publish `sitemap.xml` in build output
- Generate and publish `robots.txt` in build output
- `robots.txt` must include a sitemap pointer
- Canonical URLs should be lowercase and stable

## 5. E-E-A-T guidance

Each content page should clearly display:

- Author name
- Publication date
- Last modified date
- Sources/references

## 6. Content writing rules

- Use semantic heading structure (`h1` -> `h2` -> `h3`)
- Keep paragraphs short and focused (single idea per paragraph)
- Prefer concrete nouns and active voice
- Avoid vague filler text

## 7. Engineering workflow

- Use SEO Generator output tabs to copy:
  - Metadata tags
  - JSON-LD scripts
  - LLM blocks
  - robots/sitemap snippets
  - checklist
- Validate output before release using CI (`check:llm-seo`)

## 8. Definition of done

A page is done when:

- Core metadata is present
- OG/Twitter metadata is present
- JSON-LD block(s) are valid
- TL;DR + Key Facts + FAQ exist
- Author + dates + references are visible
- Sitemap and robots entries are updated

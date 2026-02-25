# SEO + LLM Review Checklist

Use this checklist in PR review and content QA.

## Metadata and social cards

- [ ] Page has title and description
- [ ] Page has canonical URL
- [ ] OpenGraph tags are present
- [ ] Twitter tags are present

## Structured data

- [ ] `Article` JSON-LD is present
- [ ] `BreadcrumbList` JSON-LD is present
- [ ] `FAQPage` JSON-LD is present when FAQ exists
- [ ] `HowTo` JSON-LD is present for instructional pages

## LLM readability blocks

- [ ] TL;DR exists near the top
- [ ] Key Facts section exists and is concise
- [ ] FAQ block exists with explicit Q/A pairs
- [ ] References section exists when factual claims are made

## E-E-A-T signals

- [ ] Author name is visible
- [ ] Published date is visible
- [ ] Updated date is visible

## Crawlability

- [ ] `robots.txt` exists and points to sitemap
- [ ] `sitemap.xml` includes the page URL
- [ ] URL slugs are lowercase and hyphenated

# head

An editor for a web page's search and social metadata. You fill in one document;
it compiles to whichever framework you actually ship.

> Replaces the earlier **Seo Generator** at
> [seo-generator.vercel.app](https://seo-generator.vercel.app/). Same goal,
> rebuilt around a single document model that compiles to every framework.

```sh
bun install
bun run dev
```

Open <http://localhost:5173>.

---

## What it does

**One model, nine targets.** A page's metadata is edited once as a `SeoDocument`,
then serialized to each framework's own idiom — not the same HTML with a
different wrapper.

| Target            | Output                | Idiom                                                   |
| ----------------- | --------------------- | ------------------------------------------------------- |
| HTML              | `index.html`          | plain `<meta>` / `<link>` / JSON-LD                     |
| Next.js           | `app/page.tsx`        | Metadata API, plus a `viewport` export for `themeColor` |
| Next.js · dynamic | `app/[slug]/page.tsx` | `generateMetadata`                                      |
| SvelteKit         | `+page.svelte`        | `<svelte:head>`                                         |
| Astro             | `Seo.astro`           | frontmatter + `set:html`                                |
| React Helmet      | `Seo.tsx`             | `<Helmet>` for `react-helmet-async`                     |
| Nuxt              | `pages/index.vue`     | `useHead`                                               |
| React Router      | `routes/route.tsx`    | `meta` export (also Remix v2)                           |
| JSON              | `seo.json`            | the raw model, re-importable                            |

**It measures in pixels, not characters.** Search results truncate by rendered
width, so `WWWWW` and `iiiii` are the same character count and nowhere near the
same width. The gauge under the title and description shows measured pixels
against the real limit and previews the exact string that survives the cut.

**Structured data from a registry.** Twelve schema.org types — Organization,
WebSite, Article, Product, BreadcrumbList, FAQPage, LocalBusiness, Person,
Event, SoftwareApplication, VideoObject, HowTo — declared as field descriptors,
so the forms are generated rather than hand-written. Multiple blocks compile
into a single `@graph`.

**A linter, not a checklist.** Every finding names the consequence and links back
to the one field that clears it. A check that cannot be resolved does not belong
in the list.

**Social previews per platform.** X, Facebook, LinkedIn, Slack and WhatsApp each
lay a card out differently; the preview reproduces the shape of each. X reads
`twitter:*` and the rest read `og:*`, so an override shows up where it applies.

**AI drafts copy, and only copy.** The model writes titles, descriptions,
keywords and FAQ entries. It never touches URLs, robots rules, or structured
data, and nothing is applied until you pick it.

## Bring your own key

There is no account and no server-side key. You paste an Anthropic or OpenAI
key, it is stored in your browser's `localStorage`, and it is sent with each
generation request to `POST /api/generate` — which exists only so the call does
not have to cross origins from the browser. The route uses the key once per
request and never logs or persists it.

To run against a shared key instead, read one from `$env/dynamic/private` in
`src/routes/api/generate/+server.ts` and fall back to the request body.

## Stack

SvelteKit 2 and Svelte 5 (runes mode), TypeScript, Tailwind CSS 4, Vite, Vitest.
Bun is the package manager and script runner; npm or pnpm work too.

## Layout

```
src/lib/seo/            the domain — pure TypeScript, no framework
  types.ts              the canonical SeoDocument
  defaults.ts           empty/sample documents, fallback resolution
  schemas.ts            JSON-LD registry: field descriptors + node builders
  build.ts              SeoDocument -> HeadTag[] (the intermediate representation)
  emit.ts               HeadTag[] / SeoDocument -> per-framework source
  measure.ts            pixel-width estimation and truncation
  lint.ts               findings and score
  js-literal.ts         JavaScript object-literal printer
  *.test.ts             the suite

src/lib/ai/             output contract and prompt, shared by both providers
src/lib/state/          stores (runes): document, ui, prefs, theme, settings
src/lib/ui/             components
src/routes/api/         the BYOK proxy and the GitHub stats endpoint
```

The domain layer has no imports from `$app` or `$lib/ui`, so it is testable and
portable on its own. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the
data flow and the two extension points.

## Scripts

```sh
bun run dev            # dev server
bun run build          # production build
bun run preview        # serve the build

bun run test           # vitest, once
bun run test:watch     # vitest, watching
bun run test:coverage  # coverage over src/lib/seo

bun run check          # svelte-check (types + a11y)
bun run lint           # prettier --check + eslint
bun run format         # prettier --write

bun run verify         # check + lint + test + build, the same gates as CI
```

## Contributing

Start with [CONTRIBUTING.md](CONTRIBUTING.md). The two most common changes each
touch one file:

- **A new framework target** — add one entry to `TARGETS` in `src/lib/seo/emit.ts`.
- **A new schema.org type** — add one object to `SCHEMA_REGISTRY` in
  `src/lib/seo/schemas.ts`. No UI code; the form is generated from the descriptors.

Missing your framework? [Open an issue](https://github.com/mrluisfer/seo-generator/issues/new?title=Framework%20request%3A%20).

## Not included

`robots.txt` and `sitemap.xml` generation. Both are site-level rather than
page-level and need their own URL-inventory model; they were left out rather
than half-built.

## License

[MIT](LICENSE).

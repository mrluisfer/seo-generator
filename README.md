# head

An editor for a web page's search and social metadata. You fill in one document;
it compiles to whichever framework you actually ship.

```sh
bun install
bun run dev
```

## What it does

- **One model, many targets.** A page's metadata is edited once as a single
  `SeoDocument`, then serialized to HTML, Next.js (static `metadata` and
  `generateMetadata`), SvelteKit, Astro, React Helmet, Nuxt, React Router, or
  raw JSON. Each target speaks its own idiom — Next gets a `viewport` export for
  `themeColor`, Astro gets `set:html`, Nuxt gets `useHead`.
- **Measures in pixels, not characters.** Search results truncate by rendered
  width, so the gauge under the title and description fields shows measured
  pixels against the real limit and previews the exact string that survives the
  cut.
- **Structured data from a registry.** Twelve schema.org types (Organization,
  Article, Product, Breadcrumbs, FAQ, LocalBusiness, Event, HowTo, and more) are
  declared as field descriptors, so the forms are generated rather than
  hand-written. Multiple blocks compile into a single `@graph`.
- **A linter, not a checklist.** Every finding names the consequence and links
  back to the field that causes it.
- **AI drafts copy, and only copy.** The model writes titles, descriptions,
  keywords, and FAQ entries. It never touches URLs, robots rules, or structured
  data. Nothing is applied until you pick it.

## Bring your own key

There is no account and no server-side key. You paste an Anthropic or OpenAI key,
it is stored in your browser's `localStorage`, and it is sent with each
generation request to `POST /api/generate`, which exists only so the call does
not have to cross origins from the browser. The route uses the key once per
request and never logs or persists it.

To run against a shared key instead, read it from `$env/dynamic/private` in
`src/routes/api/generate/+server.ts` and fall back to the request body.

## Layout

```
src/lib/seo/
  types.ts        the canonical SeoDocument
  defaults.ts     empty/sample documents, fallback resolution
  schemas.ts      JSON-LD registry: field descriptors + node builders
  build.ts        SeoDocument -> HeadTag[] (the intermediate representation)
  emit.ts         HeadTag[] / SeoDocument -> per-framework source
  measure.ts      pixel-width estimation and truncation
  lint.ts         findings and score
  js-literal.ts   JavaScript object-literal printer

src/lib/ai/       output contract and prompt, shared by both providers
src/lib/state/    document and settings stores (runes, localStorage)
src/lib/ui/       components
src/routes/api/generate/  the BYOK proxy
```

Adding a framework target means adding one entry to `TARGETS` in `emit.ts`.
Adding a schema type means adding one object to `SCHEMA_REGISTRY` — no UI code.

## Checks

```sh
bun run check     # svelte-check
bun run lint      # prettier + eslint
bun run build
```

## Not included

`robots.txt` and `sitemap.xml` generation. Both are site-level rather than
page-level and would need their own URL-inventory model; they were left out
rather than half-built.

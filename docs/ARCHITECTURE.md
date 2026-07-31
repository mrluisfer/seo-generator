# Architecture

The shape of this codebase follows from one decision: **a page's metadata is a
single document, and everything else is a pure function of it.** Editing,
linting, previewing and exporting are all readers of the same object.

```bash
                    ┌──────────────────┐
                    │   SeoDocument    │   src/lib/seo/types.ts
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
   buildTags()           audit()            resolveOg() etc.
   build.ts              lint.ts            defaults.ts
        │                    │                    │
   HeadTag[]            Finding[]            preview values
        │                    │                    │
   ┌────┴────┐          Checks panel        SERP + social cards
   │ emit.ts │
   └────┬────┘
        │
  HTML · Next · SvelteKit · Astro · Helmet · Nuxt · React Router · JSON
```

## Layers

**`src/lib/seo/` — the domain.** Pure TypeScript. No imports from `$app`,
`$lib/ui`, or any store. This is what makes the suite fast and the logic
portable; keep it that way. If a function here needs to know about the browser,
it belongs somewhere else.

**`src/lib/state/` — the stores.** Svelte 5 runes classes, one concern each:

| Store      | Holds                                                                    | Persisted      |
| ---------- | ------------------------------------------------------------------------ | -------------- |
| `doc`      | the `SeoDocument` being edited, plus its `audit`                         | `localStorage` |
| `ui`       | dialogs, section open/closed, current export target, local preview image | no — ephemeral |
| `prefs`    | display preferences (X/Twitter, Facebook/Meta)                           | `localStorage` |
| `theme`    | system / light / dark                                                    | `localStorage` |
| `settings` | provider choice and BYOK API keys                                        | `localStorage` |

`doc` never imports `ui`. `store.applyDraft()` returns whether it touched
structured data and lets the caller decide what to reveal, so the document layer
stays free of view state.

**`src/lib/ui/` — components.** Chrome (`Header`, `Footer`, both dialogs) is
rendered by `+layout.svelte`, so every route gets it. The route renders only the
workspace.

## The intermediate representation

`buildTags()` compiles a document to `HeadTag[]` — a flat list of `title`,
`meta`, `link` and `jsonld` entries. Every target consumes that same list, so a
target only decides how to _print_ a tag, never how to _derive_ one.

Targets that need the structured document instead of tags (Next.js, Nuxt, React
Router) receive the `SeoDocument` directly, because their APIs are shaped around
nested options rather than a tag list.

## Escaping is the sharp edge

Every bug this project has shipped so far has been an escaping bug. Two layers
guard it, and both are covered by `emit.test.ts`:

1. **Source level.** `printJs()` escapes `<` as `<` inside every string
   literal, so a `</script>` in the data cannot terminate the `<script>` block of
   a Svelte or Vue single-file component.
2. **Runtime level.** Emitted code that stringifies JSON-LD at runtime appends
   `.replace(/</g, '\\u003c')`. The doubled backslash matters: `'<'` in
   generated source parses as `<`, which would make the replacement a no-op.

`roundtrip.test.ts` closes the loop by parsing the metadata back _out_ of each
generated file and comparing it to the document it came from.

## Extension point 1 — a new framework target

One entry in `TARGETS`, `src/lib/seo/emit.ts`:

```ts
{
  id: 'my-framework',
  label: 'My framework',
  filename: 'src/seo.ts',
  language: 'ts',
  note: 'Where the snippet goes.',
  emit: (doc) => { /* … */ }
}
```

Add the `id` to the `TargetId` union. Use `buildTags(doc, { includeDocumentTags: false })`
when the framework owns `charset` and `viewport` itself.

The suite picks the new target up automatically — `emit.test.ts` iterates
`TARGETS` — so it is immediately held to the escaping and non-empty-output
rules. If the target embeds JSON-LD, add a case to `roundtrip.test.ts` too.

## Extension point 2 — a new schema.org type

One object in `SCHEMA_REGISTRY`, `src/lib/seo/schemas.ts`:

```ts
{
  type: 'Recipe',
  label: 'Recipe',
  summary: 'One line on what it earns you.',
  fields: [{ key: 'name', label: 'Name', kind: 'text' }],
  build: (d) => prune({ '@type': 'Recipe', name: s(d, 'name') }) ?? null
}
```

No UI code: the editor renders the form from `fields`, and `kind` picks the
control (`text`, `textarea`, `url`, `date`, `tags`, `group`). `build()` must
return `null` when the input is empty so blank blocks never reach the output —
`schemas.test.ts` asserts exactly that for every entry.

## Measurement

`measure.ts` estimates rendered width from Arial advance widths. The font sizes
in `LIMITS` **must match** the sizes `.serp-title` and `.serp-desc` render at in
`src/routes/layout.css`, or the gauge and the preview disagree about the same
string. They also reproduce the documented pairings: 600px ≈ 60 title characters
at 20px, 920px ≈ 158 description characters at 13px. `measure.test.ts` pins both.

## Design constraints

Two rules the UI is built on, both worth knowing before changing styles:

- **Colour means validation state, never decoration.** The only hues in the app
  (`--ok`, `--warn`, `--bad`) mark the measure gauge, the score bar, finding
  dots and the schema on/off badge. Emphasis elsewhere uses weight, hairlines
  and the mono face. The exception is a preview simulating another product —
  Google's result blue, Slack's link blue — where the colour is part of the
  thing being reproduced.
- **One definition per token.** `layout.css` declares each colour once with
  `light-dark()`; the theme toggle only changes `color-scheme`.

## The BYOK proxy

`POST /api/generate` exists so the browser does not have to make a cross-origin
call that Anthropic and OpenAI would reject. It takes the key from the request
body, uses it once, and never logs or stores it. Both providers share one output
contract (`src/lib/ai/contract.ts`) with a JSON schema enforced by the provider:
`output_config.format` on Anthropic, `response_format` with `strict: true` on
OpenAI.

`GET /api/github` caches the repository's star and fork counts for 30 minutes
and collapses concurrent misses into one upstream call, so the unauthenticated
GitHub limit of 60 requests per hour is never a factor.

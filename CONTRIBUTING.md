# Contributing

Thanks for taking the time. This file covers the practical stuff; the design
reasoning lives in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Setup

```sh
bun install
bun run dev
```

Node 22 or newer. npm and pnpm work if you prefer them — Bun is just what the
lockfile was generated with.

## Before opening a pull request

```sh
bun run verify
```

That runs the same four gates as CI: `check` (types and a11y), `lint`
(prettier + eslint), `test` (vitest), and `build`. Run `bun run format` first if
prettier complains.

## The two changes people make most

**Add a framework target** — one entry in `TARGETS`, `src/lib/seo/emit.ts`, and
its `id` in the `TargetId` union. The test suite iterates `TARGETS`, so your
target is immediately held to the escaping rules without you writing a test for
it. Add a case to `roundtrip.test.ts` if it embeds JSON-LD.

**Add a schema.org type** — one object in `SCHEMA_REGISTRY`,
`src/lib/seo/schemas.ts`. No UI code; the form is generated from the field
descriptors. `build()` must return `null` for empty input.

Both are described with examples in the architecture doc.

## What the tests are for

The suite is small and deliberately opinionated. It exists because every bug
this project has shipped fell into one of three buckets:

- **Escaping** — a `</script>` in user data breaking the generated file.
- **Calibration** — the pixel gauge disagreeing with what the preview renders.
- **Un-actionable findings** — a check that fires because you filled a field in,
  which can never be cleared.

If you fix a bug, the useful test is the one that fails before your fix. Adding
a case to an existing `it.each` table is usually better than a new file.

## Conventions

**Comments explain why, not what.** The code says what it does. A comment earns
its place by recording a constraint, a trade-off, or a trap — something the next
reader would otherwise have to rediscover.

**The domain layer stays pure.** Nothing in `src/lib/seo/` may import `$app`,
`$lib/ui`, or a store. That is what keeps the suite fast and the logic portable.

**Colour means validation state.** See the design constraints in the
architecture doc before adding a hue to the interface.

**Copy is design material.** Interface text says what happens in the user's
words, in sentence case, active voice. An action keeps the same name through the
whole flow — the button that says "Export code" opens a panel titled "Export code".

Formatting is prettier's problem, not yours; don't hand-format.

## Commits and branches

No enforced convention. Write a subject line that says what changed and why it
mattered. Branch off `main`; keep a pull request to one concern so it can be
reviewed and reverted on its own.

## Reporting things

- **A bug** — the issue template asks for the target framework and the input
  that triggered it. The input matters most: most bugs here are escaping bugs,
  and they need the exact string.
- **A missing framework** — there's a
  [request template](https://github.com/mrluisfer/seo-generator/issues/new?title=Framework%20request%3A%20),
  also linked from the export panel.
- **A security issue** — see [SECURITY.md](SECURITY.md); please don't open a
  public issue.

## Code of conduct

Participation is covered by the [Code of Conduct](CODE_OF_CONDUCT.md).

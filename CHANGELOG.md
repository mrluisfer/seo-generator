# Changelog

Notable changes to this project. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Rewrite on SvelteKit, replacing the Next.js
  [Seo Generator](https://seo-generator.vercel.app/).
- One canonical `SeoDocument` compiling to nine targets: HTML, Next.js (static
  and `generateMetadata`), SvelteKit, Astro, React Helmet, Nuxt, React Router,
  and raw JSON.
- Twelve schema.org types from a field-descriptor registry, compiled into a
  single `@graph`.
- Pixel-width gauge for the title and description, measuring the way search
  results truncate instead of counting characters.
- Linter whose findings each name the one field that clears them.
- Per-platform social previews for X, Facebook, LinkedIn, Slack, and WhatsApp.
- AI drafting for copy only, bring-your-own-key, via a stateless proxy.
- System / light / dark theme, and display preferences for X-or-Twitter and
  Facebook-or-Meta.
- Test suite over the domain layer covering escaping, metadata round-trips,
  gauge calibration, and the findings contract.

### Fixed

- `</script>` inside JSON-LD no longer terminates the `<script>` block of a
  Svelte or Vue single-file component.
- The Nuxt target's runtime escape was self-cancelling and replaced `<` with `<`.
- The description gauge measured at 14px while the preview rendered at 13px,
  which flagged ordinary 150-character copy as truncated.
- Two-column workspace clipped its content instead of scrolling, because the
  grid's implicit row was auto-sized.
- Visually hidden inputs escaped their containing block and stretched the
  document height.
- JSON-LD was injected with an over-escaped closing tag, so the script element
  never closed and swallowed the rest of the head.
- Deploys failed on Vercel because `adapter-auto` resolved its platform adapter
  at build time into a tree where a CommonJS require of `estree-walker` hit the
  ESM-only v3. The adapter is now named explicitly, which also makes it run
  during local and CI builds instead of silently doing nothing.

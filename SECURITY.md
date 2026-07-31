# Security

## Reporting

Report privately through
[GitHub security advisories](https://github.com/mrluisfer/seo-generator/security/advisories/new)
rather than a public issue. Include what you did, what happened, and the impact
you think it has. Expect a first reply within a week.

## What this app handles

**API keys.** Anthropic and OpenAI keys are stored in the browser's
`localStorage` and sent with each generation request to `POST /api/generate`,
which exists only so the browser does not have to make a cross-origin call the
providers reject. The route uses the key once per request and never writes it to
a log, a session, or disk. It is not stored server-side at any point.

Two consequences worth stating plainly:

- Anyone with access to the browser profile can read the key. That is the
  trade-off of a keyless, accountless tool.
- If you deploy this yourself, the keys of everyone using your instance pass
  through your server in memory. Do not add request logging that captures
  bodies.

**Generated code.** Output is a string, not executed. Values are escaped for the
target's syntax at two layers — see the escaping section of
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). A `</script>` that survives into a
generated file is a security bug, not a cosmetic one; report it as such.

**Uploaded images** never leave the browser. They become an object URL used for
the preview only and are never sent anywhere or written into the exported
metadata.

## Out of scope

- The document you edit is yours; it is stored unencrypted in `localStorage`.
- `GET /api/github` returns public repository counts and takes no input.
- Anything requiring an attacker to already control the user's browser profile
  or machine.

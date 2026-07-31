import { describe, expect, it } from 'vitest';
import { TARGETS } from './emit';
import { buildJsonLd, robotsContent } from './build';
import { resolveOg, resolveTitle, resolveTwitter } from './defaults';
import { balanced, decodeEntities, evalLiteral, hostileDocument } from './test-fixtures';

/**
 * Emitting valid syntax is not the same as emitting the right data. These tests
 * parse the metadata back OUT of each generated file and compare it to the
 * document it came from — the check a consumer of the output actually cares about.
 */

const doc = hostileDocument();
const expected = buildJsonLd(doc)!;
const emit = (id: string) => TARGETS.find((t) => t.id === id)!.emit(doc);

describe('JSON-LD survives the trip into each target', () => {
	it('html — literal JSON with escaped angle brackets', () => {
		const code = emit('html');
		const open = '<script type="application/ld+json">';
		const body = code.slice(code.indexOf(open) + open.length, code.lastIndexOf('</script>'));
		expect(JSON.parse(body)).toEqual(expected);
	});

	it.each([
		['sveltekit', 'const jsonLd = '],
		['astro', 'const jsonLd = '],
		['next-metadata', 'const jsonLd = '],
		['nuxt', 'JSON.stringify(']
	])('%s — evaluated JavaScript literal', (id, marker) => {
		const code = emit(id);
		const at = code.indexOf(marker);
		expect(at, `no JSON-LD block in ${id}`).toBeGreaterThan(-1);
		expect(evalLiteral(balanced(code, at))).toEqual(expected);
	});

	it('react-helmet — a JS string literal holding JSON', () => {
		const code = emit('react-helmet');
		// Anchor past the script tag: the <title> line is also a {"…"} expression.
		const after = code.slice(code.indexOf('application/ld+json'));
		const match = after.match(/\{("(?:[^"\\]|\\.)*")\}/s);
		expect(match, 'no JSON-LD string found').not.toBeNull();
		expect(JSON.parse(evalLiteral(match![1]) as string)).toEqual(expected);
	});

	it('remix — the object inlined in the meta array', () => {
		const code = emit('remix');
		const at = code.indexOf("'script:ld+json'");
		expect(evalLiteral(balanced(code, at + 17))).toEqual(expected);
	});
});

describe('HTML meta tags decode back to the document', () => {
	const code = emit('html');
	const og = resolveOg(doc);
	const tw = resolveTwitter(doc);

	const metas: Record<string, string> = {};
	for (const m of code.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)" \/>/g)) {
		metas[m[1]] = decodeEntities(m[2]);
	}
	const links: Record<string, string> = {};
	for (const m of code.matchAll(/<link rel="([^"]+)"(?: hreflang="([^"]+)")? href="([^"]+)"/g)) {
		links[m[2] ? `${m[1]}:${m[2]}` : m[1]] = decodeEntities(m[3]);
	}

	it('title', () => {
		expect(decodeEntities(code.match(/<title>(.*)<\/title>/)![1])).toBe(resolveTitle(doc));
	});

	it.each([
		['description', () => doc.description],
		['robots', () => robotsContent(doc)],
		['og:title', () => og.title],
		['og:description', () => og.description],
		['og:image', () => og.image],
		['twitter:card', () => tw.card],
		['twitter:description', () => tw.description]
	])('%s', (key, want) => {
		expect(metas[key]).toBe(want());
	});

	it('canonical and every hreflang alternate', () => {
		expect(links.canonical).toBe(doc.canonical);
		for (const alt of doc.alternates) {
			expect(links[`alternate:${alt.hreflang}`]).toBe(alt.href);
		}
	});

	it('preserves quotes, ampersands and angle brackets in the description', () => {
		expect(metas.description).toContain('<script>');
		expect(metas.description).toContain('"usage metering"');
		expect(metas.description).toContain('&');
	});
});

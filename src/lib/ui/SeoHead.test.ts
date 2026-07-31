import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import SeoHead from './SeoHead.svelte';
import { homeDocument } from '$lib/seo/site';
import { hostileDocument, POISON } from '$lib/seo/test-fixtures';

/**
 * This component injects a script tag as raw html, which is the one place in the
 * app where a single stray backslash produces a tag that never closes and
 * silently swallows the rest of the head. It shipped that way once. These tests
 * assert the rendered output, not the source, so no amount of reformatting can
 * reintroduce it unnoticed.
 */

function renderHead(doc: ReturnType<typeof homeDocument>): string {
	return render(SeoHead, { props: { doc } }).head;
}

describe('the JSON-LD block', () => {
	it('opens and closes exactly once', () => {
		const head = renderHead(homeDocument());
		expect(head.match(/<script type="application\/ld\+json">/g)).toHaveLength(1);
		expect(head.match(/<\/script>/g)).toHaveLength(1);
	});

	it('never emits an escaped closing tag', () => {
		// `<\/script>` in the output is text, not a tag: the element stays open.
		expect(renderHead(homeDocument())).not.toContain('<\\/script>');
	});

	it('parses as JSON', () => {
		const head = renderHead(homeDocument());
		const body = head.slice(
			head.indexOf('application/ld+json">') + 'application/ld+json">'.length,
			head.lastIndexOf('</script>')
		);
		expect(() => JSON.parse(body)).not.toThrow();
		expect(JSON.parse(body)).toHaveProperty('@context', 'https://schema.org');
	});

	it('escapes an angle bracket in the data rather than replacing it with itself', () => {
		const doc = hostileDocument();
		doc.canonical = 'https://example.com/';
		const head = renderHead(doc);

		// The poison string survives as data...
		const body = head.slice(
			head.indexOf('application/ld+json">') + 'application/ld+json">'.length,
			head.lastIndexOf('</script>')
		);
		expect(JSON.stringify(JSON.parse(body))).toContain(POISON);

		// ...but its closing tag never reaches the markup verbatim.
		expect(head).not.toContain('</script> HOSTILE');
		expect(body).toContain('\\u003c');
	});
});

describe('the rest of the head', () => {
	it('renders the title, canonical and social tags', () => {
		const head = renderHead(homeDocument());
		expect(head).toContain('<title>');
		expect(head).toContain('rel="canonical"');
		expect(head).toContain('property="og:image"');
		expect(head).toContain('name="twitter:card"');
	});

	it('emits nothing for a document with no structured data', () => {
		const doc = homeDocument();
		doc.structuredData = [];
		expect(renderHead(doc)).not.toContain('application/ld+json');
	});
});

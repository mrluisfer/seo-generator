import { describe, expect, it } from 'vitest';
import { audit } from './lint';
import { buildJsonLd, buildTags } from './build';
import { aboutDocument, FAQ, homeDocument, ROUTES, SITE_URL } from './site';

/**
 * This site is held to the standard it sells. If a change to the tool's own
 * metadata would earn a finding in the editor, the build fails here — the same
 * outcome a user gets, applied to us.
 */

const documents = {
	home: homeDocument(),
	about: aboutDocument()
};

describe.each(Object.entries(documents))('%s', (name, doc) => {
	it('passes every check the editor runs on a user page', () => {
		const report = audit(doc);
		expect(
			report.findings.map((f) => `${f.severity}: ${f.message}`),
			`the ${name} page would show findings in its own editor`
		).toEqual([]);
		expect(report.score).toBe(100);
	});

	it('is indexable', () => {
		// The app carried `noindex` in its layout until this was written. It is the
		// cheapest mistake to make and the most expensive to leave in place.
		const robots = buildTags(doc).find((t) => t.kind === 'meta' && t.attrs.name === 'robots');
		expect(robots?.kind === 'meta' && robots.attrs.content).toContain('index');
		expect(robots?.kind === 'meta' && robots.attrs.content).not.toContain('noindex');
	});

	it('has an absolute canonical on this origin', () => {
		expect(doc.canonical.startsWith(`${SITE_URL}/`)).toBe(true);
	});

	it('carries an absolute social image with alt text', () => {
		expect(doc.og.image.startsWith('https://')).toBe(true);
		expect(doc.og.imageAlt.trim()).not.toBe('');
	});

	it('emits structured data', () => {
		expect(buildJsonLd(doc)).not.toBeNull();
	});
});

describe('the FAQ', () => {
	it('is only marked up on the page that shows the answers', () => {
		// Structured data has to describe what a visitor can read. The home page is
		// a tool with no prose, so it must not claim an FAQ.
		const types = (doc: typeof documents.home) => doc.structuredData.map((e) => e.type);
		expect(types(documents.home)).not.toContain('FAQPage');
		expect(types(documents.about)).toContain('FAQPage');
	});

	it('has an answer for every question', () => {
		expect(FAQ.length).toBeGreaterThanOrEqual(3);
		for (const item of FAQ) {
			expect(item.question.trim().endsWith('?')).toBe(true);
			expect(item.answer.trim().length).toBeGreaterThan(40);
		}
	});
});

describe('the sitemap route list', () => {
	it('covers every document defined here', () => {
		const paths = ROUTES.map((r) => r.path);
		for (const doc of Object.values(documents)) {
			const path = doc.canonical.slice(SITE_URL.length);
			expect(paths, `${path} is missing from ROUTES`).toContain(path);
		}
	});

	it('has no duplicate paths', () => {
		const paths = ROUTES.map((r) => r.path);
		expect(new Set(paths).size).toBe(paths.length);
	});
});

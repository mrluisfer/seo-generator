import { describe, expect, it } from 'vitest';
import { audit } from './lint';
import { emptyDocument, sampleDocument } from './defaults';
import { schemaEntry } from './test-fixtures';

/**
 * The contract of this list is that every entry is actionable: it names the one
 * field that clears it, and filling that field makes it go away. A finding that
 * cannot be resolved is noise in a panel people read as a to-do list.
 */

describe('the findings contract', () => {
	const documents = {
		empty: emptyDocument(),
		sample: sampleDocument(),
		'noindex article with a duplicate hreflang': (() => {
			const doc = sampleDocument();
			doc.og.type = 'article';
			doc.robots.index = false;
			doc.og.imageWidth = '800';
			doc.og.imageHeight = '800';
			doc.alternates = [
				{ id: 'a', hreflang: 'es', href: 'https://x.dev/a' },
				{ id: 'b', hreflang: 'es', href: 'https://x.dev/b' }
			];
			doc.structuredData = [schemaEntry('Product', {})];
			return doc;
		})()
	};

	it.each(Object.entries(documents))('%s — every finding names a field', (_name, doc) => {
		for (const finding of audit(doc).findings) {
			expect(finding.field, `"${finding.message}" has no field to focus`).toBeTruthy();
		}
	});

	it.each(Object.entries(documents))('%s — every finding names a section', (_name, doc) => {
		const sections = ['core', 'indexing', 'social', 'structured', 'site'];
		for (const finding of audit(doc).findings) {
			expect(sections).toContain(finding.section);
		}
	});

	it.each(Object.entries(documents))('%s — finding ids are unique', (_name, doc) => {
		const ids = audit(doc).findings.map((f) => f.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe('the sample document', () => {
	it('passes every check, so "sample" demonstrates a finished page', () => {
		const report = audit(sampleDocument());
		expect(report.findings).toEqual([]);
		expect(report.score).toBe(100);
	});
});

describe('findings clear when the field is filled', () => {
	it('a missing title', () => {
		const doc = emptyDocument();
		expect(audit(doc).findings.map((f) => f.id)).toContain('title-missing');
		doc.title = 'Pricing for growing engineering teams';
		expect(audit(doc).findings.map((f) => f.id)).not.toContain('title-missing');
	});

	it('a relative canonical', () => {
		const doc = sampleDocument();
		doc.canonical = '/pricing';
		expect(audit(doc).findings.map((f) => f.id)).toContain('canonical-relative');
		doc.canonical = 'https://northbound.dev/pricing';
		expect(audit(doc).findings.map((f) => f.id)).not.toContain('canonical-relative');
	});

	it('too many keywords', () => {
		const doc = sampleDocument();
		doc.keywords = Array.from({ length: 14 }, (_, i) => `term${i}`);
		expect(audit(doc).findings.map((f) => f.id)).toContain('keywords-excessive');
		doc.keywords = doc.keywords.slice(0, 4);
		expect(audit(doc).findings.map((f) => f.id)).not.toContain('keywords-excessive');
	});

	it('an empty structured-data block', () => {
		const doc = sampleDocument();
		const empty = schemaEntry('Product', {});
		doc.structuredData = [...doc.structuredData, empty];
		expect(audit(doc).findings.map((f) => f.id)).toContain(`schema-empty-${empty.id}`);
		empty.data.name = 'Northbound Team';
		expect(audit(doc).findings.map((f) => f.id)).not.toContain(`schema-empty-${empty.id}`);
	});
});

describe('adding keywords is not itself a finding', () => {
	// A note that fires *because* you filled a field can never be resolved, and
	// it sat in the panel telling people to fix something un-fixable.
	it('stays silent for a reasonable list', () => {
		const doc = sampleDocument();
		doc.keywords = ['pricing', 'per-seat billing', 'team plan', 'saas', 'billing'];
		expect(audit(doc).findings).toEqual([]);
	});
});

describe('scoring', () => {
	it('weights a blocking error above a note', () => {
		const withError = emptyDocument();
		const withNote = sampleDocument();
		withNote.canonical = 'https://northbound.dev/pricing?ref=nav';
		expect(audit(withError).score).toBeLessThan(audit(withNote).score);
	});

	it('never leaves the 0–100 range', () => {
		const doc = emptyDocument();
		doc.og.image = 'not-a-url';
		doc.canonical = 'also-not-a-url';
		const { score } = audit(doc);
		expect(score).toBeGreaterThanOrEqual(0);
		expect(score).toBeLessThanOrEqual(100);
	});
});

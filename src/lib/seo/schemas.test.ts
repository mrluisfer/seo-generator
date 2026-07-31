import { describe, expect, it } from 'vitest';
import { SCHEMA_REGISTRY, getSchemaDef, initialSchemaData } from './schemas';
import { buildJsonLd } from './build';
import { emptyDocument } from './defaults';
import { schemaEntry } from './test-fixtures';

/**
 * The registry is the extension point: adding a schema type means adding one
 * object to it. These tests describe what a new entry has to satisfy, so a
 * contributor finds out from the suite rather than from a review comment.
 */

describe('every registry entry', () => {
	it.each(SCHEMA_REGISTRY.map((d) => [d.type, d] as const))(
		'%s has a label and a summary',
		(_t, def) => {
			expect(def.label.trim()).not.toBe('');
			expect(def.summary.trim()).not.toBe('');
		}
	);

	it.each(SCHEMA_REGISTRY.map((d) => [d.type, d] as const))(
		'%s has unique field keys',
		(_t, def) => {
			const keys = def.fields.map((f) => f.key);
			expect(new Set(keys).size).toBe(keys.length);
		}
	);

	it.each(SCHEMA_REGISTRY.map((d) => [d.type, d] as const))(
		'%s declares sub-fields for every group',
		(_t, def) => {
			for (const field of def.fields) {
				if (field.kind === 'group') expect(field.fields?.length).toBeGreaterThan(0);
			}
		}
	);

	it.each(SCHEMA_REGISTRY.map((d) => [d.type, d] as const))(
		'%s builds nothing from empty input, so blank blocks never reach the output',
		(_t, def) => {
			expect(def.build(initialSchemaData(def))).toBeNull();
		}
	);

	it.each(SCHEMA_REGISTRY.map((d) => [d.type, d] as const))(
		'%s stamps its own @type when it builds',
		(_t, def) => {
			const filled: Record<string, unknown> = { ...initialSchemaData(def) };
			for (const field of def.fields) {
				if (field.kind === 'group') {
					filled[field.key] = [
						Object.fromEntries((field.fields ?? []).map((sub) => [sub.key, 'value']))
					];
				} else if (field.kind === 'tags') {
					filled[field.key] = ['value'];
				} else {
					filled[field.key] = 'value';
				}
			}
			expect(def.build(filled)).toHaveProperty('@type', def.type);
		}
	);
});

describe('shape rules Google actually enforces', () => {
	it('BreadcrumbList omits `item` on the final crumb', () => {
		const node = getSchemaDef('BreadcrumbList')!.build({
			items: [
				{ name: 'Home', url: 'https://x.dev' },
				{ name: 'Pricing', url: 'https://x.dev/pricing' }
			]
		}) as { itemListElement: Record<string, unknown>[] };

		expect(node.itemListElement[0]).toHaveProperty('item');
		expect(node.itemListElement.at(-1)).not.toHaveProperty('item');
		expect(node.itemListElement.map((i) => i.position)).toEqual([1, 2]);
	});

	it('WebSite emits a SearchAction only for a template with the placeholder', () => {
		const def = getSchemaDef('WebSite')!;
		expect(
			def.build({ name: 'X', url: 'https://x.dev', searchUrl: 'https://x.dev/search' })
		).not.toHaveProperty('potentialAction');
		expect(
			def.build({
				name: 'X',
				url: 'https://x.dev',
				searchUrl: 'https://x.dev/search?q={search_term_string}'
			})
		).toHaveProperty('potentialAction');
	});

	it('Product wraps availability in its schema.org URL exactly once', () => {
		const build = (availability: string) =>
			getSchemaDef('Product')!.build({ name: 'X', price: '1', availability }) as {
				offers: { availability: string };
			};
		expect(build('InStock').offers.availability).toBe('https://schema.org/InStock');
		expect(build('https://schema.org/InStock').offers.availability).toBe(
			'https://schema.org/InStock'
		);
	});
});

describe('buildJsonLd', () => {
	it('returns null when nothing is enabled', () => {
		expect(buildJsonLd(emptyDocument())).toBeNull();
	});

	it('emits a bare node for one entry and an @graph for several', () => {
		const doc = emptyDocument();
		doc.structuredData = [schemaEntry('Organization', { name: 'Northbound' })];
		expect(buildJsonLd(doc)).toHaveProperty('@type', 'Organization');

		doc.structuredData.push(schemaEntry('WebSite', { name: 'Northbound' }));
		const graph = buildJsonLd(doc) as { '@graph': unknown[] };
		expect(graph['@graph']).toHaveLength(2);
	});

	it('skips disabled entries', () => {
		const doc = emptyDocument();
		const entry = schemaEntry('Organization', { name: 'Northbound' });
		entry.enabled = false;
		doc.structuredData = [entry];
		expect(buildJsonLd(doc)).toBeNull();
	});
});

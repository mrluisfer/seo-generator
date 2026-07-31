import type { SeoDocument, StructuredDataEntry } from './types';
import { sampleDocument, uid } from './defaults';
import { getSchemaDef, initialSchemaData } from './schemas';

/**
 * Fixtures shared by the suite.
 *
 * Not imported by the app — Vite drops it from the bundle. It lives beside the
 * source so a change to the model breaks compilation here first.
 */

/** A raw `</script>` must never reach an emitted document unescaped. */
export const POISON = 'Close the tag </script> HOSTILE and keep going.';

export function schemaEntry(type: string, data: Record<string, unknown>): StructuredDataEntry {
	const def = getSchemaDef(type);
	if (!def) throw new Error(`unknown schema type: ${type}`);
	return { id: uid(), type, enabled: true, data: { ...initialSchemaData(def), ...data } };
}

/**
 * A document that exercises every escaping path at once: quotes, ampersands and
 * angle brackets in the description, and a literal `</script>` inside JSON-LD.
 */
export function hostileDocument(): SeoDocument {
	const doc = sampleDocument();
	doc.description = 'Flat per-seat pricing — no "usage metering" & no <script> surprises.';
	doc.structuredData = [
		schemaEntry('Organization', {
			name: 'Northbound',
			url: 'https://northbound.dev',
			sameAs: ['https://github.com/northbound', 'https://x.com/northbound']
		}),
		schemaEntry('WebSite', {
			name: 'Northbound',
			url: 'https://northbound.dev',
			searchUrl: 'https://northbound.dev/search?q={search_term_string}'
		}),
		schemaEntry('BreadcrumbList', {
			items: [
				{ name: 'Home', url: 'https://northbound.dev' },
				{ name: 'Pricing', url: 'https://northbound.dev/pricing' }
			]
		}),
		schemaEntry('FAQPage', {
			questions: [
				{ question: 'Is there a free trial?', answer: 'Yes — 14 days, no card required.' },
				{ question: 'Can I inject markup?', answer: POISON }
			]
		}),
		schemaEntry('Product', {
			name: 'Northbound Team',
			price: '29.00',
			priceCurrency: 'USD',
			availability: 'InStock',
			ratingValue: '4.6',
			reviewCount: '128'
		})
	];
	return doc;
}

/** Reads a balanced `{…}` starting at the first brace at or after `from`. */
export function balanced(src: string, from: number): string {
	const start = src.indexOf('{', from);
	if (start < 0) throw new Error('no object literal found');
	let depth = 0;
	let quote: string | null = null;
	for (let i = start; i < src.length; i++) {
		const char = src[i];
		if (quote) {
			if (char === '\\') i++;
			else if (char === quote) quote = null;
			continue;
		}
		if (char === "'" || char === '"' || char === '`') quote = char;
		else if (char === '{') depth++;
		else if (char === '}' && --depth === 0) return src.slice(start, i + 1);
	}
	throw new Error('unbalanced braces');
}

/** Evaluates an emitted JavaScript literal. Input is this project's own output. */
export function evalLiteral(code: string): unknown {
	return new Function(`return (${code});`)();
}

export function decodeEntities(value: string): string {
	return value
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}

import { browser } from '$app/environment';
import type { SeoDocument, StructuredDataEntry } from '$lib/seo/types';
import { emptyDocument, sampleDocument, uid } from '$lib/seo/defaults';
import { getSchemaDef, initialSchemaData } from '$lib/seo/schemas';
import { audit } from '$lib/seo/lint';
import type { AiDraft } from '$lib/ai/contract';

const STORAGE_KEY = 'seo-generator:document';

function load(): SeoDocument {
	if (!browser) return sampleDocument();
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		if (parsed && typeof parsed === 'object' && typeof parsed.title === 'string') {
			// Merge over a fresh default so documents saved by an older build stay loadable.
			const base = emptyDocument();
			return {
				...base,
				...parsed,
				robots: { ...base.robots, ...(parsed.robots ?? {}) },
				og: { ...base.og, ...(parsed.og ?? {}) },
				twitter: { ...base.twitter, ...(parsed.twitter ?? {}) },
				icons: { ...base.icons, ...(parsed.icons ?? {}) },
				verification: { ...base.verification, ...(parsed.verification ?? {}) },
				alternates: Array.isArray(parsed.alternates) ? parsed.alternates : [],
				structuredData: Array.isArray(parsed.structuredData) ? parsed.structuredData : [],
				keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
			};
		}
	} catch {
		// Fall through to the sample.
	}
	return sampleDocument();
}

class DocStore {
	doc = $state<SeoDocument>(load());

	audit = $derived(audit(this.doc));

	save() {
		if (!browser) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify(this.doc));
	}

	reset() {
		this.doc = emptyDocument();
		this.save();
	}

	loadSample() {
		this.doc = sampleDocument();
		this.save();
	}

	replace(next: SeoDocument) {
		this.doc = next;
		this.save();
	}

	// --- alternates ---

	addAlternate() {
		this.doc.alternates = [...this.doc.alternates, { id: uid(), hreflang: '', href: '' }];
	}

	removeAlternate(id: string) {
		this.doc.alternates = this.doc.alternates.filter((a) => a.id !== id);
	}

	// --- structured data ---

	addSchema(type: string) {
		const def = getSchemaDef(type);
		if (!def) return;
		const entry: StructuredDataEntry = {
			id: uid(),
			type,
			enabled: true,
			data: initialSchemaData(def)
		};
		this.doc.structuredData = [...this.doc.structuredData, entry];
	}

	removeSchema(id: string) {
		this.doc.structuredData = this.doc.structuredData.filter((e) => e.id !== id);
	}

	/**
	 * Applies the fields the user picked from an AI draft.
	 *
	 * Returns whether structured data changed so the caller can reveal that
	 * section — the store stays out of view state, which is what lets the
	 * dialogs live in the layout.
	 */
	applyDraft(draft: AiDraft, fields: Set<string>): { touchedStructuredData: boolean } {
		if (fields.has('title')) this.doc.title = draft.title;
		if (fields.has('description')) this.doc.description = draft.description;
		if (fields.has('keywords')) this.doc.keywords = draft.keywords;
		if (fields.has('ogTitle')) this.doc.og.title = draft.ogTitle;
		if (fields.has('ogDescription')) this.doc.og.description = draft.ogDescription;
		if (fields.has('ogImageAlt')) this.doc.og.imageAlt = draft.ogImageAlt;
		if (fields.has('twitterTitle')) this.doc.twitter.title = draft.twitterTitle;
		if (fields.has('twitterDescription')) this.doc.twitter.description = draft.twitterDescription;

		if (!fields.has('faq') || !draft.faq.length) return { touchedStructuredData: false };

		const def = getSchemaDef('FAQPage');
		if (!def) return { touchedStructuredData: false };

		const existing = this.doc.structuredData.find((e) => e.type === 'FAQPage');
		if (existing) {
			existing.data.questions = draft.faq;
			existing.enabled = true;
		} else {
			this.doc.structuredData = [
				...this.doc.structuredData,
				{
					id: uid(),
					type: 'FAQPage',
					enabled: true,
					data: { ...initialSchemaData(def), questions: draft.faq }
				}
			];
		}
		return { touchedStructuredData: true };
	}
}

export const store = new DocStore();

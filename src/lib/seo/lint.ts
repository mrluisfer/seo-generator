import type { SeoDocument } from './types';
import { resolveOg, resolveTitle, resolveTwitter } from './defaults';
import { buildJsonLd } from './build';
import { fit, LIMITS } from './measure';

export type Severity = 'error' | 'warn' | 'info';

export type Finding = {
	id: string;
	severity: Severity;
	/** Which editor section to open when the finding is clicked. */
	section: string;
	/**
	 * DOM id of the control that resolves this finding. Clicking the finding
	 * focuses it, so every finding must name the one field that clears it —
	 * a finding with no such field does not belong in this list.
	 */
	field?: string;
	message: string;
	detail?: string;
};

export type Audit = {
	findings: Finding[];
	score: number;
};

const WEIGHT: Record<Severity, number> = { error: 12, warn: 5, info: 1 };

function isAbsoluteUrl(value: string): boolean {
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}

export function audit(doc: SeoDocument): Audit {
	const findings: Finding[] = [];
	const add = (f: Finding) => findings.push(f);

	const title = resolveTitle(doc);
	const og = resolveOg(doc);
	const tw = resolveTwitter(doc);

	// --- title ---
	if (!title.trim()) {
		add({
			id: 'title-missing',
			severity: 'error',
			section: 'core',
			field: 'f-title',
			message: 'No title',
			detail: 'The title is the strongest on-page signal and the clickable line in results.'
		});
	} else {
		const f = fit(title, LIMITS.title);
		if (f.overflows) {
			add({
				id: 'title-long',
				severity: 'warn',
				section: 'core',
				field: 'f-title',
				message: 'Title is cut off in results',
				detail: `${f.px}px against a ${f.maxPx}px limit. Renders as "${f.truncated}"`
			});
		}
		if (title.trim().length < 25) {
			add({
				id: 'title-short',
				severity: 'warn',
				section: 'core',
				field: 'f-title',
				message: 'Title is very short',
				detail: 'Under 25 characters usually means unused room for a qualifier or the brand.'
			});
		}
	}

	// --- description ---
	if (!doc.description.trim()) {
		add({
			id: 'description-missing',
			severity: 'error',
			section: 'core',
			field: 'f-description',
			message: 'No description',
			detail: 'Without one, search engines pull an arbitrary sentence from the page.'
		});
	} else {
		const f = fit(doc.description, LIMITS.description);
		if (f.overflows) {
			add({
				id: 'description-long',
				severity: 'warn',
				section: 'core',
				field: 'f-description',
				message: 'Description is cut off in results',
				detail: `${f.px}px against a ${f.maxPx}px limit. Renders as "${f.truncated}"`
			});
		}
		if (doc.description.trim().length < 70) {
			add({
				id: 'description-short',
				severity: 'info',
				section: 'core',
				field: 'f-description',
				message: 'Description is under 70 characters',
				detail: 'There is room for a second clause naming the benefit or the audience.'
			});
		}
		if (doc.description.trim() === title.trim()) {
			add({
				id: 'description-duplicate',
				severity: 'warn',
				section: 'core',
				field: 'f-description',
				message: 'Description repeats the title',
				detail: 'Two chances to say something, currently spent on one.'
			});
		}
	}

	// --- canonical ---
	if (!doc.canonical.trim()) {
		add({
			id: 'canonical-missing',
			severity: 'warn',
			section: 'core',
			field: 'f-canonical',
			message: 'No canonical URL',
			detail: 'Duplicate URLs (tracking params, trailing slashes) will split ranking signals.'
		});
	} else if (!isAbsoluteUrl(doc.canonical)) {
		add({
			id: 'canonical-relative',
			severity: 'error',
			section: 'core',
			field: 'f-canonical',
			message: 'Canonical URL is not absolute',
			detail: 'A canonical must include the scheme and host. Relative values are ignored.'
		});
	} else if (doc.canonical.includes('?')) {
		add({
			id: 'canonical-query',
			severity: 'info',
			section: 'core',
			field: 'f-canonical',
			message: 'Canonical URL has a query string',
			detail: 'Point at the clean URL unless the parameter genuinely changes the content.'
		});
	}

	if (!doc.lang.trim()) {
		add({
			id: 'lang-missing',
			severity: 'warn',
			section: 'core',
			field: 'f-lang',
			message: 'No language set',
			detail: 'Needed for the html lang attribute and for correct hreflang handling.'
		});
	}

	// Whether Google reads meta keywords is a property of the field, not a defect
	// in this document — it is stated on the field itself. What is worth flagging
	// is a list long enough to read as stuffing, because trimming it clears this.
	if (doc.keywords.length > 10) {
		add({
			id: 'keywords-excessive',
			severity: 'warn',
			section: 'core',
			field: 'f-keywords',
			message: `${doc.keywords.length} keywords is too many`,
			detail: 'Long lists read as stuffing to the engines that still parse this. Keep the best few.'
		});
	}

	if (!doc.robots.index) {
		add({
			id: 'noindex',
			severity: 'warn',
			section: 'indexing',
			field: 'f-robots-index',
			message: 'This page is set to noindex',
			detail: 'Intentional on staging and thank-you pages. Costly anywhere else.'
		});
	}

	// --- social ---
	if (!og.image.trim()) {
		add({
			id: 'og-image-missing',
			severity: 'warn',
			section: 'social',
			field: 'f-og-image',
			message: 'No social image',
			detail: 'Links shared without one render as a bare text row.'
		});
	} else {
		if (!isAbsoluteUrl(og.image)) {
			add({
				id: 'og-image-relative',
				severity: 'error',
				section: 'social',
				field: 'f-og-image',
				message: 'Social image URL is not absolute',
				detail:
					'Crawlers fetch this from their own servers, so a relative path resolves to nothing.'
			});
		}
		if (!og.imageAlt.trim()) {
			add({
				id: 'og-image-alt-missing',
				severity: 'info',
				section: 'social',
				field: 'f-og-image-alt',
				message: 'Social image has no alt text',
				detail: 'Screen readers announce the card image on some platforms.'
			});
		}
		const w = Number(og.imageWidth);
		const h = Number(og.imageHeight);
		if (w && h && Math.abs(w / h - 1.91) > 0.25) {
			add({
				id: 'og-image-ratio',
				severity: 'info',
				section: 'social',
				field: 'f-og-image-width',
				message: 'Social image is not 1.91:1',
				detail: `${w}×${h} will be letterboxed or cropped. 1200×630 is the safe size.`
			});
		}
	}

	if (tw.card === 'summary_large_image' && !tw.image.trim()) {
		add({
			id: 'twitter-card-mismatch',
			severity: 'warn',
			section: 'social',
			field: 'tw-card',
			message: 'Large-image card has no image',
			detail:
				'Without an image the card falls back to the summary layout. Add one or switch the card type.'
		});
	}

	if (og.type === 'article' && !og.publishedTime.trim()) {
		add({
			id: 'article-no-date',
			severity: 'info',
			section: 'social',
			field: 'f-og-published',
			message: 'Article has no published date',
			detail: 'Dates surface in results and in some social previews.'
		});
	}

	// --- alternates ---
	if (doc.alternates.length > 0) {
		const langs = doc.alternates.map((a) => a.hreflang.trim().toLowerCase());
		if (!langs.includes('x-default')) {
			add({
				id: 'hreflang-no-default',
				severity: 'info',
				section: 'indexing',
				field: 'f-alternates',
				message: 'No x-default alternate',
				detail: 'Tells search engines what to show for unmatched languages.'
			});
		}
		const dupes = langs.filter((l, i) => l && langs.indexOf(l) !== i);
		if (dupes.length) {
			add({
				id: 'hreflang-duplicate',
				severity: 'error',
				section: 'indexing',
				field: 'f-alternates',
				message: `Duplicate hreflang: ${[...new Set(dupes)].join(', ')}`,
				detail: 'Each language code may appear once. Duplicates invalidate the whole set.'
			});
		}
	}

	// --- structured data ---
	if (!buildJsonLd(doc)) {
		add({
			id: 'no-structured-data',
			severity: 'info',
			section: 'structured',
			field: 'f-add-schema',
			message: 'No structured data',
			detail: 'Breadcrumbs and Organization are the two with the widest payoff.'
		});
	}

	for (const entry of doc.structuredData) {
		if (!entry.enabled) continue;
		const hasContent = Object.values(entry.data ?? {}).some((value) =>
			Array.isArray(value)
				? value.some((row) =>
						typeof row === 'string'
							? row.trim()
							: Object.values(row ?? {}).some((cell) => String(cell ?? '').trim())
					)
				: String(value ?? '').trim()
		);
		if (hasContent) continue;
		add({
			id: `schema-empty-${entry.id}`,
			severity: 'warn',
			section: 'structured',
			field: `schema-${entry.id}`,
			message: `${entry.type} block is empty`,
			detail: 'It will be dropped from the output. Fill it in or remove it.'
		});
	}

	const penalty = findings.reduce((sum, f) => sum + WEIGHT[f.severity], 0);
	const score = Math.max(0, Math.min(100, 100 - penalty));

	return { findings, score };
}

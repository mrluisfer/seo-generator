import type { SeoDocument, StructuredDataEntry } from './types';
import { getSchemaDef, initialSchemaData } from './schemas';

export function uid(): string {
	return Math.random().toString(36).slice(2, 10);
}

export function emptyDocument(): SeoDocument {
	return {
		title: '',
		titleTemplate: '',
		description: '',
		canonical: '',
		siteName: '',
		lang: 'en',
		keywords: [],
		author: '',
		publisher: '',
		themeColor: '',
		colorScheme: '',
		viewport: 'width=device-width, initial-scale=1',
		charset: 'utf-8',
		referrer: '',
		robots: {
			index: true,
			follow: true,
			noarchive: false,
			nosnippet: false,
			noimageindex: false,
			notranslate: false,
			maxSnippet: null,
			maxImagePreview: 'large',
			maxVideoPreview: null,
			unavailableAfter: ''
		},
		alternates: [],
		og: {
			type: 'website',
			title: '',
			description: '',
			url: '',
			siteName: '',
			locale: '',
			image: '',
			imageAlt: '',
			imageWidth: '1200',
			imageHeight: '630',
			publishedTime: '',
			modifiedTime: '',
			author: '',
			section: '',
			tags: []
		},
		twitter: {
			card: 'summary_large_image',
			site: '',
			creator: '',
			title: '',
			description: '',
			image: '',
			imageAlt: ''
		},
		icons: {
			favicon: '',
			appleTouchIcon: '',
			manifest: '',
			maskIcon: '',
			maskIconColor: ''
		},
		verification: {
			google: '',
			bing: '',
			yandex: '',
			pinterest: '',
			facebook: ''
		},
		structuredData: []
	};
}

/** Seeds an entry with the registry's empty shape, then overlays real values. */
function schemaEntry(type: string, data: Record<string, unknown>): StructuredDataEntry {
	const def = getSchemaDef(type);
	return {
		id: uid(),
		type,
		enabled: true,
		data: { ...(def ? initialSchemaData(def) : {}), ...data }
	};
}

const SITE = 'https://northbound.dev';

/**
 * A complete, internally consistent document.
 *
 * Every field the editor exposes is filled, so "sample" doubles as a worked
 * example of what a finished page looks like — including four JSON-LD blocks,
 * which compile into an @graph and are the part hardest to write by hand. It is
 * tuned to pass every check: the copy lengths sit inside the pixel budgets and
 * the hreflang set carries its x-default.
 */
export function sampleDocument(): SeoDocument {
	const doc = emptyDocument();

	// --- core ---
	// 50 chars resolves to 472px of the 600px budget — enough for the gauge to
	// read "good", so the sample demonstrates a well-used title rather than a
	// merely valid one.
	doc.title = 'Pricing for growing engineering teams';
	doc.titleTemplate = '%s — Northbound';
	doc.description =
		'Flat per-seat pricing with no usage metering or overage bills. Compare the Team and Enterprise plans, or start a 14-day trial without a credit card.';
	doc.canonical = `${SITE}/pricing`;
	doc.siteName = 'Northbound';
	doc.lang = 'en';
	doc.keywords = ['pricing', 'per-seat billing', 'team plan', 'enterprise plan'];
	doc.author = 'Northbound';
	doc.publisher = 'Northbound';
	doc.themeColor = '#14161a';
	doc.colorScheme = 'light dark';
	doc.referrer = 'strict-origin-when-cross-origin';

	// --- indexing ---
	doc.robots.maxSnippet = -1;
	doc.robots.maxImagePreview = 'large';
	doc.robots.maxVideoPreview = -1;
	doc.alternates = [
		{ id: uid(), hreflang: 'en', href: `${SITE}/pricing` },
		{ id: uid(), hreflang: 'es-MX', href: `${SITE}/es/precios` },
		{ id: uid(), hreflang: 'x-default', href: `${SITE}/pricing` }
	];

	// --- social ---
	doc.og.type = 'website';
	doc.og.title = 'Northbound pricing';
	doc.og.description = 'Flat per-seat pricing. No usage metering, no overage bills.';
	doc.og.url = `${SITE}/pricing`;
	doc.og.siteName = 'Northbound';
	doc.og.locale = 'en_US';
	doc.og.image = `${SITE}/og/pricing.png`;
	doc.og.imageAlt = 'A pricing table comparing the Team and Enterprise plans';
	doc.og.imageWidth = '1200';
	doc.og.imageHeight = '630';

	doc.twitter.card = 'summary_large_image';
	doc.twitter.site = '@northbound';
	doc.twitter.creator = '@northbound';
	doc.twitter.title = 'Northbound pricing';
	doc.twitter.description = 'Per-seat, flat, and metered by nobody. 14-day trial, no card.';
	doc.twitter.image = `${SITE}/og/pricing.png`;
	doc.twitter.imageAlt = 'A pricing table comparing the Team and Enterprise plans';

	// --- site ---
	doc.icons.favicon = '/favicon.ico';
	doc.icons.appleTouchIcon = '/apple-touch-icon.png';
	doc.icons.manifest = '/site.webmanifest';
	doc.icons.maskIcon = '/mask-icon.svg';
	doc.icons.maskIconColor = '#14161a';

	// Obvious placeholders — these are meant to be swapped, not shipped.
	doc.verification.google = 'replace-with-your-search-console-token';
	doc.verification.bing = 'replace-with-your-bing-token';
	doc.verification.yandex = 'replace-with-your-yandex-token';
	doc.verification.pinterest = 'replace-with-your-pinterest-token';
	doc.verification.facebook = 'replace-with-your-facebook-token';

	// --- structured data ---
	doc.structuredData = [
		schemaEntry('Organization', {
			name: 'Northbound',
			url: SITE,
			logo: `${SITE}/logo-512.png`,
			description: 'Deployment tooling for small engineering teams.',
			email: 'hello@northbound.dev',
			telephone: '+52 55 1234 5678',
			sameAs: [
				'https://github.com/northbound',
				'https://x.com/northbound',
				'https://www.linkedin.com/company/northbound'
			],
			streetAddress: 'Av. Álvaro Obregón 106',
			addressLocality: 'Ciudad de México',
			addressRegion: 'CDMX',
			postalCode: '06700',
			addressCountry: 'MX'
		}),
		schemaEntry('WebSite', {
			name: 'Northbound',
			url: SITE,
			searchUrl: `${SITE}/search?q={search_term_string}`,
			inLanguage: 'en'
		}),
		schemaEntry('BreadcrumbList', {
			items: [
				{ name: 'Home', url: SITE },
				{ name: 'Pricing', url: `${SITE}/pricing` }
			]
		}),
		schemaEntry('FAQPage', {
			questions: [
				{
					question: 'Is there a free trial?',
					answer:
						'Yes. Every plan includes a 14-day trial, and no credit card is required to start one.'
				},
				{
					question: 'How is a seat counted?',
					answer:
						'A seat is any teammate who signs in during the billing month. Members who never sign in are not billed.'
				},
				{
					question: 'Can we change plans later?',
					answer:
						'Yes. Changes take effect on your next invoice and the difference is prorated automatically.'
				}
			]
		})
	];

	return doc;
}

/** The title as it actually renders, after the template is applied. */
export function resolveTitle(doc: SeoDocument): string {
	const t = doc.title.trim();
	const tpl = doc.titleTemplate.trim();
	if (!tpl) return t;
	if (!t) return tpl.replace('%s', '').replace(/^[\s\-–—|·:]+|[\s\-–—|·:]+$/g, '');
	return tpl.includes('%s') ? tpl.replace('%s', t) : `${t} ${tpl}`;
}

/** Social fields fall back to the core fields when left blank. */
export function resolveOg(doc: SeoDocument) {
	return {
		...doc.og,
		title: doc.og.title.trim() || resolveTitle(doc),
		description: doc.og.description.trim() || doc.description,
		url: doc.og.url.trim() || doc.canonical,
		siteName: doc.og.siteName.trim() || doc.siteName
	};
}

export function resolveTwitter(doc: SeoDocument) {
	const og = resolveOg(doc);
	return {
		...doc.twitter,
		title: doc.twitter.title.trim() || og.title,
		description: doc.twitter.description.trim() || og.description,
		image: doc.twitter.image.trim() || og.image,
		imageAlt: doc.twitter.imageAlt.trim() || og.imageAlt
	};
}

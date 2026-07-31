import type { SeoDocument } from './types';
import { emptyDocument, uid } from './defaults';
import { getSchemaDef, initialSchemaData } from './schemas';

/**
 * This site's own metadata, expressed as the same `SeoDocument` the editor
 * produces.
 *
 * Dogfooding is not the point — correctness is. Every rule the linter enforces
 * on a user's page applies here too, and `site.test.ts` fails the build if this
 * document would score anything below a clean sheet.
 */

/** Override at build time when deploying somewhere else. */
export const SITE_URL = 'https://seo-generator.vercel.app';

const AUTHOR = 'mrluisfer';
const REPO = 'https://github.com/mrluisfer/seo-generator';

function schema(type: string, data: Record<string, unknown>) {
	const def = getSchemaDef(type);
	if (!def) throw new Error(`unknown schema type: ${type}`);
	return { id: uid(), type, enabled: true, data: { ...initialSchemaData(def), ...data } };
}

function base(): SeoDocument {
	const doc = emptyDocument();
	doc.siteName = 'head';
	doc.titleTemplate = '%s — head';
	doc.lang = 'en';
	doc.author = AUTHOR;
	doc.publisher = AUTHOR;
	doc.themeColor = '#14161a';
	doc.colorScheme = 'light dark';
	doc.referrer = 'strict-origin-when-cross-origin';
	doc.robots.maxSnippet = -1;
	doc.robots.maxImagePreview = 'large';
	doc.robots.maxVideoPreview = -1;

	doc.og.siteName = 'head';
	doc.og.locale = 'en_US';
	doc.og.image = `${SITE_URL}/og.png`;
	doc.og.imageWidth = '1200';
	doc.og.imageHeight = '630';
	doc.twitter.card = 'summary_large_image';

	doc.icons.favicon = '/favicon.svg';
	return doc;
}

/**
 * The editor itself.
 *
 * No FAQPage here: that markup has to mirror questions a visitor can read on
 * the page, and this one is a tool, not prose. The FAQ lives on /about, where
 * the answers are actually visible — the same rule the editor states when you
 * add a structured-data block.
 */
export function homeDocument(): SeoDocument {
	const doc = base();
	doc.title = 'SEO metadata, Open Graph and JSON-LD editor';
	doc.description =
		'Write a page’s search and social metadata once, then export it as HTML, Next.js, SvelteKit, Astro or Nuxt code. Runs entirely in your browser.';
	doc.canonical = `${SITE_URL}/`;
	doc.keywords = ['seo metadata', 'open graph', 'json-ld', 'meta tags', 'structured data'];

	doc.og.title = 'head — SEO metadata, compiled';
	doc.og.description =
		'One document, nine framework targets. Measures titles in pixels the way search results actually truncate.';
	doc.og.url = `${SITE_URL}/`;
	doc.og.imageAlt = 'The head editor, showing a metadata form beside its generated HTML output';

	doc.structuredData = [
		schema('SoftwareApplication', {
			name: 'head',
			description:
				'A browser-based editor that turns a page’s facts into search and social metadata, and exports it as code for nine frameworks.',
			applicationCategory: 'DeveloperApplication',
			operatingSystem: 'Web',
			url: `${SITE_URL}/`,
			price: '0',
			priceCurrency: 'USD'
		}),
		schema('WebSite', {
			name: 'head',
			url: `${SITE_URL}/`,
			inLanguage: 'en'
		}),
		schema('Person', {
			name: AUTHOR,
			url: `https://github.com/${AUTHOR}`,
			sameAs: [`https://github.com/${AUTHOR}`]
		})
	];

	return doc;
}

/** Answers to the questions people ask before trying it. */
export const FAQ = [
	{
		question: 'Does my data leave the browser?',
		answer:
			'No. The document you edit is kept in your browser’s local storage and never uploaded. The one exception is the AI drafting feature: when you ask for a draft, the brief you wrote is sent to Anthropic or OpenAI using a key you supply, through a proxy that uses it once and never stores it.'
	},
	{
		question: 'Which frameworks can it export to?',
		answer:
			'HTML, Next.js as both a static metadata export and generateMetadata, SvelteKit, Astro, React Helmet, Nuxt, React Router, and raw JSON. Each target is written in that framework’s own idiom rather than the same HTML in a wrapper.'
	},
	{
		question: 'Do I need an account or an API key?',
		answer:
			'No account, ever. An API key is only needed for AI drafting, you supply your own, and every other feature works without one.'
	},
	{
		question: 'Why does it measure titles in pixels instead of characters?',
		answer:
			'Because search results truncate by rendered width. “WWWWW” and “iiiii” are the same character count and nowhere near the same width, so a character counter tells you very little. The gauge measures the string and shows the exact text that survives the cut.'
	},
	{
		question: 'Is it open source?',
		answer: `Yes, under the MIT license. The source is at ${REPO}, and adding a framework target is a single entry in one file.`
	}
];

export function aboutDocument(): SeoDocument {
	const doc = base();
	doc.title = 'How the metadata editor works';
	doc.description =
		'What head does, how it measures search-result truncation in pixels, what happens to your data, and how to add a framework target.';
	doc.canonical = `${SITE_URL}/about`;
	doc.keywords = ['seo tool', 'metadata generator', 'open source'];

	doc.og.title = 'How head works';
	doc.og.description =
		'How the editor works, what it does with your data, and why it measures titles in pixels.';
	doc.og.url = `${SITE_URL}/about`;
	doc.og.imageAlt = 'The head editor, showing a metadata form beside its generated HTML output';

	doc.structuredData = [
		schema('WebSite', { name: 'head', url: `${SITE_URL}/`, inLanguage: 'en' }),
		// Every one of these questions is answered in visible text on /about.
		schema('FAQPage', { questions: FAQ }),
		schema('Person', {
			name: AUTHOR,
			url: `https://github.com/${AUTHOR}`,
			sameAs: [`https://github.com/${AUTHOR}`]
		})
	];

	return doc;
}

/** Every indexable route, for the sitemap. */
export const ROUTES = [
	{ path: '/', priority: '1.0', changefreq: 'weekly' },
	{ path: '/about', priority: '0.6', changefreq: 'monthly' }
];

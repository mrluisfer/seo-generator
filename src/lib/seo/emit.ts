import type { SeoDocument } from './types';
import { buildJsonLd, buildTags, robotsContent, type HeadTag } from './build';
import { resolveOg, resolveTitle, resolveTwitter } from './defaults';
import { compact, printJs, printJson, raw } from './js-literal';

export type TargetId =
	| 'html'
	| 'next-metadata'
	| 'next-dynamic'
	| 'sveltekit'
	| 'astro'
	| 'react-helmet'
	| 'nuxt'
	| 'remix'
	| 'json';

export type Target = {
	id: TargetId;
	label: string;
	/** Shown next to the copy button so people know where the snippet goes. */
	filename: string;
	language: 'html' | 'ts' | 'tsx' | 'svelte' | 'astro' | 'json';
	note: string;
	emit: (doc: SeoDocument) => string;
};

// --- shared helpers ---------------------------------------------------------

function escapeAttr(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Prevents a `</script>` inside string data from closing the tag early. */
function escapeJsonLd(json: string): string {
	return json.replace(/</g, '\\u003c');
}

function indentBlock(text: string, prefix: string): string {
	return text
		.split('\n')
		.map((line) => (line ? prefix + line : line))
		.join('\n');
}

function originOf(url: string): string {
	try {
		return new URL(url).origin;
	} catch {
		return '';
	}
}

function parseViewport(viewport: string): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const part of viewport.split(',')) {
		const [k, v] = part.split('=').map((x) => x.trim());
		if (!k || !v) continue;
		if (k === 'width') out.width = v;
		else if (k === 'initial-scale') out.initialScale = Number(v);
		else if (k === 'maximum-scale') out.maximumScale = Number(v);
		else if (k === 'user-scalable') out.userScalable = v !== 'no';
	}
	return out;
}

function languageMap(doc: SeoDocument): Record<string, string> | undefined {
	const map: Record<string, string> = {};
	for (const alt of doc.alternates) {
		if (alt.hreflang.trim() && alt.href.trim()) map[alt.hreflang.trim()] = alt.href.trim();
	}
	return Object.keys(map).length ? map : undefined;
}

// --- HTML -------------------------------------------------------------------

function renderHtmlTag(tag: HeadTag, indent: string): string {
	switch (tag.kind) {
		case 'title':
			return `${indent}<title>${escapeAttr(tag.text)}</title>`;
		case 'meta':
		case 'link': {
			const attrs = Object.entries(tag.attrs)
				.map(([k, v]) => `${k}="${escapeAttr(v)}"`)
				.join(' ');
			return `${indent}<${tag.kind} ${attrs} />`;
		}
		case 'jsonld': {
			const json = escapeJsonLd(printJson(tag.json, '\t'));
			return [
				`${indent}<script type="application/ld+json">`,
				indentBlock(json, indent),
				`${indent}</script>`
			].join('\n');
		}
	}
}

function emitHtml(doc: SeoDocument): string {
	const tags = buildTags(doc);
	if (!tags.length) return '<!-- Nothing to emit yet. Start with a title and description. -->';
	return tags.map((t) => renderHtmlTag(t, '')).join('\n');
}

// --- Next.js ----------------------------------------------------------------

function nextMetadataObject(doc: SeoDocument) {
	const og = resolveOg(doc);
	const tw = resolveTwitter(doc);
	const r = doc.robots;
	const base = originOf(doc.canonical) || originOf(og.url);

	const googleBot = compact({
		index: r.index,
		follow: r.follow,
		'max-image-preview': r.maxImagePreview ?? undefined,
		'max-snippet': r.maxSnippet ?? undefined,
		'max-video-preview': r.maxVideoPreview ?? undefined
	});

	return compact({
		metadataBase: base ? raw(`new URL('${base}')`) : undefined,
		title: resolveTitle(doc),
		description: doc.description,
		keywords: doc.keywords,
		authors: doc.author.trim() ? [{ name: doc.author.trim() }] : undefined,
		publisher: doc.publisher,
		referrer: doc.referrer,
		alternates: compact({
			canonical: doc.canonical,
			languages: languageMap(doc)
		}),
		robots: {
			index: r.index,
			follow: r.follow,
			...(r.noarchive ? { noarchive: true } : {}),
			...(r.nosnippet ? { nosnippet: true } : {}),
			...(r.noimageindex ? { noimageindex: true } : {}),
			...(googleBot ? { googleBot } : {})
		},
		openGraph: compact({
			type: og.type,
			title: og.title,
			description: og.description,
			url: og.url,
			siteName: og.siteName,
			locale: og.locale,
			images: og.image.trim()
				? [
						compact({
							url: og.image,
							width: og.imageWidth ? Number(og.imageWidth) : undefined,
							height: og.imageHeight ? Number(og.imageHeight) : undefined,
							alt: og.imageAlt
						})
					]
				: undefined,
			...(og.type === 'article'
				? {
						publishedTime: og.publishedTime,
						modifiedTime: og.modifiedTime,
						authors: og.author.trim() ? [og.author.trim()] : undefined,
						section: og.section,
						tags: og.tags
					}
				: {})
		}),
		twitter: compact({
			card: tw.card,
			site: tw.site,
			creator: tw.creator,
			title: tw.title,
			description: tw.description,
			images: tw.image.trim() ? [tw.image] : undefined
		}),
		icons: compact({
			icon: doc.icons.favicon,
			apple: doc.icons.appleTouchIcon,
			other: doc.icons.maskIcon.trim()
				? [
						compact({
							rel: 'mask-icon',
							url: doc.icons.maskIcon,
							color: doc.icons.maskIconColor
						})
					]
				: undefined
		}),
		manifest: doc.icons.manifest,
		verification: compact({
			google: doc.verification.google,
			yandex: doc.verification.yandex,
			other: compact({
				'msvalidate.01': doc.verification.bing,
				'p:domain_verify': doc.verification.pinterest,
				'facebook-domain-verification': doc.verification.facebook
			})
		})
	});
}

function nextViewportObject(doc: SeoDocument) {
	return compact({
		...parseViewport(doc.viewport),
		themeColor: doc.themeColor,
		colorScheme: doc.colorScheme
	});
}

function nextJsonLdBlock(doc: SeoDocument): string {
	const jsonld = buildJsonLd(doc);
	if (!jsonld) return '';
	return [
		'',
		'// Render this inside the page component. Next.js does not put JSON-LD in `metadata`.',
		`const jsonLd = ${printJs(jsonld)};`,
		'',
		'export default function Page() {',
		'\treturn (',
		'\t\t<>',
		'\t\t\t<script',
		'\t\t\t\ttype="application/ld+json"',
		"\t\t\t\tdangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\\\u003c') }}",
		'\t\t\t/>',
		'\t\t\t{/* page content */}',
		'\t\t</>',
		'\t);',
		'}'
	].join('\n');
}

function emitNextMetadata(doc: SeoDocument): string {
	const metadata = nextMetadataObject(doc);
	const viewport = nextViewportObject(doc);
	const imports = ['Metadata'];
	if (viewport) imports.push('Viewport');

	const lines = [`import type { ${imports.join(', ')} } from 'next';`, ''];
	lines.push(`export const metadata: Metadata = ${printJs(metadata ?? {})};`);
	if (viewport) {
		lines.push('', `export const viewport: Viewport = ${printJs(viewport)};`);
	}
	const jsonld = nextJsonLdBlock(doc);
	if (jsonld) lines.push(jsonld);
	return lines.join('\n');
}

function emitNextDynamic(doc: SeoDocument): string {
	const metadata = nextMetadataObject(doc);
	const viewport = nextViewportObject(doc);
	const lines = [
		"import type { Metadata } from 'next';",
		'',
		'type Props = { params: Promise<{ slug: string }> };',
		'',
		'export async function generateMetadata({ params }: Props): Promise<Metadata> {',
		'\tconst { slug } = await params;',
		'\t// Fetch the record this page renders, then map it onto the fields below.',
		'\t// const page = await getPage(slug);',
		'',
		`\treturn ${indentBlock(printJs(metadata ?? {}), '\t').trimStart()};`,
		'}'
	];
	if (viewport) {
		lines.push('', "import type { Viewport } from 'next';");
		lines.push('', `export const viewport: Viewport = ${printJs(viewport)};`);
	}
	const jsonld = nextJsonLdBlock(doc);
	if (jsonld) lines.push(jsonld);
	return lines.join('\n');
}

// --- SvelteKit --------------------------------------------------------------

function emitSvelteKit(doc: SeoDocument): string {
	const tags = buildTags(doc, { includeDocumentTags: false });
	const jsonldTag = tags.find((t) => t.kind === 'jsonld');
	const headTags = tags.filter((t) => t.kind !== 'jsonld');

	const lines: string[] = [];
	if (jsonldTag && jsonldTag.kind === 'jsonld') {
		lines.push('<script lang="ts">');
		lines.push(`\tconst jsonLd = ${indentBlock(printJs(jsonldTag.json, 1), '').trimStart()};`);
		lines.push('</script>');
		lines.push('');
	}
	lines.push('<svelte:head>');
	for (const tag of headTags) lines.push(renderHtmlTag(tag, '\t'));
	if (jsonldTag) {
		lines.push('');
		lines.push('\t<!-- eslint-disable-next-line svelte/no-at-html-tags -->');
		lines.push(
			'\t{@html `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\\\u003c")}<\\/script>`}'
		);
	}
	lines.push('</svelte:head>');
	return lines.join('\n');
}

// --- Astro ------------------------------------------------------------------

function emitAstro(doc: SeoDocument): string {
	const tags = buildTags(doc, { includeDocumentTags: false });
	const jsonldTag = tags.find((t) => t.kind === 'jsonld');
	const headTags = tags.filter((t) => t.kind !== 'jsonld');

	const lines: string[] = ['---'];
	if (jsonldTag && jsonldTag.kind === 'jsonld') {
		lines.push(`const jsonLd = ${printJs(jsonldTag.json)};`);
	} else {
		lines.push('// No frontmatter needed for these tags.');
	}
	lines.push('---');
	lines.push('');
	for (const tag of headTags) lines.push(renderHtmlTag(tag, ''));
	if (jsonldTag) {
		lines.push('');
		lines.push(
			'<script type="application/ld+json" set:html={JSON.stringify(jsonLd).replace(/</g, "\\\\u003c")} />'
		);
	}
	return lines.join('\n');
}

// --- React Helmet -----------------------------------------------------------

function emitReactHelmet(doc: SeoDocument): string {
	const tags = buildTags(doc, { includeDocumentTags: false });
	const lines: string[] = [
		"import { Helmet } from 'react-helmet-async';",
		'',
		'export function Seo() {'
	];
	lines.push('\treturn (');
	lines.push('\t\t<Helmet>');
	for (const tag of tags) {
		if (tag.kind === 'title') {
			lines.push(`\t\t\t<title>{${JSON.stringify(tag.text)}}</title>`);
		} else if (tag.kind === 'meta' || tag.kind === 'link') {
			const attrs = Object.entries(tag.attrs)
				.map(([k, v]) => `${k === 'charset' ? 'charSet' : k}="${escapeAttr(v)}"`)
				.join(' ');
			lines.push(`\t\t\t<${tag.kind} ${attrs} />`);
		} else {
			// Helmet writes children into the script verbatim, so `<` is escaped here
			// rather than left to the renderer.
			const literal = JSON.stringify(JSON.stringify(tag.json)).replace(/</g, '\\\\u003c');
			lines.push('\t\t\t<script type="application/ld+json">');
			lines.push(`\t\t\t\t{${literal}}`);
			lines.push('\t\t\t</script>');
		}
	}
	lines.push('\t\t</Helmet>');
	lines.push('\t);');
	lines.push('}');
	return lines.join('\n');
}

// --- Nuxt -------------------------------------------------------------------

function emitNuxt(doc: SeoDocument): string {
	const tags = buildTags(doc, { includeDocumentTags: false });
	const title = tags.find((t) => t.kind === 'title');
	const metas: Record<string, unknown>[] = [];
	const links: Record<string, unknown>[] = [];
	const scripts: Record<string, unknown>[] = [];

	for (const tag of tags) {
		if (tag.kind === 'meta') metas.push({ ...tag.attrs });
		else if (tag.kind === 'link') links.push({ ...tag.attrs });
		else if (tag.kind === 'jsonld') {
			scripts.push({
				type: 'application/ld+json',
				innerHTML: raw(`JSON.stringify(${printJs(tag.json, 3)}).replace(/</g, '\\\\u003c')`)
			});
		}
	}

	const head = compact({
		title: title?.kind === 'title' ? title.text : undefined,
		htmlAttrs: doc.lang.trim() ? { lang: doc.lang.trim() } : undefined,
		meta: metas,
		link: links,
		script: scripts
	});

	return ['<script setup lang="ts">', `useHead(${printJs(head ?? {})});`, '</script>'].join('\n');
}

// --- Remix / React Router ---------------------------------------------------

function emitRemix(doc: SeoDocument): string {
	const tags = buildTags(doc, { includeDocumentTags: false });
	const entries: unknown[] = [];

	for (const tag of tags) {
		if (tag.kind === 'title') entries.push({ title: tag.text });
		else if (tag.kind === 'meta') entries.push({ ...tag.attrs });
		else if (tag.kind === 'link') entries.push({ tagName: 'link', ...tag.attrs });
		else if (tag.kind === 'jsonld') entries.push({ 'script:ld+json': tag.json });
	}

	return [
		"import type { MetaFunction } from 'react-router';",
		'',
		`export const meta: MetaFunction = () => ${printJs(entries)};`
	].join('\n');
}

// --- Raw model --------------------------------------------------------------

function emitJson(doc: SeoDocument): string {
	return JSON.stringify(doc, null, '\t');
}

// --- registry ---------------------------------------------------------------

export const TARGETS: Target[] = [
	{
		id: 'html',
		label: 'HTML',
		filename: 'index.html',
		language: 'html',
		note: 'Paste inside <head>. Works anywhere.',
		emit: emitHtml
	},
	{
		id: 'next-metadata',
		label: 'Next.js',
		filename: 'app/page.tsx',
		language: 'tsx',
		note: 'App Router Metadata API. Static export.',
		emit: emitNextMetadata
	},
	{
		id: 'next-dynamic',
		label: 'Next.js · dynamic',
		filename: 'app/[slug]/page.tsx',
		language: 'tsx',
		note: 'generateMetadata, for pages built from data.',
		emit: emitNextDynamic
	},
	{
		id: 'sveltekit',
		label: 'SvelteKit',
		filename: '+page.svelte',
		language: 'svelte',
		note: 'Drops into any route component.',
		emit: emitSvelteKit
	},
	{
		id: 'astro',
		label: 'Astro',
		filename: 'src/components/Seo.astro',
		language: 'astro',
		note: 'Render inside the layout <head>.',
		emit: emitAstro
	},
	{
		id: 'react-helmet',
		label: 'React Helmet',
		filename: 'Seo.tsx',
		language: 'tsx',
		note: 'For react-helmet-async.',
		emit: emitReactHelmet
	},
	{
		id: 'nuxt',
		label: 'Nuxt',
		filename: 'pages/index.vue',
		language: 'ts',
		note: 'useHead composable.',
		emit: emitNuxt
	},
	{
		id: 'remix',
		label: 'React Router',
		filename: 'routes/route.tsx',
		language: 'ts',
		note: 'meta export. Also works in Remix v2.',
		emit: emitRemix
	},
	{
		id: 'json',
		label: 'JSON',
		filename: 'seo.json',
		language: 'json',
		note: 'The raw model. Re-import it later.',
		emit: emitJson
	}
];

export function getTarget(id: TargetId): Target {
	return TARGETS.find((t) => t.id === id) ?? TARGETS[0];
}

export { robotsContent };

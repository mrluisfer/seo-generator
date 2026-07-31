import type { SeoDocument } from './types';
import { resolveOg, resolveTitle, resolveTwitter } from './defaults';
import { getSchemaDef } from './schemas';

/**
 * The intermediate representation every emitter consumes.
 *
 * A document is compiled to tags once, so each framework target only has to
 * decide how to *print* a tag — never how to derive one.
 */
export type HeadTag =
	| { kind: 'title'; text: string }
	| { kind: 'meta'; attrs: Record<string, string> }
	| { kind: 'link'; attrs: Record<string, string> }
	| { kind: 'jsonld'; json: unknown };

function meta(attrs: Record<string, string>): HeadTag {
	return { kind: 'meta', attrs };
}

function named(name: string, content: string): HeadTag | null {
	return content.trim() ? meta({ name, content: content.trim() }) : null;
}

function property(prop: string, content: string): HeadTag | null {
	return content.trim() ? meta({ property: prop, content: content.trim() }) : null;
}

function link(attrs: Record<string, string>): HeadTag | null {
	return attrs.href?.trim() ? { kind: 'link', attrs } : null;
}

export function robotsContent(doc: SeoDocument): string {
	const r = doc.robots;
	const parts: string[] = [r.index ? 'index' : 'noindex', r.follow ? 'follow' : 'nofollow'];
	if (r.noarchive) parts.push('noarchive');
	if (r.nosnippet) parts.push('nosnippet');
	if (r.noimageindex) parts.push('noimageindex');
	if (r.notranslate) parts.push('notranslate');
	if (r.maxSnippet !== null) parts.push(`max-snippet:${r.maxSnippet}`);
	if (r.maxImagePreview) parts.push(`max-image-preview:${r.maxImagePreview}`);
	if (r.maxVideoPreview !== null) parts.push(`max-video-preview:${r.maxVideoPreview}`);
	if (r.unavailableAfter.trim()) parts.push(`unavailable_after:${r.unavailableAfter.trim()}`);
	return parts.join(', ');
}

/** Builds the JSON-LD payload: a single node, or an @graph when there are several. */
export function buildJsonLd(doc: SeoDocument): Record<string, unknown> | null {
	const nodes: Record<string, unknown>[] = [];
	for (const entry of doc.structuredData) {
		if (!entry.enabled) continue;
		const def = getSchemaDef(entry.type);
		if (!def) continue;
		const node = def.build(entry.data ?? {});
		if (node) nodes.push(node);
	}
	if (!nodes.length) return null;
	if (nodes.length === 1) return { '@context': 'https://schema.org', ...nodes[0] };
	return { '@context': 'https://schema.org', '@graph': nodes };
}

export type BuildOptions = {
	/** Frameworks that manage charset and viewport themselves. */
	includeDocumentTags?: boolean;
};

export function buildTags(doc: SeoDocument, options: BuildOptions = {}): HeadTag[] {
	const { includeDocumentTags = true } = options;
	const og = resolveOg(doc);
	const tw = resolveTwitter(doc);
	const title = resolveTitle(doc);
	const tags: (HeadTag | null)[] = [];

	if (includeDocumentTags) {
		if (doc.charset.trim()) tags.push(meta({ charset: doc.charset.trim() }));
		if (doc.viewport.trim()) tags.push(named('viewport', doc.viewport));
	}

	if (title) tags.push({ kind: 'title', text: title });
	tags.push(named('description', doc.description));
	if (doc.keywords.length) tags.push(named('keywords', doc.keywords.join(', ')));
	tags.push(named('author', doc.author));
	tags.push(named('publisher', doc.publisher));
	tags.push(named('robots', robotsContent(doc)));
	tags.push(named('referrer', doc.referrer));
	tags.push(named('theme-color', doc.themeColor));
	tags.push(named('color-scheme', doc.colorScheme));
	tags.push(link({ rel: 'canonical', href: doc.canonical.trim() }));

	for (const alt of doc.alternates) {
		if (!alt.href.trim() || !alt.hreflang.trim()) continue;
		tags.push({
			kind: 'link',
			attrs: { rel: 'alternate', hreflang: alt.hreflang.trim(), href: alt.href.trim() }
		});
	}

	// Open Graph
	tags.push(property('og:type', og.type));
	tags.push(property('og:title', og.title));
	tags.push(property('og:description', og.description));
	tags.push(property('og:url', og.url));
	tags.push(property('og:site_name', og.siteName));
	tags.push(property('og:locale', og.locale));
	tags.push(property('og:image', og.image));
	if (og.image.trim()) {
		tags.push(property('og:image:alt', og.imageAlt));
		tags.push(property('og:image:width', og.imageWidth));
		tags.push(property('og:image:height', og.imageHeight));
	}
	if (og.type === 'article') {
		tags.push(property('article:published_time', og.publishedTime));
		tags.push(property('article:modified_time', og.modifiedTime));
		tags.push(property('article:author', og.author));
		tags.push(property('article:section', og.section));
		for (const tag of og.tags) tags.push(property('article:tag', tag));
	}

	// Twitter
	tags.push(named('twitter:card', tw.card));
	tags.push(named('twitter:site', tw.site));
	tags.push(named('twitter:creator', tw.creator));
	tags.push(named('twitter:title', tw.title));
	tags.push(named('twitter:description', tw.description));
	tags.push(named('twitter:image', tw.image));
	if (tw.image.trim()) tags.push(named('twitter:image:alt', tw.imageAlt));

	// Verification
	tags.push(named('google-site-verification', doc.verification.google));
	tags.push(named('msvalidate.01', doc.verification.bing));
	tags.push(named('yandex-verification', doc.verification.yandex));
	tags.push(named('p:domain_verify', doc.verification.pinterest));
	tags.push(named('facebook-domain-verification', doc.verification.facebook));

	// Icons
	tags.push(link({ rel: 'icon', href: doc.icons.favicon.trim() }));
	tags.push(link({ rel: 'apple-touch-icon', href: doc.icons.appleTouchIcon.trim() }));
	tags.push(link({ rel: 'manifest', href: doc.icons.manifest.trim() }));
	if (doc.icons.maskIcon.trim()) {
		tags.push({
			kind: 'link',
			attrs: {
				rel: 'mask-icon',
				href: doc.icons.maskIcon.trim(),
				...(doc.icons.maskIconColor.trim() ? { color: doc.icons.maskIconColor.trim() } : {})
			}
		});
	}

	const jsonld = buildJsonLd(doc);
	if (jsonld) tags.push({ kind: 'jsonld', json: jsonld });

	return tags.filter((t): t is HeadTag => t !== null);
}

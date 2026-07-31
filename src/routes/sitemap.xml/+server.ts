import type { RequestHandler } from '@sveltejs/kit';
import { ROUTES, SITE_URL } from '$lib/seo/site';

/**
 * Generated rather than static so a new route cannot be added without appearing
 * here — the route list lives beside the per-route metadata in `site.ts`.
 */
export const prerender = true;

export const GET: RequestHandler = async () => {
	const urls = ROUTES.map(
		({ path, priority, changefreq }) => `	<url>
		<loc>${SITE_URL}${path}</loc>
		<changefreq>${changefreq}</changefreq>
		<priority>${priority}</priority>
	</url>`
	).join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(xml, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};

import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { REPO_SLUG, type RepoStats } from '$lib/github';

/**
 * Repository stats, cached server-side.
 *
 * GitHub allows 60 unauthenticated requests per hour per IP. Fetching from the
 * browser would spend one of the *visitor's* 60 on every page load; fetching
 * here spends one of the *server's* 60 for every visitor combined — which is
 * only safe because of the two guards below:
 *
 *   1. A TTL cache, so the upstream sees at most one request per window no
 *      matter how much traffic arrives.
 *   2. Single-flight, so a burst of concurrent misses collapses into one
 *      upstream call instead of a thundering herd that would burn the quota.
 *
 * On upstream failure the last good value is served indefinitely rather than
 * dropped — stale counts beat no counts, and the footer must never break.
 */

const TTL_MS = 30 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 5000;

type Entry = { at: number; stars: number; forks: number };

let cache: Entry | null = null;
let inflight: Promise<Entry | null> | null = null;

async function fetchUpstream(): Promise<Entry | null> {
	const headers: Record<string, string> = {
		accept: 'application/vnd.github+json',
		// GitHub rejects requests without a User-Agent.
		'user-agent': 'seo-generator-footer',
		'x-github-api-version': '2022-11-28'
	};
	// Optional: a token raises the limit from 60/hour to 5000/hour.
	const token = env.GITHUB_TOKEN?.trim();
	if (token) headers.authorization = `Bearer ${token}`;

	const response = await fetch(`https://api.github.com/repos/${REPO_SLUG}`, {
		headers,
		signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
	});
	if (!response.ok) return null;

	const body = await response.json();
	const stars = Number(body?.stargazers_count);
	const forks = Number(body?.forks_count);
	if (!Number.isFinite(stars) || !Number.isFinite(forks)) return null;

	return { at: Date.now(), stars, forks };
}

async function load(): Promise<Entry | null> {
	const fresh = cache && Date.now() - cache.at < TTL_MS;
	if (fresh) return cache;

	// Collapse concurrent misses onto one upstream request.
	inflight ??= fetchUpstream()
		.catch(() => null)
		.then((entry) => {
			if (entry) cache = entry;
			inflight = null;
			return entry ?? cache;
		});

	return inflight;
}

export const GET: RequestHandler = async () => {
	const entry = await load();

	if (!entry) {
		// Nothing cached and the lookup failed. Let the client retry sooner.
		return json(
			{ error: 'unavailable' },
			{ status: 503, headers: { 'cache-control': 'no-store' } }
		);
	}

	const payload: RepoStats = {
		stars: entry.stars,
		forks: entry.forks,
		stale: Date.now() - entry.at >= TTL_MS
	};

	return json(payload, {
		headers: {
			// Browsers and any CDN in front absorb repeat views without reaching us.
			'cache-control': 'public, max-age=1800, stale-while-revalidate=86400'
		}
	});
};

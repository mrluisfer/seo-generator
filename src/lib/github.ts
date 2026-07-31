/**
 * Shared between the client footer and the server route.
 *
 * Kept out of `+server.ts` so the client never imports a module that also pulls
 * in `$env/dynamic/private` — `import type` erases today, but a later refactor
 * to a value import would leak server code into the browser bundle.
 */
export type RepoStats = {
	stars: number;
	forks: number;
	/** True when served from a cached value whose TTL has expired. */
	stale: boolean;
};

export const REPO_URL = 'https://github.com/mrluisfer/seo-generator';
export const REPO_SLUG = 'mrluisfer/seo-generator';

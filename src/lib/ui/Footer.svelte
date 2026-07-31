<script lang="ts">
	import Wordmark from './Wordmark.svelte';
	import { REPO_URL, type RepoStats } from '$lib/github';

	/**
	 * Grouped by what you'd reach for next, not by source. After copying the
	 * output the immediate question is "does it parse?", so validators come
	 * first and reference docs second.
	 */
	const GROUPS = [
		{
			label: 'Validate',
			links: [
				{ text: 'Rich results', href: 'https://search.google.com/test/rich-results' },
				{ text: 'Schema', href: 'https://validator.schema.org/' },
				{ text: 'Social preview', href: 'https://developers.facebook.com/tools/debug/' }
			]
		},
		{
			label: 'Reference',
			links: [
				{
					text: 'Search Central',
					href: 'https://developers.google.com/search/docs/appearance/snippet'
				},
				{ text: 'Open Graph', href: 'https://ogp.me/' },
				{ text: 'Schema.org', href: 'https://schema.org/docs/schemas.html' }
			]
		}
	];

	const SESSION_KEY = 'seo-generator:repo-stats';
	const SESSION_TTL = 30 * 60 * 1000;

	let stats = $state<RepoStats | null>(null);

	function readCache(): RepoStats | null {
		try {
			const raw = sessionStorage.getItem(SESSION_KEY);
			if (!raw) return null;
			const { at, data } = JSON.parse(raw);
			return Date.now() - at < SESSION_TTL ? (data as RepoStats) : null;
		} catch {
			return null;
		}
	}

	/*
		Fetched after paint, never during render: the counts are decoration on a
		tool that must be usable instantly. A session cache keeps repeated reloads
		— the common case while working — from touching the network at all.
	*/
	$effect(() => {
		let alive = true;

		const cached = readCache();
		if (cached) {
			stats = cached;
			return;
		}

		fetch('/api/github')
			.then((response) => (response.ok ? response.json() : null))
			.then((data: RepoStats | null) => {
				if (!alive || !data) return;
				stats = data;
				try {
					sessionStorage.setItem(SESSION_KEY, JSON.stringify({ at: Date.now(), data }));
				} catch {
					// Private mode or a full quota — the counts just won't persist.
				}
			})
			.catch(() => {
				// The footer works without counts.
			});

		return () => {
			alive = false;
		};
	});

	function compact(value: number): string {
		if (value < 1000) return String(value);
		const k = value / 1000;
		return `${k < 10 ? k.toFixed(1).replace(/\.0$/, '') : Math.round(k)}k`;
	}

	const statsLabel = $derived(
		stats ? `${stats.stars} stars and ${stats.forks} forks on GitHub` : 'GitHub repository'
	);
</script>

<footer class="footer">
	<Wordmark text="footer" tagline="navigate, learn" />

	<nav aria-label="Footer">
		{#each GROUPS as group (group.label)}
			<div class="group">
				<span class="eyebrow">{group.label}</span>
				<ul>
					{#each group.links as link (link.href)}
						<li>
							<!-- Every href is an absolute external URL from the constant above, so
							     these leave the app entirely and are not router navigations. -->
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href={link.href} target="_blank" rel="noreferrer noopener">{link.text}</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}

		<div class="group">
			<span class="eyebrow">Source</span>
			<ul>
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={REPO_URL} target="_blank" rel="noreferrer noopener" aria-label={statsLabel}>
						GitHub
						{#if stats}
							<span class="stats mono" aria-hidden="true">
								<span class="stat">
									<svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
										<path
											d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"
										/>
									</svg>{compact(stats.stars)}
								</span>
								<span class="stat">
									<svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
										<path
											d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"
										/>
									</svg>{compact(stats.forks)}
								</span>
							</span>
						{/if}
					</a>
				</li>
				<li>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href="{REPO_URL}/issues" target="_blank" rel="noreferrer noopener">Issues</a>
				</li>
			</ul>
		</div>
	</nav>

	<p class="note hint">Runs entirely in your browser.</p>
</footer>

<style>
	.footer {
		flex: none;
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px 26px;
		padding: 11px 18px;
		border-top: 1px solid var(--rule);
		background: var(--paper);
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 10px 22px;
		align-items: baseline;
	}

	.group {
		display: flex;
		align-items: baseline;
		gap: 9px;
	}

	ul {
		display: flex;
		align-items: baseline;
		gap: 10px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* A hairline between links reads quieter than a bullet or a slash. */
	li + li {
		border-left: 1px solid var(--rule);
		padding-left: 10px;
	}

	a {
		font-size: 12px;
		color: var(--ink-2);
		text-decoration: none;
		white-space: nowrap;
		border-bottom: 1px solid transparent;
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}

	a:hover {
		color: var(--ink);
		border-bottom-color: var(--rule-strong);
	}

	/* Counts sit inside the link so the whole thing is one target. */
	.stats {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-left: 7px;
		font-size: 10.5px;
		color: var(--ink-3);
	}

	.stat {
		display: inline-flex;
		align-items: center;
		gap: 3px;
	}

	.stat svg {
		translate: 0 -0.5px;
		opacity: 0.75;
	}

	a:hover .stats {
		color: var(--ink-2);
	}

	.note {
		margin: 0 0 0 auto;
		white-space: nowrap;
	}

	@media (max-width: 900px) {
		.note {
			margin-left: 0;
		}
	}

	@media (max-width: 620px) {
		.footer {
			gap: 10px 16px;
			padding: 12px 14px;
		}

		nav {
			gap: 8px 16px;
		}
	}
</style>

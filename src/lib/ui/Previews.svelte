<script lang="ts">
	import type { SeoDocument } from '$lib/seo/types';
	import { resolveOg, resolveTitle, resolveTwitter } from '$lib/seo/defaults';
	import { fit, LIMITS } from '$lib/seo/measure';
	import Chips from './Chips.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { prefs } from '$lib/state/prefs.svelte';

	type Props = { doc: SeoDocument };
	let { doc }: Props = $props();

	/**
	 * Each platform gets its own shape because each one really does lay the card
	 * out differently — that is the whole reason to switch between them. Only
	 * Slack takes a brand colour, for its link; everywhere else the difference is
	 * geometry, so the app's own palette holds.
	 */
	type PlatformId = 'x' | 'facebook' | 'linkedin' | 'slack' | 'whatsapp';

	const PLATFORMS = $derived<{ id: PlatformId; label: string }[]>([
		{ id: 'x', label: prefs.xName },
		{ id: 'facebook', label: prefs.metaName },
		{ id: 'linkedin', label: 'LinkedIn' },
		{ id: 'slack', label: 'Slack' },
		{ id: 'whatsapp', label: 'WhatsApp' }
	]);

	let platform = $state<PlatformId>('x');

	const instance = $props.id();
	const cardId = `social-card-${instance}`;

	const og = $derived(resolveOg(doc));
	const tw = $derived(resolveTwitter(doc));

	const serpTitle = $derived(fit(resolveTitle(doc) || 'Untitled page', LIMITS.title));
	const serpDesc = $derived(fit(doc.description || 'No description set.', LIMITS.description));

	/* X is the only platform that reads twitter:* — the rest read og:* only, so
	   a twitter-specific override shows up here and nowhere else. */
	const card = $derived(
		platform === 'x'
			? { title: tw.title, description: tw.description, image: tw.image, alt: tw.imageAlt }
			: { title: og.title, description: og.description, image: og.image, alt: og.imageAlt }
	);

	/* A locally chosen file wins in the preview so the user can see the crop
	   before uploading it anywhere, but it never reaches the emitted metadata. */
	const shownImage = $derived(ui.previewImage ?? card.image);

	/* A URL that 404s renders as a blank box, which reads as a broken app rather
	   than a broken link. Remembering which src failed — rather than a boolean —
	   means the state clears itself the moment the src changes. */
	let failedSrc = $state<string | null>(null);
	const imageFailed = $derived(!!shownImage && failedSrc === shownImage);

	/** Only X changes shape with twitter:card. */
	const compactImage = $derived(platform === 'x' && tw.card === 'summary');

	const breadcrumb = $derived.by(() => {
		try {
			const url = new URL(doc.canonical || og.url);
			return [url.host, ...url.pathname.split('/').filter(Boolean)].join(' › ');
		} catch {
			return doc.canonical || 'example.com';
		}
	});

	const host = $derived.by(() => {
		try {
			return new URL(og.url || doc.canonical).host;
		} catch {
			return doc.siteName || 'example.com';
		}
	});
</script>

<div class="previews">
	<figure class="preview">
		<figcaption class="eyebrow">Search result</figcaption>
		<div class="serp">
			<div class="serp-url">{breadcrumb}</div>
			<div class="serp-title">{serpTitle.truncated}</div>
			<div class="serp-desc">{serpDesc.truncated}</div>
		</div>
	</figure>

	<figure class="preview">
		<!-- The caption itself carries the picker so it stays a direct child of <figure>. -->
		<figcaption class="preview-head">
			<span class="eyebrow">Shared link</span>
			<Chips items={PLATFORMS} bind:value={platform} label="Preview platform" controls={cardId} />
		</figcaption>

		<div
			id={cardId}
			class="card"
			data-platform={platform}
			role="tabpanel"
			aria-label="{platform} preview"
		>
			<div
				class="thumb"
				class:is-compact={compactImage}
				class:is-empty={!shownImage || imageFailed}
			>
				{#if shownImage && !imageFailed}
					<img
						src={shownImage}
						alt={card.alt || ''}
						loading="lazy"
						onerror={() => (failedSrc = shownImage)}
					/>
					{#if ui.previewImage}
						<span class="local mono">local file</span>
					{/if}
				{:else if imageFailed}
					<span class="mono failed">image didn't load</span>
				{:else}
					<span class="mono">no image</span>
				{/if}
			</div>

			<div class="card-text">
				<div class="card-host mono">{host}</div>
				<div class="card-title">{card.title || 'Untitled page'}</div>
				{#if card.description}
					<div class="card-desc">{card.description}</div>
				{/if}
			</div>
		</div>
	</figure>
</div>

<style>
	.previews {
		display: grid;
		gap: 18px;
	}

	.preview {
		margin: 0;
		display: grid;
		gap: 8px;
	}

	.preview-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px 12px;
	}

	.serp {
		display: grid;
		gap: 3px;
		padding: 12px 13px;
		border: 1px solid var(--rule);
		border-radius: 4px;
		background: var(--paper-raised);
	}

	/* ---------- shared card scaffolding ---------- */

	.card {
		border: 1px solid var(--rule);
		overflow: hidden;
		background: var(--paper-raised);
	}

	.thumb {
		position: relative;
		background: var(--paper-sunk);
		aspect-ratio: 1.91 / 1;
		overflow: hidden;
	}

	/* Marks the image as not-yet-published, so a good-looking card is never
	   mistaken for a working og:image. */
	.local {
		position: absolute;
		left: 6px;
		bottom: 6px;
		font-size: 9.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--paper);
		background: color-mix(in srgb, var(--ink) 78%, transparent);
		border-radius: 2px;
		padding: 2px 5px;
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.thumb.is-empty {
		display: grid;
		place-items: center;
		color: var(--ink-3);
		font-size: 10.5px;
		letter-spacing: 0.08em;
	}

	/* A fetch failure is the user's problem to fix, so it is a warning, not a
	   neutral empty state. */
	.failed {
		color: var(--warn);
	}

	.card-text {
		display: grid;
		gap: 3px;
		padding: 10px 12px;
		min-width: 0;
	}

	.card-host {
		font-size: 10.5px;
		color: var(--ink-3);
		letter-spacing: 0.04em;
	}

	.card-title {
		font-size: 13.5px;
		font-weight: 500;
		color: var(--ink);
		line-height: 1.35;
	}

	.card-desc {
		font-size: 12.5px;
		color: var(--ink-2);
		line-height: 1.45;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* ---------- X ---------- */

	.card[data-platform='x'] {
		border-radius: 16px;
	}

	/* The summary card puts a square thumbnail beside the text instead of above. */
	.card[data-platform='x']:has(.is-compact) {
		display: flex;
		align-items: stretch;
	}

	.thumb.is-compact {
		aspect-ratio: 1 / 1;
		width: 128px;
		flex: none;
		border-right: 1px solid var(--rule);
	}

	.card[data-platform='x']:has(.is-compact) .card-text {
		flex: 1;
		min-width: 0;
		align-content: center;
	}

	.card[data-platform='x'] .card-host {
		order: 3;
	}

	/* ---------- Facebook ---------- */

	.card[data-platform='facebook'] {
		border-radius: 8px;
	}

	.card[data-platform='facebook'] .card-text {
		background: var(--paper-sunk);
		border-top: 1px solid var(--rule);
		padding: 10px 12px 11px;
	}

	.card[data-platform='facebook'] .card-host {
		text-transform: uppercase;
		font-size: 10px;
	}

	.card[data-platform='facebook'] .card-title {
		font-size: 15px;
		font-weight: 600;
	}

	.card[data-platform='facebook'] .card-desc {
		-webkit-line-clamp: 1;
		line-clamp: 1;
	}

	/* ---------- LinkedIn ---------- */

	.card[data-platform='linkedin'] {
		border-radius: 2px;
	}

	.card[data-platform='linkedin'] .card-title {
		font-size: 14px;
		font-weight: 600;
		order: 1;
	}

	/* LinkedIn drops the description entirely and shows the domain underneath. */
	.card[data-platform='linkedin'] .card-desc {
		display: none;
	}

	.card[data-platform='linkedin'] .card-host {
		order: 2;
		text-transform: none;
	}

	/* ---------- Slack ---------- */

	.card[data-platform='slack'] {
		display: flex;
		flex-direction: column-reverse;
		border: 0;
		border-left: 4px solid var(--rule-strong);
		border-radius: 0 4px 4px 0;
		padding-left: 12px;
		background: none;
		overflow: visible;
	}

	.card[data-platform='slack'] .thumb {
		max-width: 360px;
		border-radius: 8px;
		border: 1px solid var(--rule);
		margin-top: 8px;
	}

	.card[data-platform='slack'] .card-text {
		padding: 0;
	}

	.card[data-platform='slack'] .card-host {
		order: 0;
		font-family: var(--font-sans);
		font-size: 12.5px;
		font-weight: 600;
		color: var(--ink);
		letter-spacing: 0;
	}

	.card[data-platform='slack'] .card-title {
		/* Slack's link blue is the one piece of platform identity worth keeping. */
		color: light-dark(#1264a3, #4ea1e0);
		font-weight: 700;
		font-size: 13px;
	}

	/* ---------- WhatsApp ---------- */

	.card[data-platform='whatsapp'] {
		max-width: 330px;
		border-radius: 8px;
		background: var(--paper-sunk);
	}

	.card[data-platform='whatsapp'] .card-text {
		padding: 7px 9px 8px;
		gap: 2px;
	}

	.card[data-platform='whatsapp'] .card-title {
		font-size: 13px;
	}

	.card[data-platform='whatsapp'] .card-desc {
		font-size: 12px;
		-webkit-line-clamp: 1;
		line-clamp: 1;
	}

	.card[data-platform='whatsapp'] .card-host {
		order: 3;
		font-size: 10px;
	}
</style>

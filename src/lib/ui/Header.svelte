<script lang="ts">
	import Wordmark from './Wordmark.svelte';
	import { store } from '$lib/state/doc.svelte';
	import { theme } from '$lib/state/theme.svelte';
	import { ui } from '$lib/state/ui.svelte';

	const LEGACY_URL = 'https://seo-generator.vercel.app/';

	const report = $derived(store.audit);
	const scoreBand = $derived(report.score >= 85 ? 'good' : report.score >= 60 ? 'fair' : 'poor');
</script>

<header class="topbar">
	<!--
		Native popover: the top layer plus light dismiss (click-outside and Escape)
		come free, so this needs no outside-click listener of its own.
	-->
	<button
		class="brand-trigger"
		popovertarget="about-project"
		title="About this project"
		aria-label="About this project"
	>
		<Wordmark tagline="metadata, compiled and generate" />
	</button>

	<div popover id="about-project" class="about">
		<span class="eyebrow">Previously</span>
		<p class="about-name">Seo Generator</p>
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<a class="about-link mono" href={LEGACY_URL} target="_blank" rel="noreferrer noopener">
			seo-generator.vercel.app
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
		<p class="about-body">
			This tool replaces that project. Same goal — turn a handful of facts about a page into
			metadata you can ship — rebuilt around one document model that compiles to every framework.
		</p>
	</div>

	<div class="score" title="{report.findings.length} findings">
		<span class="score-value mono">{report.score}</span>
		<span class="score-label eyebrow">score</span>
		<div class="score-bar">
			<div class="score-fill" data-band={scoreBand} style:width="{report.score}%"></div>
		</div>
	</div>

	<div class="top-actions">
		<button
			type="button"
			class="btn btn-quiet btn-tiny"
			aria-label="Theme: {theme.mode}. Switch to {theme.next}."
			title="Switch to {theme.next}"
			onclick={() => theme.cycle()}
		>
			{theme.mode}
		</button>
		<button type="button" class="btn btn-quiet btn-tiny" onclick={() => store.loadSample()}>
			sample
		</button>
		<button type="button" class="btn btn-quiet btn-tiny" onclick={() => store.reset()}>
			clear
		</button>
		<button type="button" class="btn" onclick={() => (ui.assistOpen = true)}>Draft with AI</button>
		<!--
			The filled button is the app's actual job. Drafting copy is an assist,
			so it steps back to an outline rather than competing for the eye.
		-->
		<button type="button" class="btn btn-primary" onclick={() => (ui.exportOpen = true)}>
			Export code
		</button>
	</div>
</header>

<style>
	.topbar {
		flex: none;
		display: flex;
		align-items: center;
		gap: 22px;
		padding: 0 18px;
		height: 52px;
		border-bottom: 1px solid var(--rule);
		background: var(--paper);
	}

	.brand-trigger {
		background: none;
		border: 0;
		padding: 0;
		margin: 0;
		cursor: pointer;
		color: inherit;
		font: inherit;
		border-radius: 2px;
	}

	/* The only affordance: the angle brackets fill in. Enough to invite a click
	   without turning the wordmark into a control. */
	.brand-trigger:hover :global(.wordmark)::before,
	.brand-trigger:hover :global(.wordmark)::after {
		color: var(--ink);
	}

	.about {
		position: fixed;
		inset: auto;
		top: 46px;
		left: 12px;
		margin: 0;
		width: min(340px, calc(100vw - 24px));
		background: var(--paper-raised);
		color: var(--ink);
		border: 1px solid var(--rule-strong);
		border-radius: 4px;
		padding: 14px 15px 15px;
		box-shadow: 0 18px 40px -16px color-mix(in srgb, var(--ink) 34%, transparent);
	}

	.about-name {
		margin: 7px 0 2px;
		font-size: 14px;
		font-weight: 500;
	}

	.about-link {
		font-size: 11.5px;
		color: var(--ink-2);
		text-decoration: none;
		border-bottom: 1px solid var(--rule-strong);
	}

	.about-link:hover {
		color: var(--ink);
		border-bottom-color: var(--ink);
	}

	.about-body {
		margin: 11px 0 0;
		font-size: 12px;
		line-height: 1.55;
		color: var(--ink-2);
	}

	.score {
		display: grid;
		grid-template-columns: auto auto;
		align-items: baseline;
		gap: 0 7px;
		margin-left: auto;
	}

	.score-value {
		font-size: 15px;
		font-weight: 500;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.score-bar {
		grid-column: 1 / -1;
		height: 2px;
		background: var(--paper-sunk);
		margin-top: 3px;
		border-radius: 999px;
		overflow: hidden;
	}

	.score-fill {
		height: 100%;
		transition:
			width 200ms ease,
			background 200ms ease;
	}

	.score-fill[data-band='good'] {
		background: var(--ok);
	}

	.score-fill[data-band='fair'] {
		background: var(--warn);
	}

	.score-fill[data-band='poor'] {
		background: var(--bad);
	}

	.top-actions {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: none;
	}

	@media (max-width: 620px) {
		.topbar {
			gap: 12px;
			padding: 0 14px;
		}

		.about {
			left: 8px;
			top: 44px;
		}
	}
</style>

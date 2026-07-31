<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		id: string;
		title: string;
		summary?: string;
		count?: number | null;
		open?: boolean;
		children: Snippet;
	};

	let { id, title, summary = '', count = null, open = $bindable(true), children }: Props = $props();
</script>

<section {id} class="section">
	<!-- The body element only exists while open, so aria-controls is dropped when
	     collapsed rather than left pointing at nothing. -->
	<button
		type="button"
		class="section-head"
		aria-expanded={open}
		aria-controls={open ? `${id}-body` : undefined}
		onclick={() => (open = !open)}
	>
		<span class="section-marker" data-open={open} aria-hidden="true"></span>
		<span class="section-title">{title}</span>
		{#if count !== null}
			<span class="section-count mono">{count}</span>
		{/if}
		{#if summary}
			<span class="section-summary hint">{summary}</span>
		{/if}
	</button>

	{#if open}
		<div class="section-body" id="{id}-body">
			{@render children()}
		</div>
	{/if}
</section>

<style>
	.section {
		border-bottom: 1px solid var(--rule);
	}

	.section-head {
		display: flex;
		align-items: baseline;
		gap: 10px;
		width: 100%;
		padding: 16px 0 14px;
		background: none;
		border: 0;
		cursor: pointer;
		text-align: left;
		color: inherit;
		font: inherit;
	}

	.section-marker {
		flex: none;
		width: 7px;
		height: 1px;
		background: var(--ink-3);
		translate: 0 -4px;
		position: relative;
	}

	/* A plus that becomes a minus. Rotating a chevron would be the default move. */
	.section-marker::after {
		content: '';
		position: absolute;
		inset: -3px 3px;
		width: 1px;
		background: var(--ink-3);
		transition: opacity 120ms ease;
	}

	.section-marker[data-open='true']::after {
		opacity: 0;
	}

	.section-title {
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--ink);
		flex: none;
	}

	.section-count {
		font-size: 10.5px;
		color: var(--ink-3);
		flex: none;
	}

	.section-summary {
		margin-left: auto;
		text-align: right;
	}

	.section-body {
		padding-bottom: 22px;
		display: grid;
		gap: 14px;
	}

	@media (max-width: 640px) {
		.section-summary {
			display: none;
		}
	}
</style>

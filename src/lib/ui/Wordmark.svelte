<script lang="ts">
	type Props = {
		/** The word inside the angle brackets. */
		text?: string;
		/** Omit to render the mark alone. */
		tagline?: string;
	};

	let { text = 'head', tagline = '' }: Props = $props();
</script>

<div class="brand">
	<span class="wordmark mono">{text}</span>
	{#if tagline}<span class="tagline hint">{tagline}</span>{/if}
</div>

<style>
	.brand {
		display: flex;
		align-items: baseline;
		gap: 9px;
		min-width: 0;
	}

	/* Set in the mono face: this tool's subject is monospace text. */
	.wordmark {
		font-size: 14px;
		font-weight: 500;
		letter-spacing: 0.02em;
		color: var(--ink);
	}

	.wordmark::before {
		content: '<';
		color: var(--ink-3);
	}

	.wordmark::after {
		content: '>';
		color: var(--ink-3);
	}

	.tagline {
		white-space: nowrap;
	}

	@media (max-width: 620px) {
		.tagline {
			display: none;
		}
	}
</style>

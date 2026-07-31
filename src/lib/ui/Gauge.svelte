<script lang="ts">
	import { fit, LIMITS } from '$lib/seo/measure';

	type Props = {
		text: string;
		limit: keyof typeof LIMITS;
	};

	let { text, limit }: Props = $props();

	const spec = $derived(LIMITS[limit]);
	const measured = $derived(fit(text, spec));

	/* The tick sits at the truncation point, so the bar has to show room past it. */
	const scale = $derived(Math.max(1.25, measured.ratio + 0.08));
	const tickPercent = $derived(100 / scale);
	const fillPercent = $derived(Math.min(100, (measured.ratio / scale) * 100));

	const state = $derived(measured.overflows ? 'over' : measured.ratio > 0.72 ? 'good' : 'under');
</script>

<div>
	<div
		class="gauge"
		role="meter"
		aria-valuemin={0}
		aria-valuemax={spec.maxPx}
		aria-valuenow={Math.min(measured.px, spec.maxPx)}
		aria-label="Rendered width against the search result limit"
	>
		<div class="gauge-fill" data-state={state} style:width="{fillPercent}%"></div>
		<div class="gauge-tick" style:left="{tickPercent}%"></div>
	</div>

	<div class="gauge-row">
		<span class="mono readout" data-state={state}>
			{measured.px}<span class="unit">px</span>
			<span class="sep">/</span>
			{spec.maxPx}<span class="unit">px</span>
			<span class="chars">· {text.length} chars</span>
		</span>

		{#if measured.overflows}
			<span class="mono cut">cut to “{measured.truncated}”</span>
		{/if}
	</div>
</div>

<style>
	.readout {
		font-size: 10.5px;
		color: var(--ink-3);
		letter-spacing: 0.01em;
		white-space: nowrap;
	}

	.readout[data-state='good'] {
		color: var(--ok);
	}

	.readout[data-state='over'] {
		color: var(--warn);
	}

	.unit {
		opacity: 0.6;
	}

	.sep {
		opacity: 0.45;
		margin: 0 1px;
	}

	.chars {
		color: var(--ink-3);
		margin-left: 3px;
	}

	.cut {
		font-size: 10.5px;
		color: var(--warn);
		text-align: right;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}
</style>

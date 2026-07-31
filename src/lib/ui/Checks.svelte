<script lang="ts">
	import type { Audit, Finding } from '$lib/seo/lint';

	type Props = {
		audit: Audit;
		onJump: (finding: Finding) => void;
	};

	let { audit, onJump }: Props = $props();

	const errors = $derived(audit.findings.filter((f) => f.severity === 'error').length);
	const warnings = $derived(audit.findings.filter((f) => f.severity === 'warn').length);
	const notes = $derived(audit.findings.filter((f) => f.severity === 'info').length);
</script>

<div class="checks">
	<header>
		<span class="eyebrow">Checks</span>
		<span class="tally mono">
			{#if errors}<span class="count" data-severity="error">{errors} blocking</span>{/if}
			{#if warnings}<span class="count" data-severity="warn">{warnings} to fix</span>{/if}
			{#if notes}<span class="count" data-severity="info">{notes} notes</span>{/if}
			{#if !audit.findings.length}<span class="count" data-severity="clear">all clear</span>{/if}
		</span>
	</header>

	{#if audit.findings.length}
		<ul>
			{#each audit.findings as finding (finding.id)}
				<li>
					<button type="button" onclick={() => onJump(finding)}>
						<span class="dot" data-severity={finding.severity}></span>
						<span class="text">
							<span class="message">{finding.message}</span>
							{#if finding.detail}<span class="detail">{finding.detail}</span>{/if}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty hint">
			Every check passes. Structured data and a social image are already in place.
		</p>
	{/if}
</div>

<style>
	.checks {
		display: grid;
		gap: 10px;
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}

	.tally {
		display: flex;
		gap: 10px;
		font-size: 10.5px;
	}

	.count[data-severity='error'] {
		color: var(--bad);
	}

	.count[data-severity='warn'] {
		color: var(--warn);
	}

	.count[data-severity='info'] {
		color: var(--ink-3);
	}

	.count[data-severity='clear'] {
		color: var(--ok);
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}

	li + li {
		border-top: 1px solid var(--rule);
	}

	button {
		display: flex;
		align-items: flex-start;
		gap: 9px;
		width: 100%;
		background: none;
		border: 0;
		padding: 9px 6px 9px 2px;
		text-align: left;
		cursor: pointer;
		color: inherit;
		font: inherit;
		border-radius: 2px;
		transition: background 100ms ease;
	}

	button:hover {
		background: var(--paper-sunk);
	}

	.text {
		display: grid;
		gap: 2px;
		min-width: 0;
	}

	.message {
		font-size: 12.5px;
		color: var(--ink);
		line-height: 1.35;
	}

	.detail {
		font-size: 11.5px;
		color: var(--ink-3);
		line-height: 1.45;
	}

	.empty {
		margin: 0;
		padding: 4px 0 2px;
	}
</style>

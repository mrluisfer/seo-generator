<script lang="ts">
	import { TARGETS, type TargetId } from '$lib/seo/emit';
	import type { SeoDocument } from '$lib/seo/types';
	import { REPO_URL } from '$lib/github';
	import { highlight } from './highlight';
	import Chips from './Chips.svelte';

	// Lands on the issue form with the title started, so requesting a target is
	// one sentence of typing rather than a blank page.
	const REQUEST_URL = `${REPO_URL}/issues/new?title=${encodeURIComponent('Framework request: ')}`;

	type Props = {
		doc: SeoDocument;
		targetId: TargetId;
	};

	let { doc, targetId = $bindable('html') }: Props = $props();

	const target = $derived(TARGETS.find((t) => t.id === targetId) ?? TARGETS[0]);
	const code = $derived(target.emit(doc));
	const rendered = $derived(highlight(code, target.language));
	const lineCount = $derived(code.split('\n').length);

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;

	// Rendered in both the side pane and the export dialog, so ids must be
	// per-instance or aria-controls points at two elements at once.
	const instance = $props.id();
	const panelId = `code-panel-${instance}`;
	let pre = $state<HTMLPreElement | null>(null);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1600);
		} catch {
			// Clipboard is blocked (insecure origin or denied permission). Select
			// the text instead so the keyboard shortcut still works.
			if (!pre) return;
			const range = document.createRange();
			range.selectNodeContents(pre);
			const selection = window.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(range);
		}
	}

	function download() {
		const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = target.filename.split('/').pop() ?? 'seo.txt';
		anchor.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="pane">
	<header class="head">
		<span class="eyebrow">Export</span>
		<span class="filename mono">{target.filename}</span>

		<div class="head-actions">
			<button type="button" class="btn btn-primary" onclick={copy}>
				{copied ? 'Copied' : 'Copy'}
			</button>
			<button type="button" class="btn" onclick={download}>Download</button>
		</div>
	</header>

	<div class="picker">
		<span class="picker-label eyebrow">Framework</span>
		<Chips items={TARGETS} bind:value={targetId} label="Output framework" controls={panelId} />

		<!--
			An absolute external URL, so it leaves the app rather than routing.
			Disabled as a block because the rule reports the href line, which
			formatting moves away from a disable-next-line comment.
		-->
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<a
			class="request"
			href={REQUEST_URL}
			target="_blank"
			rel="noreferrer noopener"
			title="Open an issue to request a framework"
		>
			Can't find your framework?
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>

	<p class="note">
		<span class="hint">{target.note}</span>
		<span class="mono lines">{lineCount} lines</span>
	</p>

	<div
		id={panelId}
		class="code-area scroll-area"
		role="tabpanel"
		tabindex="0"
		aria-label="{target.label} output"
	>
		<!--
			Safe: `rendered` is produced by highlight(), which HTML-escapes every
			character of the input before wrapping tokens in its own spans. No user
			text reaches the DOM unescaped.
		-->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<pre bind:this={pre} class="code"><code>{@html rendered}</code></pre>
	</div>
</div>

<style>
	.pane {
		border: 1px solid var(--rule);
		border-radius: 4px;
		background: var(--paper-raised);
		overflow: hidden;
	}

	/*
		The two things people came here for — pick a framework, take the code —
		sit at the top. Anything that scrolls goes below them, never around them.
	*/
	.head {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 13px;
		border-bottom: 1px solid var(--rule);
	}

	.filename {
		font-size: 11px;
		color: var(--ink-2);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.head-actions {
		display: flex;
		gap: 7px;
		margin-left: auto;
		flex: none;
	}

	.picker {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 10px;
		padding: 11px 13px;
		border-bottom: 1px solid var(--rule);
		background: var(--paper-sunk);
	}

	/* Sits apart from the chips so it reads as a way out, not another target. */
	.request {
		margin-left: auto;
		flex: none;
		font-size: 11.5px;
		color: var(--ink-3);
		text-decoration: none;
		white-space: nowrap;
		border-bottom: 1px solid transparent;
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}

	.request:hover {
		color: var(--ink);
		border-bottom-color: var(--rule-strong);
	}

	@media (max-width: 620px) {
		.request {
			margin-left: 0;
		}
	}

	.picker-label {
		flex: none;
		padding-top: 4px;
	}

	.note {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		margin: 0;
		padding: 8px 13px;
		border-bottom: 1px solid var(--rule);
	}

	.lines {
		font-size: 10.5px;
		color: var(--ink-3);
		flex: none;
	}

	/*
		A bounded, independently scrolling code area. Without a max-height the pane
		grows to the full length of the output and pushes everything below it away.
		Callers that have more room — the export dialog — raise --code-max.
	*/
	.code-area {
		max-height: var(--code-max, clamp(220px, 44vh, 620px));
		overflow: auto;
		padding: 13px;
	}

	pre {
		margin: 0;
		outline-offset: -2px;
	}

	@media (max-width: 1000px) {
		.code-area {
			max-height: 60vh;
		}
	}

	@media (max-width: 520px) {
		.head {
			flex-wrap: wrap;
		}

		.head-actions {
			width: 100%;
			margin-left: 0;
		}

		.head-actions .btn {
			flex: 1;
			justify-content: center;
		}

		.picker {
			flex-direction: column;
			gap: 7px;
		}

		.picker-label {
			padding-top: 0;
		}
	}
</style>

<script lang="ts">
	import { untrack } from 'svelte';
	import { settings, PROVIDERS } from '$lib/state/settings.svelte';
	import { emptyBrief, PAGE_TYPES, type AiDraft, type Brief } from '$lib/ai/contract';
	import Field from './Field.svelte';
	import TagInput from './TagInput.svelte';
	import Toggle from './Toggle.svelte';

	type Props = {
		open: boolean;
		/** Seeded from the document so the brief starts where the editor left off. */
		seed: Partial<Brief>;
		onApply: (draft: AiDraft, fields: Set<string>) => void;
	};

	let { open = $bindable(false), seed, onApply }: Props = $props();

	let brief = $state<Brief>(emptyBrief());
	let keyDraft = $state('');
	let showKeyEditor = $state(false);
	let status = $state<'idle' | 'running' | 'error'>('idle');
	let error = $state('');
	let draft = $state<AiDraft | null>(null);
	let selected = $state<Record<string, boolean>>({});
	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});

	// Pull site-level context from the document each time the dialog opens, but
	// never mid-edit — otherwise typing in the editor would rewrite the brief.
	$effect(() => {
		if (!open) return;
		untrack(() => {
			brief = { ...brief, ...seed, subject: brief.subject };
		});
	});

	const canRun = $derived(
		settings.hasKey && brief.subject.trim().length > 2 && status !== 'running'
	);

	const DRAFT_FIELDS: { key: keyof AiDraft; label: string }[] = [
		{ key: 'title', label: 'Title' },
		{ key: 'description', label: 'Description' },
		{ key: 'keywords', label: 'Keywords' },
		{ key: 'ogTitle', label: 'Social title' },
		{ key: 'ogDescription', label: 'Social description' },
		{ key: 'ogImageAlt', label: 'Image alt text' },
		{ key: 'twitterTitle', label: 'X title' },
		{ key: 'twitterDescription', label: 'X description' },
		{ key: 'faq', label: 'FAQ entries' }
	];

	function preview(key: keyof AiDraft): string {
		if (!draft) return '';
		const value = draft[key];
		if (Array.isArray(value)) {
			if (!value.length) return '';
			if (typeof value[0] === 'string') return (value as string[]).join(', ');
			return `${value.length} question${value.length === 1 ? '' : 's'}`;
		}
		return typeof value === 'string' ? value : '';
	}

	const filledFields = $derived(DRAFT_FIELDS.filter((f) => preview(f.key)));

	async function run() {
		status = 'running';
		error = '';
		draft = null;

		try {
			const response = await fetch('/api/generate', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					provider: settings.provider,
					apiKey: settings.key,
					brief
				})
			});
			const payload = await response.json();
			if (!response.ok) throw new Error(payload.error ?? 'Generation failed.');

			draft = payload.draft as AiDraft;
			const next: Record<string, boolean> = {};
			for (const field of DRAFT_FIELDS) next[field.key] = !!preview(field.key);
			selected = next;
			status = 'idle';
		} catch (e) {
			error = e instanceof Error ? e.message : 'Generation failed.';
			status = 'error';
		}
	}

	function apply() {
		if (!draft) return;
		const fields = new Set(Object.keys(selected).filter((k) => selected[k]));
		onApply(draft, fields);
		open = false;
		draft = null;
	}

	function saveKey() {
		settings.setKey(settings.provider, keyDraft.trim());
		keyDraft = '';
		showKeyEditor = false;
	}
</script>

<dialog
	bind:this={dialog}
	class="dialog"
	onclose={() => (open = false)}
	onclick={(e) => {
		if (e.target === dialog) open = false;
	}}
>
	<div class="shell scroll-area">
		<header class="head">
			<div>
				<h2 class="eyebrow">Draft with AI</h2>
				<p class="hint lead">
					The model writes copy only. It never touches URLs, robots rules, or structured data.
				</p>
			</div>
			<button type="button" class="btn btn-quiet" onclick={() => (open = false)}>Close</button>
		</header>

		<section class="keys">
			<div class="key-row">
				<span class="label">Provider</span>
				<div class="providers">
					{#each PROVIDERS as provider (provider.id)}
						<button
							type="button"
							class="provider mono"
							aria-pressed={settings.provider === provider.id}
							onclick={() => settings.setProvider(provider.id)}
						>
							{provider.label}
							<span class="model">{provider.model}</span>
						</button>
					{/each}
				</div>
			</div>

			{#if settings.hasKey && !showKeyEditor}
				<div class="key-state">
					<span class="mono key-mask">
						{settings.key.slice(0, 7)}{'·'.repeat(12)}{settings.key.slice(-4)}
					</span>
					<button
						type="button"
						class="btn btn-quiet btn-tiny"
						onclick={() => (showKeyEditor = true)}
					>
						replace
					</button>
					<button
						type="button"
						class="btn btn-quiet btn-tiny"
						onclick={() => settings.clearKey(settings.provider)}
					>
						forget
					</button>
				</div>
			{:else}
				<div class="key-entry">
					<input
						class="input is-mono"
						type="password"
						autocomplete="off"
						placeholder={settings.info.keyHint}
						bind:value={keyDraft}
						onkeydown={(e) => e.key === 'Enter' && keyDraft.trim() && saveKey()}
					/>
					<button type="button" class="btn" disabled={!keyDraft.trim()} onclick={saveKey}>
						Save
					</button>
				</div>
				<p class="hint">
					Stored in this browser only, and sent to this app's server once per request so the call
					reaches {settings.info.label}. It is never logged or persisted server-side.
					<!-- Leaves the app entirely, so it is not a router navigation. -->
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={settings.info.consoleUrl} target="_blank" rel="noreferrer noopener">
						Get a key
					</a>
				</p>
			{/if}
		</section>

		<section class="brief">
			<Field
				label="What is this page about?"
				placeholder="A pricing page for a per-seat developer tool. Two plans, 14-day trial, no card required."
				hint="The more specific this is, the less generic the copy. Write it in the output language."
				multiline
				rows={4}
				bind:value={brief.subject}
			/>

			<div class="grid-2">
				<div class="field">
					<label class="label" for="page-type">Page type</label>
					<select id="page-type" class="select" bind:value={brief.pageType}>
						{#each PAGE_TYPES as type (type)}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
				<Field label="Output language" placeholder="English" bind:value={brief.language} />
				<Field
					label="Audience"
					placeholder="Backend engineers at Series A startups"
					bind:value={brief.audience}
				/>
				<Field label="Tone" placeholder="plain and direct" bind:value={brief.tone} />
			</div>

			<TagInput
				label="Terms to work in"
				placeholder="Optional"
				hint="Used only where they read naturally. Nothing gets stuffed."
				bind:values={brief.keywords}
			/>

			<Toggle
				label="Also draft FAQ entries"
				hint="Adds an FAQPage block. Only use it if the answers appear on the page itself."
				bind:checked={brief.wantFaq}
			/>
		</section>

		{#if error}
			<p class="error" role="alert">{error}</p>
		{/if}

		{#if draft}
			<section class="result">
				<div class="result-head">
					<span class="eyebrow">Draft</span>
					<span class="hint">Pick what to keep. Nothing is applied until you say so.</span>
				</div>

				{#if draft.notes}
					<p class="notes">{draft.notes}</p>
				{/if}

				<ul class="fields">
					{#each filledFields as field (field.key)}
						<li>
							<label>
								<input type="checkbox" bind:checked={selected[field.key]} />
								<span class="field-name mono">{field.label}</span>
								<span class="field-value">{preview(field.key)}</span>
							</label>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		<footer class="foot">
			{#if !settings.hasKey}
				<span class="hint">Add a key to enable generation.</span>
			{:else if status === 'running'}
				<span class="hint mono">Writing…</span>
			{/if}
			<div class="foot-actions">
				<button type="button" class="btn" disabled={!canRun} onclick={run}>
					{draft ? 'Rewrite' : 'Generate'}
				</button>
				<button
					type="button"
					class="btn btn-primary"
					disabled={!draft || !Object.values(selected).some(Boolean)}
					onclick={apply}
				>
					Apply selected
				</button>
			</div>
		</footer>
	</div>
</dialog>

<style>
	.dialog {
		border: 0;
		padding: 0;
		background: transparent;
		max-width: 100vw;
		max-height: 100vh;
		width: 100%;
		height: 100%;
		margin: 0;
		color: var(--ink);
	}

	.dialog::backdrop {
		background: color-mix(in srgb, var(--ink) 34%, transparent);
		backdrop-filter: blur(2px);
	}

	.shell {
		width: min(620px, calc(100vw - 32px));
		max-height: min(88vh, 900px);
		overflow-y: auto;
		margin: 6vh auto;
		background: var(--paper);
		border: 1px solid var(--rule-strong);
		border-radius: 5px;
		padding: 20px 22px 18px;
		display: grid;
		gap: 20px;
		box-shadow: 0 24px 60px -20px color-mix(in srgb, var(--ink) 30%, transparent);
	}

	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 16px;
	}

	h2 {
		margin: 0 0 4px;
	}

	.lead {
		margin: 0;
		max-width: 46ch;
	}

	.keys,
	.brief,
	.result {
		display: grid;
		gap: 11px;
	}

	.keys,
	.result {
		border: 1px solid var(--rule);
		border-radius: 4px;
		padding: 13px;
		background: var(--paper-raised);
	}

	.key-row {
		display: grid;
		gap: 6px;
	}

	.providers {
		display: flex;
		gap: 6px;
	}

	.provider {
		display: grid;
		gap: 2px;
		text-align: left;
		border: 1px solid var(--rule);
		background: var(--paper);
		border-radius: 3px;
		padding: 7px 11px;
		cursor: pointer;
		color: var(--ink-2);
		font-size: 11.5px;
		transition:
			border-color 120ms ease,
			color 120ms ease;
	}

	.provider:hover {
		border-color: var(--rule-strong);
	}

	.provider[aria-pressed='true'] {
		border-color: var(--ink);
		color: var(--ink);
	}

	.model {
		font-size: 10px;
		color: var(--ink-3);
		letter-spacing: 0.02em;
	}

	.key-state {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.key-mask {
		flex: 1;
		font-size: 11.5px;
		color: var(--ink-2);
		border: 1px solid var(--rule);
		border-radius: 3px;
		padding: 6px 9px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.key-entry {
		display: flex;
		gap: 7px;
	}

	.key-entry .input {
		flex: 1;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 11px;
	}

	.field {
		display: grid;
		gap: 5px;
	}

	.error {
		margin: 0;
		font-size: 12.5px;
		color: var(--bad);
		border-left: 2px solid var(--bad);
		padding-left: 10px;
	}

	.result-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}

	.notes {
		margin: 0;
		font-size: 12.5px;
		color: var(--ink-2);
		line-height: 1.5;
		border-left: 1px solid var(--rule-strong);
		padding-left: 10px;
	}

	.fields {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}

	.fields li + li {
		border-top: 1px solid var(--rule);
	}

	.fields label {
		display: grid;
		grid-template-columns: auto 96px 1fr;
		align-items: baseline;
		gap: 9px;
		padding: 8px 0;
		cursor: pointer;
	}

	.field-name {
		font-size: 10.5px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-3);
	}

	.field-value {
		font-size: 12.5px;
		color: var(--ink);
		line-height: 1.45;
		min-width: 0;
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}

	.foot-actions {
		display: flex;
		gap: 7px;
		margin-left: auto;
	}

	a {
		color: var(--ink);
		text-underline-offset: 2px;
	}

	@media (max-width: 560px) {
		.grid-2 {
			grid-template-columns: 1fr;
		}

		.fields label {
			grid-template-columns: auto 1fr;
		}

		.field-name {
			grid-column: 2;
		}

		.field-value {
			grid-column: 2;
		}
	}
</style>

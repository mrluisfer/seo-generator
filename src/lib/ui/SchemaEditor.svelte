<script lang="ts">
	import type { StructuredDataEntry } from '$lib/seo/types';
	import { emptyRow, getSchemaDef, type FieldDef } from '$lib/seo/schemas';
	import Field from './Field.svelte';
	import TagInput from './TagInput.svelte';

	type Props = {
		entry: StructuredDataEntry;
		onRemove: () => void;
	};

	let { entry = $bindable(), onRemove }: Props = $props();

	/** Findings about this block focus it by id. */
	const elementId = $derived(`schema-${entry.id}`);

	const def = $derived(getSchemaDef(entry.type));
	let open = $state(true);

	function addRow(field: FieldDef) {
		entry.data[field.key] = [...(entry.data[field.key] ?? []), emptyRow(field)];
	}

	function removeRow(field: FieldDef, index: number) {
		const rows = entry.data[field.key] ?? [];
		entry.data[field.key] = rows.filter((_: unknown, i: number) => i !== index);
	}

	function inputType(kind: FieldDef['kind']) {
		if (kind === 'url') return 'url' as const;
		if (kind === 'date') return 'date' as const;
		return 'text' as const;
	}
</script>

{#if def}
	<!-- tabindex lets a finding about this block focus it, not just scroll to it. -->
	<article id={elementId} class="entry" class:muted={!entry.enabled} tabindex="-1">
		<header>
			<button type="button" class="disclose" aria-expanded={open} onclick={() => (open = !open)}>
				<span class="type mono">{def.label}</span>
			</button>

			<span class="summary hint">{def.summary}</span>

			<label class="live" title={entry.enabled ? 'Included in output' : 'Excluded from output'}>
				<input type="checkbox" bind:checked={entry.enabled} />
				<span class="live-text mono">{entry.enabled ? 'on' : 'off'}</span>
			</label>

			<button type="button" class="btn btn-quiet btn-tiny" onclick={onRemove}>remove</button>
		</header>

		{#if open}
			<div class="body">
				{#each def.fields as field (field.key)}
					{#if field.kind === 'tags'}
						<TagInput label={field.label} hint={field.hint} bind:values={entry.data[field.key]} />
					{:else if field.kind === 'group'}
						<div class="group">
							<div class="group-head">
								<span class="label">{field.label}</span>
								<button type="button" class="btn btn-quiet btn-tiny" onclick={() => addRow(field)}>
									+ {field.addLabel ?? 'Add'}
								</button>
							</div>

							{#each entry.data[field.key] ?? [] as row, i (i)}
								<div class="row">
									<span class="row-index mono">{String(i + 1).padStart(2, '0')}</span>
									<div class="row-fields">
										{#each field.fields ?? [] as sub (sub.key)}
											<Field
												label={sub.label}
												placeholder={sub.placeholder}
												type={inputType(sub.kind)}
												multiline={sub.kind === 'textarea'}
												rows={2}
												bind:value={row[sub.key]}
											/>
										{/each}
									</div>
									<button
										type="button"
										class="btn btn-quiet btn-tiny row-remove"
										aria-label="Remove item {i + 1}"
										onclick={() => removeRow(field, i)}
									>
										&times;
									</button>
								</div>
							{/each}
						</div>
					{:else}
						<Field
							label={field.label}
							hint={field.hint}
							placeholder={field.placeholder}
							type={inputType(field.kind)}
							multiline={field.kind === 'textarea'}
							rows={2}
							bind:value={entry.data[field.key]}
						/>
					{/if}
				{/each}
			</div>
		{/if}
	</article>
{/if}

<style>
	.entry {
		border: 1px solid var(--rule);
		border-radius: 4px;
		background: var(--paper-raised);
		transition: opacity 120ms ease;
	}

	.entry.muted {
		opacity: 0.5;
	}

	header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 9px 9px 12px;
	}

	.disclose {
		background: none;
		border: 0;
		padding: 0;
		cursor: pointer;
		color: inherit;
	}

	.type {
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink);
	}

	.summary {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.live {
		/* Contains the absolutely positioned input below. Without this it
		   anchors to the initial containing block and its static position —
		   deep inside a scrolled column — stretches the document height. */
		position: relative;
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		flex: none;
	}

	.live input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.live-text {
		font-size: 10px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-3);
		border: 1px solid var(--rule);
		border-radius: 2px;
		padding: 2px 5px;
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}

	.live input:checked + .live-text {
		color: var(--ok);
		border-color: color-mix(in srgb, var(--ok) 40%, transparent);
	}

	.live input:focus-visible + .live-text {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}

	.body {
		display: grid;
		gap: 13px;
		padding: 4px 12px 15px;
		border-top: 1px solid var(--rule);
		padding-top: 14px;
	}

	.group {
		display: grid;
		gap: 9px;
	}

	.group-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.row {
		display: flex;
		align-items: flex-start;
		gap: 9px;
		padding-left: 2px;
		border-left: 1px solid var(--rule);
		padding-bottom: 2px;
	}

	.row-index {
		font-size: 10px;
		color: var(--ink-3);
		padding: 8px 0 0 8px;
		flex: none;
	}

	.row-fields {
		flex: 1;
		min-width: 0;
		display: grid;
		gap: 8px;
	}

	.row-remove {
		font-size: 14px;
		line-height: 1;
		padding: 4px 6px;
		flex: none;
		margin-top: 4px;
	}
</style>

<script lang="ts">
	type Props = {
		label: string;
		values: string[];
		hint?: string;
		placeholder?: string;
		id?: string;
	};

	let {
		label,
		values = $bindable([]),
		hint = '',
		placeholder = 'Type and press Enter',
		id = ''
	}: Props = $props();

	let draft = $state('');

	const auto = $props.id();
	const fieldId = $derived(id || `t-${auto}`);

	function commit() {
		// Comma-separated paste is the common case, so split on it rather than
		// making people press Enter once per term.
		const parts = draft
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (!parts.length) return;
		const next = [...values];
		for (const part of parts) {
			const isDuplicate = next.some((v) => v.toLowerCase() === part.toLowerCase());
			if (!isDuplicate) next.push(part);
		}
		values = next;
		draft = '';
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			commit();
		} else if (event.key === 'Backspace' && !draft && values.length) {
			values = values.slice(0, -1);
		}
	}

	function remove(index: number) {
		values = values.filter((_, i) => i !== index);
	}
</script>

<div class="field">
	<label class="label" for={fieldId}>{label}</label>

	<div class="well">
		{#each values as tag, i (tag + i)}
			<span class="tag mono">
				{tag}
				<button type="button" aria-label="Remove {tag}" onclick={() => remove(i)}>&times;</button>
			</span>
		{/each}
		<input
			id={fieldId}
			class="entry"
			{placeholder}
			bind:value={draft}
			onkeydown={onKeydown}
			onblur={commit}
		/>
	</div>

	{#if hint}
		<p class="hint">{hint}</p>
	{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 5px;
	}

	.well {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 5px;
		background: var(--paper-raised);
		border: 1px solid var(--rule);
		border-radius: 3px;
		padding: 5px 6px;
		transition: border-color 120ms ease;
	}

	.well:hover {
		border-color: var(--rule-strong);
	}

	.well:focus-within {
		border-color: var(--ink);
		box-shadow: 0 0 0 1px var(--ink);
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		background: var(--paper-sunk);
		border-radius: 2px;
		padding: 2px 3px 2px 6px;
		font-size: 11.5px;
		color: var(--ink);
	}

	.tag button {
		border: 0;
		background: none;
		color: var(--ink-3);
		cursor: pointer;
		font-size: 13px;
		line-height: 1;
		padding: 1px 3px;
		border-radius: 2px;
	}

	.tag button:hover {
		color: var(--bad);
	}

	.entry {
		flex: 1;
		min-width: 120px;
		border: 0;
		outline: none;
		background: none;
		color: var(--ink);
		font-family: var(--font-sans);
		font-size: 13.5px;
		padding: 2px 3px;
	}

	.entry::placeholder {
		color: var(--ink-3);
	}

	.hint {
		margin: 1px 0 0;
	}
</style>

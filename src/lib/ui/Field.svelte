<script lang="ts">
	import Gauge from './Gauge.svelte';
	import type { LIMITS } from '$lib/seo/measure';

	type Props = {
		label: string;
		value: string;
		hint?: string;
		placeholder?: string;
		type?: 'text' | 'url' | 'date' | 'datetime-local' | 'number';
		multiline?: boolean;
		mono?: boolean;
		rows?: number;
		measure?: keyof typeof LIMITS | null;
		id?: string;
	};

	let {
		label,
		value = $bindable(''),
		hint = '',
		placeholder = '',
		type = 'text',
		multiline = false,
		mono = false,
		rows = 3,
		measure = null,
		id = ''
	}: Props = $props();

	// Deriving this from the label collided whenever two fields shared a label —
	// every schema block has a "Name". Explicit ids (the lint targets) still win.
	const auto = $props.id();
	const fieldId = $derived(id || `f-${auto}`);
	const hintId = $derived(`${fieldId}-hint`);
</script>

<div class="field">
	<label class="label" for={fieldId}>{label}</label>

	{#if multiline}
		<textarea
			id={fieldId}
			class="textarea"
			class:is-mono={mono}
			{rows}
			{placeholder}
			aria-describedby={hint ? hintId : undefined}
			bind:value></textarea>
	{:else}
		<input
			id={fieldId}
			class="input"
			class:is-mono={mono}
			{type}
			{placeholder}
			spellcheck={type === 'url' ? 'false' : undefined}
			autocapitalize={type === 'url' ? 'off' : undefined}
			aria-describedby={hint ? hintId : undefined}
			bind:value
		/>
	{/if}

	{#if measure}
		<Gauge text={value} limit={measure} />
	{/if}

	{#if hint}
		<p class="hint" id={hintId}>{hint}</p>
	{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 5px;
	}

	.hint {
		margin: 1px 0 0;
	}

	.textarea {
		max-height: 300px;
	}
</style>

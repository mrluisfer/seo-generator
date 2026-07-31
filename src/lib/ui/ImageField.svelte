<script lang="ts">
	import Field from './Field.svelte';
	import { ui } from '$lib/state/ui.svelte';

	type Props = {
		label: string;
		value: string;
		hint?: string;
		placeholder?: string;
		id?: string;
	};

	let { label, value = $bindable(''), hint = '', placeholder = '', id = '' }: Props = $props();

	let input = $state<HTMLInputElement | null>(null);

	function onPick(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0] ?? null;
		ui.setPreviewImage(file);
	}

	function clear() {
		ui.setPreviewImage(null);
		if (input) input.value = '';
	}
</script>

<div class="image-field">
	<Field {id} {label} {hint} {placeholder} type="url" mono bind:value />

	<div class="upload">
		<label class="btn btn-tiny">
			<input
				bind:this={input}
				type="file"
				accept="image/*"
				onchange={onPick}
				aria-label="Choose a local image to preview"
			/>
			{ui.previewImage ? 'Replace file' : 'Preview a local file'}
		</label>

		{#if ui.previewImage}
			<span class="filename mono" title={ui.previewImageName}>{ui.previewImageName}</span>
			<button type="button" class="btn btn-quiet btn-tiny" onclick={clear}>remove</button>
		{/if}
	</div>

	<p class="hint">
		{#if ui.previewImage}
			Showing your local file in the preview below. The exported metadata still points at the URL
			above — a crawler cannot read a file from your machine.
		{:else}
			Preview a file from your machine to see how the card will look before you upload it anywhere.
		{/if}
	</p>
</div>

<style>
	.image-field {
		display: grid;
		gap: 7px;
	}

	.upload {
		display: flex;
		align-items: center;
		gap: 7px;
		min-width: 0;
	}

	/* The input is the click target via its wrapping label, so it only needs to
	   stay reachable by keyboard, not visible. */
	.upload input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}

	.upload label {
		/* Contains the absolutely positioned input below. Without this it
		   anchors to the initial containing block and its static position —
		   deep inside a scrolled column — stretches the document height. */
		position: relative;
		cursor: pointer;
		flex: none;
	}

	.upload label:focus-within {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}

	.filename {
		font-size: 11px;
		color: var(--ink-2);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.hint {
		margin: 0;
	}
</style>

<script lang="ts">
	type Props = {
		label: string;
		checked: boolean;
		hint?: string;
		id?: string;
	};

	let { label, checked = $bindable(false), hint = '', id = undefined }: Props = $props();
</script>

<label class="toggle">
	<input {id} type="checkbox" bind:checked />
	<span class="box" aria-hidden="true"></span>
	<span class="text">
		<span class="name">{label}</span>
		{#if hint}<span class="hint">{hint}</span>{/if}
	</span>
</label>

<style>
	.toggle {
		/* Contains the absolutely positioned input below. Without this it
		   anchors to the initial containing block and its static position —
		   deep inside a scrolled column — stretches the document height. */
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 8px;
		cursor: pointer;
		user-select: none;
	}

	input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.box {
		flex: none;
		width: 13px;
		height: 13px;
		margin-top: 2px;
		border: 1px solid var(--rule-strong);
		border-radius: 2px;
		background: var(--paper-raised);
		position: relative;
		transition:
			background 120ms ease,
			border-color 120ms ease;
	}

	.box::after {
		content: '';
		position: absolute;
		left: 3px;
		top: 0px;
		width: 4px;
		height: 8px;
		border: solid var(--paper);
		border-width: 0 1.5px 1.5px 0;
		rotate: 45deg;
		opacity: 0;
		transition: opacity 100ms ease;
	}

	.toggle:hover .box {
		border-color: var(--ink);
	}

	input:checked + .box {
		background: var(--ink);
		border-color: var(--ink);
	}

	input:checked + .box::after {
		opacity: 1;
	}

	input:focus-visible + .box {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
	}

	.text {
		display: grid;
		gap: 1px;
		min-width: 0;
	}

	.name {
		font-size: 13px;
		color: var(--ink);
		line-height: 1.35;
	}
</style>

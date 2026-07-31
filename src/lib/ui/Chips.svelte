<script lang="ts" generics="T extends string">
	type Item = { id: T; label: string };

	type Props = {
		items: readonly Item[];
		value: T;
		/** Names the group for screen readers. */
		label: string;
		/** id of the panel this group drives. */
		controls?: string;
	};

	let { items, value = $bindable(), label, controls = undefined }: Props = $props();

	/* Arrow keys move between tabs, which is what role="tab" promises. */
	function onKeydown(event: KeyboardEvent, index: number) {
		const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!step) return;
		event.preventDefault();
		const next = (index + step + items.length) % items.length;
		value = items[next].id;
		const group =
			event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement : null;
		(group?.children[next] as HTMLElement | undefined)?.focus();
	}
</script>

<div class="chips" role="tablist" aria-label={label}>
	{#each items as item, i (item.id)}
		<button
			type="button"
			role="tab"
			class="chip mono"
			aria-selected={item.id === value}
			aria-controls={controls}
			tabindex={item.id === value ? 0 : -1}
			onclick={() => (value = item.id)}
			onkeydown={(e) => onKeydown(e, i)}
		>
			{item.label}
		</button>
	{/each}
</div>

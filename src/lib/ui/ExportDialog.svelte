<script lang="ts">
	import CodePane from './CodePane.svelte';
	import type { SeoDocument } from '$lib/seo/types';
	import type { TargetId } from '$lib/seo/emit';

	type Props = {
		open: boolean;
		doc: SeoDocument;
		/** Shared with the side pane, so switching framework in one moves both. */
		targetId: TargetId;
	};

	let { open = $bindable(false), doc, targetId = $bindable('html') }: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	class="dialog"
	onclose={() => (open = false)}
	onclick={(e) => {
		if (e.target === dialog) open = false;
	}}
>
	<div class="shell">
		<header class="head">
			<div>
				<h2 class="eyebrow">Export code</h2>
				<p class="hint lead">
					Pick a target and take the code. The same metadata, written the way each framework expects
					it.
				</p>
			</div>
			<button type="button" class="btn btn-quiet" onclick={() => (open = false)}>Close</button>
		</header>

		<CodePane {doc} bind:targetId />
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
		width: min(1040px, calc(100vw - 32px));
		margin: 5vh auto;
		background: var(--paper);
		border: 1px solid var(--rule-strong);
		border-radius: 5px;
		padding: 18px 20px 20px;
		display: grid;
		gap: 16px;
		box-shadow: 0 24px 60px -20px color-mix(in srgb, var(--ink) 30%, transparent);

		/* Far more room than the side pane, which is the point of opening this. */
		--code-max: min(62vh, 720px);
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
		max-width: 58ch;
	}

	@media (max-width: 620px) {
		.shell {
			width: calc(100vw - 16px);
			margin: 2vh auto;
			padding: 14px 14px 16px;
			--code-max: 58vh;
		}

		.lead {
			display: none;
		}
	}
</style>

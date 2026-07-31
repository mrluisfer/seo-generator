<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/ui/Header.svelte';
	import Footer from '$lib/ui/Footer.svelte';
	import AssistDialog from '$lib/ui/AssistDialog.svelte';
	import ExportDialog from '$lib/ui/ExportDialog.svelte';
	import { store } from '$lib/state/doc.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import type { AiDraft, Brief } from '$lib/ai/contract';
	import type { Snippet } from 'svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children }: { children: Snippet } = $props();

	const LANGUAGE_NAMES: Record<string, string> = {
		en: 'English',
		es: 'Spanish',
		pt: 'Portuguese',
		fr: 'French',
		de: 'German',
		it: 'Italian',
		nl: 'Dutch',
		ja: 'Japanese'
	};

	const assistSeed = $derived<Partial<Brief>>({
		siteName: store.doc.siteName,
		url: store.doc.canonical,
		keywords: store.doc.keywords,
		language: LANGUAGE_NAMES[store.doc.lang.slice(0, 2).toLowerCase()] ?? 'English'
	});

	function applyDraft(draft: AiDraft, fields: Set<string>) {
		const { touchedStructuredData } = store.applyDraft(draft, fields);
		if (touchedStructuredData) ui.openSection('structured');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!--
	The shell owns the viewport height so the header and footer can pin above and
	below a page whose panes scroll internally. The route itself is flex:1.

	Header, footer, and both dialogs are app chrome, not route content — every
	view gets them, and their state lives in the ui store rather than a route.
-->
<div class="shell">
	<Header />
	{@render children()}
	<Footer />
</div>

<AssistDialog bind:open={ui.assistOpen} seed={assistSeed} onApply={applyDraft} />
<ExportDialog bind:open={ui.exportOpen} doc={store.doc} bind:targetId={ui.targetId} />

<style>
	.shell {
		display: flex;
		flex-direction: column;
		height: 100dvh;
		/* The panes scroll internally, so nothing here may grow the document.
		   Dialogs and the about popover render in the top layer and escape this. */
		overflow: clip;
	}

	@media (max-width: 1000px) {
		.shell {
			height: auto;
			min-height: 100dvh;
		}
	}
</style>

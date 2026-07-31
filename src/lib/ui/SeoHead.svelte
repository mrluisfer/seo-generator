<script lang="ts">
	import type { SeoDocument } from '$lib/seo/types';
	import { buildTags } from '$lib/seo/build';

	type Props = { doc: SeoDocument };
	let { doc }: Props = $props();

	/*
		The app's own metadata goes through the same compiler as the metadata it
		generates for users. If buildTags() ever emits something wrong, this site
		is the first page that shows it.
	*/
	const tags = $derived(buildTags(doc, { includeDocumentTags: false }));
	const jsonld = $derived(tags.find((t) => t.kind === 'jsonld'));

	/*
		Svelte reads a literal script element in markup as the component's own
		script, so JSON-LD has to be injected as html.

		Both constants below are built rather than written, and each guards a
		mistake this file has already made once:

		- An escaped closing tag is valid JavaScript but sits one stray backslash
		  away from emitting a tag that never closes, which silently swallows the
		  rest of the head. Concatenating removes the escape and the sequence a
		  parser scans for at the same time.
		- The replacement has to be a literal backslash-u sequence. Written as a
		  unicode escape it evaluates to an angle bracket, and the call replaces
		  the character with itself.
	*/
	const OPEN_TAG = '<script type="application/ld+json">';
	const CLOSE_TAG = '<' + '/script>';
	const ESCAPED_LT = String.raw`\u003c`;

	const jsonldTag = $derived(
		jsonld?.kind === 'jsonld'
			? OPEN_TAG + JSON.stringify(jsonld.json).replaceAll('<', ESCAPED_LT) + CLOSE_TAG
			: ''
	);
</script>

<svelte:head>
	{#each tags as tag, i (i)}
		{#if tag.kind === 'title'}
			<title>{tag.text}</title>
		{:else if tag.kind === 'meta'}
			<meta {...tag.attrs} />
		{:else if tag.kind === 'link'}
			<link {...tag.attrs} />
		{/if}
	{/each}

	{#if jsonldTag}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html jsonldTag}
	{/if}
</svelte:head>

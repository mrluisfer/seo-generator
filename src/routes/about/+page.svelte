<script lang="ts">
	import { resolve } from '$app/paths';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import { aboutDocument, FAQ } from '$lib/seo/site';
	import { REPO_URL } from '$lib/github';

	/*
		A tool page is almost all controls and almost no prose, which gives a search
		engine — and an answer engine — nothing to read or cite. This page carries
		that text. It is also what makes the FAQ structured data legitimate: every
		question below is answered in visible copy, which is the rule the editor
		states when you add a schema block.
	*/
</script>

<SeoHead doc={aboutDocument()} />

<main class="page scroll-area">
	<article>
		<h1>About head</h1>

		<p class="lead">
			head turns a handful of facts about a web page into the metadata search engines and social
			platforms read — then writes it out as code for the framework you actually ship.
		</p>

		<h2>One document, nine targets</h2>
		<p>
			Most metadata tools give you a block of HTML and leave the translation to you. This one keeps
			a single document and compiles it to each framework's own idiom: Next.js gets the Metadata API
			and the separate <code>viewport</code> export it requires for
			<code>themeColor</code>, Astro gets <code>set:html</code>, Nuxt gets
			<code>useHead</code>, React Router gets its <code>meta</code> export. The targets are HTML,
			Next.js as both a static export and <code>generateMetadata</code>, SvelteKit, Astro, React
			Helmet, Nuxt, React Router, and raw JSON.
		</p>

		<h2>Why it measures pixels</h2>
		<p>
			Search results truncate by rendered width, not by character count. <code>WWWWW</code> and
			<code>iiiii</code> are five characters each and nowhere near the same width, so a character counter
			tells you very little about whether your title will survive. head measures the string against the
			real budget — roughly 600 pixels for a title, 920 for a description — and shows you the exact text
			that gets shown.
		</p>

		<h2>Structured data you can defend</h2>
		<p>
			Twelve schema.org types compile into a single <code>@graph</code>: Organization, WebSite,
			Article, Product, BreadcrumbList, FAQPage, LocalBusiness, Person, Event, SoftwareApplication,
			VideoObject and HowTo. Empty blocks are dropped rather than emitted, and the editor is
			explicit that markup has to describe what a visitor can actually see — describing content that
			is not on the page is what gets a site penalised.
		</p>

		<h2>Questions</h2>
		<dl class="faq">
			{#each FAQ as item (item.question)}
				<dt>{item.question}</dt>
				<dd>{item.answer}</dd>
			{/each}
		</dl>

		<h2>Contributing</h2>
		<p>
			Adding a framework target is one entry in a single file, and adding a schema.org type is one
			object in a registry — the form is generated from its field descriptors, so neither needs new
			interface code. The
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={REPO_URL} target="_blank" rel="noreferrer noopener">source is on GitHub</a>
			under the MIT license.
		</p>

		<p class="back">
			<a href={resolve('/')}>Open the editor</a>
		</p>
	</article>
</main>

<style>
	.page {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 40px 26px 80px;
	}

	article {
		max-width: 68ch;
		margin: 0 auto;
	}

	h1 {
		margin: 0 0 14px;
		font-size: 26px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	h2 {
		margin: 34px 0 10px;
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--ink-3);
	}

	.lead {
		margin: 0;
		font-size: 15.5px;
		line-height: 1.6;
		color: var(--ink);
	}

	p {
		font-size: 14px;
		line-height: 1.65;
		color: var(--ink-2);
		margin: 0 0 12px;
	}

	code {
		font-family: var(--font-mono);
		font-size: 12.5px;
		color: var(--ink);
	}

	.faq {
		margin: 0;
	}

	dt {
		margin-top: 18px;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink);
	}

	dd {
		margin: 6px 0 0;
		font-size: 14px;
		line-height: 1.65;
		color: var(--ink-2);
	}

	a {
		color: var(--ink);
		text-underline-offset: 3px;
	}

	.back {
		margin-top: 34px;
		padding-top: 18px;
		border-top: 1px solid var(--rule);
	}

	@media (max-width: 620px) {
		.page {
			padding: 28px 18px 60px;
		}
	}
</style>

<script lang="ts">
	import { tick } from 'svelte';
	import { store } from '$lib/state/doc.svelte';
	import { ui } from '$lib/state/ui.svelte';
	import { prefs, X_NAMES, META_NAMES } from '$lib/state/prefs.svelte';
	import { SCHEMA_REGISTRY } from '$lib/seo/schemas';
	import type { Finding, Severity } from '$lib/seo/lint';

	import Section from '$lib/ui/Section.svelte';
	import Chips from '$lib/ui/Chips.svelte';
	import SeoHead from '$lib/ui/SeoHead.svelte';
	import { homeDocument } from '$lib/seo/site';
	import Field from '$lib/ui/Field.svelte';
	import ImageField from '$lib/ui/ImageField.svelte';
	import TagInput from '$lib/ui/TagInput.svelte';
	import Toggle from '$lib/ui/Toggle.svelte';
	import CodePane from '$lib/ui/CodePane.svelte';
	import Previews from '$lib/ui/Previews.svelte';
	import Checks from '$lib/ui/Checks.svelte';
	import SchemaEditor from '$lib/ui/SchemaEditor.svelte';

	const doc = $derived(store.doc);
	const report = $derived(store.audit);

	let schemaToAdd = $state(SCHEMA_REGISTRY[0].type);

	// Persist on every change so a refresh never costs work.
	$effect(() => {
		JSON.stringify(store.doc);
		store.save();
	});

	const SEVERITY_COLOR: Record<Severity, string> = {
		error: 'var(--bad)',
		warn: 'var(--warn)',
		info: 'var(--ink-3)'
	};

	let flashed: HTMLElement | null = null;
	let flashTimer: ReturnType<typeof setTimeout>;

	/**
	 * Opens the section, scrolls the offending control into view, focuses it so
	 * the fix can be typed immediately, and rings it in the finding's own colour
	 * for a moment — focus alone is too quiet to find on a dense form.
	 */
	async function jumpTo(finding: Finding) {
		ui.openSection(finding.section);
		// The target lives inside a section that may have just been opened, so wait
		// for the DOM rather than assuming it is already there.
		await tick();

		const control = finding.field ? document.getElementById(finding.field) : null;
		const anchor = control ?? document.getElementById(finding.section);
		anchor?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		if (!control) return;

		control.focus({ preventScroll: true });

		// A visually hidden checkbox cannot show a ring, so light up its label.
		const ring = control.closest('label') ?? control;

		clearTimeout(flashTimer);
		flashed?.classList.remove('is-flagged');
		ring.classList.add('is-flagged');
		ring.style.setProperty('--flag', SEVERITY_COLOR[finding.severity]);
		flashed = ring;
		flashTimer = setTimeout(() => ring.classList.remove('is-flagged'), 1800);
	}

	const OG_TYPES = ['website', 'article', 'product', 'profile', 'video.other', 'music.song'];
	const TWITTER_CARDS = ['summary_large_image', 'summary', 'player', 'app'] as const;
</script>

<SeoHead doc={homeDocument()} />

<main class="workspace">
	<!-- Visually hidden: the header wordmark already carries the name on screen,
	     but the page had no heading at all for search or screen readers. -->
	<h1 class="sr-only">head — an SEO metadata editor for developers</h1>
	<div class="editor scroll-area">
		<div class="sections-bar">
			<span class="eyebrow">Sections</span>
			<button
				type="button"
				class="btn btn-quiet btn-tiny"
				aria-label={ui.anySectionOpen ? 'Collapse every section' : 'Expand every section'}
				onclick={() => ui.setAllSections(!ui.anySectionOpen)}
			>
				{ui.anySectionOpen ? 'collapse all' : 'expand all'}
			</button>
		</div>

		<Section
			id="core"
			title="Core"
			summary="What search engines read first"
			bind:open={ui.sections.core}
		>
			<Field
				id="f-title"
				label="Title"
				placeholder="Pricing"
				hint="The clickable line in search results. Write the page's own name, not the site's."
				measure="title"
				bind:value={store.doc.title}
			/>

			<Field
				label="Title template"
				placeholder="%s — Northbound"
				hint="Optional. %s is replaced by the title above."
				mono
				bind:value={store.doc.titleTemplate}
			/>

			<Field
				id="f-description"
				label="Description"
				placeholder="One or two sentences that could stand alone under the title."
				hint="Not a ranking factor, but it decides whether anyone clicks."
				multiline
				rows={3}
				measure="description"
				bind:value={store.doc.description}
			/>

			<Field
				id="f-canonical"
				label="Canonical URL"
				type="url"
				placeholder="https://northbound.dev/pricing"
				hint="The one address this content lives at. Must be absolute."
				mono
				bind:value={store.doc.canonical}
			/>

			<div class="grid-2">
				<Field label="Site name" placeholder="Northbound" bind:value={store.doc.siteName} />
				<Field id="f-lang" label="Language" placeholder="en" mono bind:value={store.doc.lang} />
				<Field label="Author" bind:value={store.doc.author} />
				<Field label="Publisher" bind:value={store.doc.publisher} />
			</div>

			<TagInput
				id="f-keywords"
				label="Keywords"
				hint="Google ignores these. Keep them only if an internal search tool reads them."
				bind:values={store.doc.keywords}
			/>
		</Section>

		<Section
			id="indexing"
			title="Indexing"
			summary="Crawl rules and language variants"
			bind:open={ui.sections.indexing}
		>
			<div class="toggles">
				<Toggle id="f-robots-index" label="Index this page" bind:checked={store.doc.robots.index} />
				<Toggle label="Follow its links" bind:checked={store.doc.robots.follow} />
				<Toggle label="No cached copy" bind:checked={store.doc.robots.noarchive} />
				<Toggle label="No text snippet" bind:checked={store.doc.robots.nosnippet} />
				<Toggle label="No image indexing" bind:checked={store.doc.robots.noimageindex} />
				<Toggle label="No translation offer" bind:checked={store.doc.robots.notranslate} />
			</div>

			<div class="grid-2">
				<div class="field">
					<label class="label" for="max-image">Image preview size</label>
					<select id="max-image" class="select" bind:value={store.doc.robots.maxImagePreview}>
						<option value={null}>Not set</option>
						<option value="large">large</option>
						<option value="standard">standard</option>
						<option value="none">none</option>
					</select>
				</div>

				<Field
					label="Unavailable after"
					type="date"
					hint="Drops the page from results on this date."
					bind:value={store.doc.robots.unavailableAfter}
				/>
			</div>

			<div class="repeat" id="f-alternates" tabindex="-1">
				<div class="repeat-head">
					<span class="label">Language alternates</span>
					<button type="button" class="btn btn-quiet btn-tiny" onclick={() => store.addAlternate()}>
						+ Add alternate
					</button>
				</div>

				{#if !doc.alternates.length}
					<p class="hint">
						Only needed when the same content exists at more than one URL per language.
					</p>
				{/if}

				{#each doc.alternates as alt, i (alt.id)}
					<div class="alt-row">
						<input
							class="input is-mono alt-lang"
							placeholder="es-MX"
							aria-label="hreflang for alternate {i + 1}"
							bind:value={alt.hreflang}
						/>
						<input
							class="input is-mono"
							type="url"
							placeholder="https://northbound.dev/es/precios"
							aria-label="URL for alternate {i + 1}"
							bind:value={alt.href}
						/>
						<button
							type="button"
							class="btn btn-quiet btn-tiny"
							aria-label="Remove alternate {i + 1}"
							onclick={() => store.removeAlternate(alt.id)}
						>
							&times;
						</button>
					</div>
				{/each}
			</div>
		</Section>

		<Section
			id="social"
			title="Social"
			summary="How the link looks when shared"
			bind:open={ui.sections.social}
		>
			<div class="grid-2">
				<div class="field">
					<label class="label" for="og-type">Type</label>
					<select id="og-type" class="select" bind:value={store.doc.og.type}>
						{#each OG_TYPES as type (type)}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>

				<div class="field">
					<label class="label" for="tw-card">Card</label>
					<select id="tw-card" class="select" bind:value={store.doc.twitter.card}>
						{#each TWITTER_CARDS as card (card)}
							<option value={card}>{card}</option>
						{/each}
					</select>
				</div>
			</div>

			<ImageField
				id="f-og-image"
				label="Image URL"
				placeholder="https://northbound.dev/og/pricing.png"
				hint="Absolute URL, 1200×630. Crawlers fetch this from their own servers."
				bind:value={store.doc.og.image}
			/>

			<Field
				id="f-og-image-alt"
				label="Image alt text"
				placeholder="A pricing table comparing the Team and Enterprise plans"
				bind:value={store.doc.og.imageAlt}
			/>

			<div class="grid-2">
				<Field
					id="f-og-image-width"
					label="Image width"
					mono
					bind:value={store.doc.og.imageWidth}
				/>
				<Field label="Image height" mono bind:value={store.doc.og.imageHeight} />
			</div>

			<Field
				label="Social title"
				placeholder="Leave empty to reuse the page title"
				bind:value={store.doc.og.title}
			/>

			<Field
				label="Social description"
				placeholder="Leave empty to reuse the description"
				multiline
				rows={2}
				bind:value={store.doc.og.description}
			/>

			<div class="grid-2">
				<Field
					label="{prefs.xName} site handle"
					placeholder="@northbound"
					mono
					bind:value={store.doc.twitter.site}
				/>
				<Field
					label="{prefs.xName} author handle"
					placeholder="@ada"
					mono
					bind:value={store.doc.twitter.creator}
				/>
			</div>

			{#if doc.og.type === 'article'}
				<div class="grid-2">
					<Field
						id="f-og-published"
						label="Published"
						type="date"
						bind:value={store.doc.og.publishedTime}
					/>
					<Field label="Modified" type="date" bind:value={store.doc.og.modifiedTime} />
					<Field label="Article author" bind:value={store.doc.og.author} />
					<Field label="Section" bind:value={store.doc.og.section} />
				</div>
				<TagInput label="Article tags" bind:values={store.doc.og.tags} />
			{/if}
		</Section>

		<Section
			id="structured"
			title="Structured data"
			summary="What earns a rich result"
			count={doc.structuredData.filter((e) => e.enabled).length}
			bind:open={ui.sections.structured}
		>
			<div class="add-schema">
				<select
					id="f-add-schema"
					class="select"
					aria-label="Schema type to add"
					bind:value={schemaToAdd}
				>
					{#each SCHEMA_REGISTRY as def (def.type)}
						<option value={def.type}>{def.label}</option>
					{/each}
				</select>
				<button type="button" class="btn" onclick={() => store.addSchema(schemaToAdd)}>
					Add block
				</button>
			</div>

			{#if !doc.structuredData.length}
				<p class="hint">
					Only describe what is actually on the page. Marking up content a visitor cannot see is
					what gets a site penalized.
				</p>
			{/if}

			{#each doc.structuredData as entry, i (entry.id)}
				<SchemaEditor
					bind:entry={store.doc.structuredData[i]}
					onRemove={() => store.removeSchema(entry.id)}
				/>
			{/each}
		</Section>

		<Section
			id="site"
			title="Site"
			summary="Icons, theme, ownership proofs"
			bind:open={ui.sections.site}
		>
			<div class="grid-2">
				<Field
					label="Favicon"
					type="url"
					mono
					placeholder="/favicon.ico"
					bind:value={store.doc.icons.favicon}
				/>
				<Field
					label="Apple touch icon"
					type="url"
					mono
					placeholder="/apple-touch-icon.png"
					bind:value={store.doc.icons.appleTouchIcon}
				/>
				<Field
					label="Web manifest"
					type="url"
					mono
					placeholder="/site.webmanifest"
					bind:value={store.doc.icons.manifest}
				/>
				<Field label="Theme color" mono placeholder="#14161a" bind:value={store.doc.themeColor} />
				<Field
					label="Color scheme"
					mono
					placeholder="light dark"
					bind:value={store.doc.colorScheme}
				/>
				<Field
					label="Referrer policy"
					mono
					placeholder="strict-origin-when-cross-origin"
					bind:value={store.doc.referrer}
				/>
			</div>

			<div class="grid-2">
				<Field label="Google verification" mono bind:value={store.doc.verification.google} />
				<Field label="Bing verification" mono bind:value={store.doc.verification.bing} />
				<Field label="Yandex verification" mono bind:value={store.doc.verification.yandex} />
				<Field label="Pinterest verification" mono bind:value={store.doc.verification.pinterest} />
			</div>
		</Section>

		<footer class="editor-foot">
			<p class="hint">
				Everything stays in this browser. Nothing is uploaded except the brief you send to a model,
				and only when you ask for it.
			</p>

			<div class="controls">
				<span class="eyebrow">Controls</span>

				<div class="control">
					<span class="label">Call the platform</span>
					<Chips items={X_NAMES} bind:value={prefs.xName} label="Name for the X platform" />
				</div>

				<div class="control">
					<span class="label">Call the network</span>
					<Chips
						items={META_NAMES}
						bind:value={prefs.metaName}
						label="Name for the Facebook network"
					/>
				</div>

				<p class="hint">
					Labels in this editor only. The emitted tags stay <code>twitter:</code> — that name is fixed
					by the card spec, and renaming it would stop the card from rendering.
				</p>
			</div>
		</footer>
	</div>

	<div class="output scroll-area">
		<CodePane {doc} bind:targetId={ui.targetId} />

		<div class="panel side-panel">
			<Checks audit={report} onJump={jumpTo} />
		</div>

		<Previews {doc} />
	</div>
</main>

<style>
	.workspace {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		/*
			Without an explicit row the implicit one is auto-sized, so it grows to
			the taller column's content instead of the container. The columns then
			never get constrained, their overflow-y never engages, and the shell
			clips the excess with no scrollbar — content just disappears mid-element.
			minmax(0, 1fr) pins the row to the container and lets the columns shrink.
		*/
		grid-template-rows: minmax(0, 1fr);
	}

	.editor {
		overflow-y: auto;
		padding: 4px 26px 60px;
		border-right: 1px solid var(--rule);
	}

	.output {
		overflow-y: auto;
		padding: 20px 26px 60px;
		display: grid;
		gap: 20px;
		align-content: start;
		background: var(--paper-sunk);
	}

	.side-panel {
		padding: 14px 15px;
	}

	/* Present for search engines and screen readers, absent on screen. */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	/* Mirrors the section header rhythm so the toggle reads as part of the list. */
	.sections-bar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 0 10px;
	}

	.grid-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.field {
		display: grid;
		gap: 5px;
	}

	.toggles {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 9px 16px;
	}

	.repeat {
		display: grid;
		gap: 8px;
	}

	.repeat-head,
	.add-schema {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.repeat-head {
		justify-content: space-between;
	}

	.add-schema .select {
		flex: 1;
	}

	.alt-row {
		display: grid;
		grid-template-columns: 96px 1fr auto;
		gap: 7px;
		align-items: center;
	}

	.alt-lang {
		text-align: center;
	}

	.editor-foot {
		padding-top: 20px;
		max-width: 72ch;
	}

	.editor-foot p {
		margin: 0;
	}

	.controls {
		display: grid;
		gap: 9px;
		margin-top: 18px;
		padding-top: 15px;
		border-top: 1px solid var(--rule);
	}

	.control {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px 12px;
	}

	.control .label {
		flex: none;
	}

	code {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--ink-2);
	}

	@media (max-width: 1000px) {
		.workspace {
			grid-template-columns: 1fr;
			/* Stacked, and the shell is auto-height here — the page itself scrolls. */
			grid-template-rows: none;
		}

		.editor,
		.output {
			overflow: visible;
			border-right: 0;
			padding-left: 18px;
			padding-right: 18px;
		}

		.output {
			border-top: 1px solid var(--rule);
		}
	}

	@media (max-width: 620px) {
		.grid-2,
		.toggles {
			grid-template-columns: 1fr;
		}
	}
</style>

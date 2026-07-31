import type { ProviderId } from '$lib/state/settings.svelte';

export type Brief = {
	/** What the page is about. The only field the user must fill in. */
	subject: string;
	audience: string;
	tone: string;
	language: string;
	url: string;
	siteName: string;
	pageType: string;
	keywords: string[];
	wantFaq: boolean;
};

export type GenerateRequest = {
	provider: ProviderId;
	apiKey: string;
	brief: Brief;
};

export type AiDraft = {
	title: string;
	description: string;
	keywords: string[];
	ogTitle: string;
	ogDescription: string;
	ogImageAlt: string;
	twitterTitle: string;
	twitterDescription: string;
	faq: { question: string; answer: string }[];
	notes: string;
};

export type GenerateResponse = { draft: AiDraft } | { error: string };

export function emptyBrief(): Brief {
	return {
		subject: '',
		audience: '',
		tone: 'plain and direct',
		language: 'English',
		url: '',
		siteName: '',
		pageType: 'landing page',
		keywords: [],
		wantFaq: false
	};
}

export const PAGE_TYPES = [
	'landing page',
	'product page',
	'pricing page',
	'blog post',
	'documentation page',
	'category listing',
	'about page',
	'contact page',
	'local business page'
];

/**
 * The output contract, shared by both providers.
 *
 * Every property is required and `additionalProperties` is false so OpenAI's
 * strict mode accepts it; the model returns "" or [] for anything it should
 * leave alone rather than omitting the key.
 */
export const DRAFT_SCHEMA = {
	type: 'object',
	properties: {
		title: {
			type: 'string',
			description:
				'The page title. Aim for 50-60 characters. No site name unless it earns the space.'
		},
		description: {
			type: 'string',
			description: 'Meta description, 140-158 characters, one or two sentences, active voice.'
		},
		keywords: {
			type: 'array',
			items: { type: 'string' },
			description: 'Between 3 and 8 terms a person would actually type. Empty array if none fit.'
		},
		ogTitle: {
			type: 'string',
			description:
				'Social title. May be punchier than the search title. Empty string to reuse the title.'
		},
		ogDescription: {
			type: 'string',
			description:
				'Social description, up to 200 characters. Empty string to reuse the description.'
		},
		ogImageAlt: {
			type: 'string',
			description: 'Alt text describing what the social share image should show.'
		},
		twitterTitle: { type: 'string', description: 'Empty string to reuse the social title.' },
		twitterDescription: {
			type: 'string',
			description: 'Empty string to reuse the social description.'
		},
		faq: {
			type: 'array',
			description: 'Questions and answers. Empty array unless FAQ content was requested.',
			items: {
				type: 'object',
				properties: {
					question: { type: 'string' },
					answer: { type: 'string' }
				},
				required: ['question', 'answer'],
				additionalProperties: false
			}
		},
		notes: {
			type: 'string',
			description:
				'One or two sentences on the angle taken, or a gap in the brief worth filling. Empty string if there is nothing worth saying.'
		}
	},
	required: [
		'title',
		'description',
		'keywords',
		'ogTitle',
		'ogDescription',
		'ogImageAlt',
		'twitterTitle',
		'twitterDescription',
		'faq',
		'notes'
	],
	additionalProperties: false
} as const;

export const SYSTEM_PROMPT = `You write search and social metadata for web pages.

Write for the person reading the search result, not for a crawler. Name the thing plainly, lead with what the page actually offers, and prefer a concrete noun over a category word. Use active voice and sentence case.

Hard constraints:
- Title: 50-60 characters. It gets cut off past roughly 600 pixels, so avoid strings of wide capitals.
- Description: 140-158 characters. Write one or two complete sentences that could stand alone under the title.
- Never keyword-stuff. A term belongs in the copy only where it reads naturally.
- Never invent facts about the product: no prices, counts, dates, awards, or claims that were not in the brief.
- Match the requested output language exactly. If the brief is written in Spanish, the metadata is in Spanish.

Leave a field as an empty string when the value should simply fall back to the field above it. An empty ogTitle means "reuse the title" and is often the right answer; do not restate the same sentence twice just to fill the slot.`;

export function buildUserPrompt(brief: Brief): string {
	const lines: string[] = [];
	lines.push(`Page subject: ${brief.subject.trim()}`);
	lines.push(`Page type: ${brief.pageType}`);
	lines.push(`Output language: ${brief.language}`);
	if (brief.siteName.trim()) lines.push(`Site name: ${brief.siteName.trim()}`);
	if (brief.url.trim()) lines.push(`URL: ${brief.url.trim()}`);
	if (brief.audience.trim()) lines.push(`Audience: ${brief.audience.trim()}`);
	if (brief.tone.trim()) lines.push(`Tone: ${brief.tone.trim()}`);
	if (brief.keywords.length) {
		lines.push(`Terms to work in where they read naturally: ${brief.keywords.join(', ')}`);
	}
	lines.push(
		brief.wantFaq
			? 'Also write 3 to 5 FAQ entries. Each answer is 1-3 sentences and answers the question directly in its first clause.'
			: 'Return an empty faq array.'
	);
	return lines.join('\n');
}

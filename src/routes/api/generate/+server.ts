import { json, type RequestHandler } from '@sveltejs/kit';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {
	buildUserPrompt,
	DRAFT_SCHEMA,
	SYSTEM_PROMPT,
	type AiDraft,
	type Brief,
	type GenerateRequest
} from '$lib/ai/contract';

/**
 * Bring-your-own-key proxy.
 *
 * The key arrives on each request, is used once, and is never written to disk,
 * logs, or a session. It exists here only so the browser does not have to make
 * a cross-origin call to a provider that would reject it.
 */

const MAX_TOKENS = 8000;

function badRequest(message: string) {
	return json({ error: message }, { status: 400 });
}

function normalizeDraft(raw: unknown): AiDraft {
	const d = (raw ?? {}) as Record<string, unknown>;
	const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
	const arr = (v: unknown) =>
		Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && !!x.trim()) : [];

	return {
		title: str(d.title),
		description: str(d.description),
		keywords: arr(d.keywords),
		ogTitle: str(d.ogTitle),
		ogDescription: str(d.ogDescription),
		ogImageAlt: str(d.ogImageAlt),
		twitterTitle: str(d.twitterTitle),
		twitterDescription: str(d.twitterDescription),
		faq: Array.isArray(d.faq)
			? d.faq
					.map((item) => {
						const row = (item ?? {}) as Record<string, unknown>;
						return { question: str(row.question), answer: str(row.answer) };
					})
					.filter((q) => q.question && q.answer)
			: [],
		notes: str(d.notes)
	};
}

async function runAnthropic(apiKey: string, brief: Brief): Promise<AiDraft> {
	const client = new Anthropic({ apiKey });

	const params = {
		model: 'claude-opus-5',
		max_tokens: MAX_TOKENS,
		// Medium keeps this snappy; metadata writing does not reward deep deliberation.
		output_config: {
			effort: 'medium' as const,
			format: { type: 'json_schema' as const, schema: DRAFT_SCHEMA }
		},
		system: SYSTEM_PROMPT,
		messages: [{ role: 'user' as const, content: buildUserPrompt(brief) }]
	};

	let response;
	try {
		// Opus 5 classifiers can decline a request; `fallbacks` re-runs it server-side.
		response = await client.beta.messages.create({
			...params,
			betas: ['server-side-fallback-2026-07-01'],
			fallbacks: 'default'
		} as never);
	} catch (error) {
		// Keys without the fallback beta entitlement get the plain request instead.
		if (error instanceof Anthropic.BadRequestError) {
			response = await client.messages.create(params as never);
		} else {
			throw error;
		}
	}

	const message = response as Anthropic.Message;

	if (message.stop_reason === 'refusal') {
		throw new Error('The model declined this request. Rewrite the page subject and try again.');
	}
	if (message.stop_reason === 'max_tokens') {
		throw new Error('The response was cut off before it was valid. Shorten the brief.');
	}

	const text = message.content
		.filter((block): block is Anthropic.TextBlock => block.type === 'text')
		.map((block) => block.text)
		.join('');

	if (!text.trim()) throw new Error('The model returned an empty response.');
	return normalizeDraft(JSON.parse(text));
}

async function runOpenAI(apiKey: string, brief: Brief): Promise<AiDraft> {
	const client = new OpenAI({ apiKey });

	const completion = await client.chat.completions.create({
		model: 'gpt-4.1',
		max_tokens: MAX_TOKENS,
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT },
			{ role: 'user', content: buildUserPrompt(brief) }
		],
		response_format: {
			type: 'json_schema',
			json_schema: {
				name: 'seo_draft',
				strict: true,
				schema: DRAFT_SCHEMA as unknown as Record<string, unknown>
			}
		}
	});

	const choice = completion.choices[0];
	if (choice?.finish_reason === 'length') {
		throw new Error('The response was cut off before it was valid. Shorten the brief.');
	}
	if (choice?.message.refusal) {
		throw new Error(choice.message.refusal);
	}

	const text = choice?.message.content ?? '';
	if (!text.trim()) throw new Error('The model returned an empty response.');
	return normalizeDraft(JSON.parse(text));
}

/** Turns provider SDK errors into something a person can act on. */
function describeError(error: unknown): { message: string; status: number } {
	if (error instanceof Anthropic.APIError || error instanceof OpenAI.APIError) {
		const status = error.status ?? 502;
		if (status === 401) return { message: 'That API key was rejected.', status: 401 };
		if (status === 403) {
			return { message: 'That key does not have access to this model.', status: 403 };
		}
		if (status === 429) {
			return { message: 'Rate limited by the provider. Wait a moment and retry.', status: 429 };
		}
		if (status >= 500) {
			return { message: 'The provider is unavailable right now. Retry shortly.', status: 502 };
		}
		return { message: error.message, status };
	}
	if (error instanceof SyntaxError) {
		return { message: 'The model returned malformed JSON. Retry.', status: 502 };
	}
	if (error instanceof Error) return { message: error.message, status: 500 };
	return { message: 'Generation failed.', status: 500 };
}

export const POST: RequestHandler = async ({ request }) => {
	let body: GenerateRequest;
	try {
		body = await request.json();
	} catch {
		return badRequest('Malformed request body.');
	}

	const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
	if (!apiKey) return badRequest('Add an API key in Settings first.');

	const brief = body.brief;
	if (!brief || typeof brief.subject !== 'string' || !brief.subject.trim()) {
		return badRequest('Describe what the page is about before generating.');
	}
	if (brief.subject.length > 4000) {
		return badRequest('The page subject is too long. Keep it under 4000 characters.');
	}

	try {
		const draft =
			body.provider === 'openai'
				? await runOpenAI(apiKey, brief)
				: await runAnthropic(apiKey, brief);
		return json({ draft });
	} catch (error) {
		const { message, status } = describeError(error);
		return json({ error: message }, { status });
	}
};

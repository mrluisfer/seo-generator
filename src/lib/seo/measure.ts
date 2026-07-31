/**
 * Approximate pixel width of a string as Google renders it.
 *
 * Search results truncate by pixel width, not character count, so "58 characters"
 * tells you almost nothing: `WWWWW` and `iiiii` are the same count and nowhere
 * near the same width. The table below holds Arial advance widths (units per em)
 * for the characters that actually differ; anything unlisted falls back to the
 * average lowercase width.
 */

const WIDTHS: Record<string, number> = {
	' ': 0.278,
	'!': 0.278,
	'"': 0.355,
	'#': 0.556,
	$: 0.556,
	'%': 0.889,
	'&': 0.667,
	"'": 0.191,
	'(': 0.333,
	')': 0.333,
	'*': 0.389,
	'+': 0.584,
	',': 0.278,
	'-': 0.333,
	'.': 0.278,
	'/': 0.278,
	':': 0.278,
	';': 0.278,
	'<': 0.584,
	'=': 0.584,
	'>': 0.584,
	'?': 0.556,
	'@': 1.015,
	'[': 0.278,
	'\\': 0.278,
	']': 0.278,
	'^': 0.469,
	_: 0.556,
	'`': 0.333,
	'{': 0.334,
	'|': 0.26,
	'}': 0.334,
	'~': 0.584,
	'–': 0.556,
	'—': 1.0,
	'·': 0.278,
	'…': 1.0,
	i: 0.222,
	j: 0.222,
	l: 0.222,
	f: 0.278,
	t: 0.278,
	r: 0.333,
	I: 0.278,
	J: 0.5,
	m: 0.833,
	w: 0.722,
	M: 0.833,
	W: 0.944
};

const DEFAULT_LOWER = 0.556;
const DEFAULT_UPPER = 0.667;
const DIGIT = 0.556;

function advance(char: string): number {
	const known = WIDTHS[char];
	if (known !== undefined) return known;
	if (char >= '0' && char <= '9') return DIGIT;
	if (char >= 'A' && char <= 'Z') return DEFAULT_UPPER;
	// Wide CJK and fullwidth forms occupy a full em.
	if (char.charCodeAt(0) > 0x2e80) return 1.0;
	return DEFAULT_LOWER;
}

export function pixelWidth(text: string, fontSize: number): number {
	let total = 0;
	for (const char of text) total += advance(char) * fontSize;
	return Math.round(total);
}

/**
 * How Google renders each field in a desktop result.
 *
 * The font sizes must match the ones the SERP preview renders at, or the gauge
 * and the preview disagree about the same string. They also have to reproduce
 * the documented pairings: 600px ≈ 60 title characters at 20px, and 920px ≈ 158
 * description characters at 13px. Measuring the description at 14px puts the
 * cutoff at 147 characters and flags ordinary copy as truncated.
 */
export const LIMITS = {
	title: { fontSize: 20, maxPx: 600, softChars: 60 },
	description: { fontSize: 13, maxPx: 920, softChars: 158 }
} as const;

export type Fit = {
	px: number;
	maxPx: number;
	/** 0–1+. Above 1 means the text is cut off in results. */
	ratio: number;
	overflows: boolean;
	/** The text as it will actually appear, ellipsis included. */
	truncated: string;
};

export function fit(text: string, limit: { fontSize: number; maxPx: number }): Fit {
	const px = pixelWidth(text, limit.fontSize);
	const overflows = px > limit.maxPx;
	let truncated = text;

	if (overflows) {
		const ellipsisPx = pixelWidth('…', limit.fontSize);
		let width = 0;
		let cut = 0;
		const chars = [...text];
		for (let i = 0; i < chars.length; i++) {
			const next = width + advance(chars[i]) * limit.fontSize;
			if (next > limit.maxPx - ellipsisPx) break;
			width = next;
			cut = i + 1;
		}
		// Prefer cutting on a word boundary, the way search engines do.
		const head = chars.slice(0, cut).join('');
		const lastSpace = head.lastIndexOf(' ');
		truncated = (lastSpace > 20 ? head.slice(0, lastSpace) : head).trimEnd() + '…';
	}

	return {
		px,
		maxPx: limit.maxPx,
		ratio: px / limit.maxPx,
		overflows,
		truncated
	};
}

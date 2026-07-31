import { describe, expect, it } from 'vitest';
import { fit, LIMITS, pixelWidth } from './measure';

/**
 * The gauge is the app's central claim: it measures the way search results
 * truncate, in pixels, rather than counting characters. These tests pin the
 * calibration, because a wrong font size silently mislabels ordinary copy as
 * cut off — which is exactly the bug this suite was written after.
 */

describe('pixelWidth', () => {
	it('scales linearly with font size', () => {
		expect(pixelWidth('hello world', 20)).toBeCloseTo(pixelWidth('hello world', 10) * 2, 0);
	});

	it('distinguishes narrow from wide characters', () => {
		// A character counter cannot tell these apart; that is the whole point.
		expect('iiiii'.length).toBe('WWWWW'.length);
		expect(pixelWidth('iiiii', 20)).toBeLessThan(pixelWidth('WWWWW', 20) / 3);
	});

	it('treats CJK as full width', () => {
		expect(pixelWidth('日本語', 20)).toBe(60);
	});

	it('is zero for the empty string', () => {
		expect(pixelWidth('', 20)).toBe(0);
	});
});

describe('limits match the documented pixel/character pairings', () => {
	// Roughly average English prose — the basis for the published guidance.
	const prose =
		'A complete guide to structured data: what Google reads, which types earn rich results, and how to validate your markup.';

	it('a 60-character title lands near the 600px limit', () => {
		// The published guidance pairs ~60 characters with 600px. Asserting the
		// measured width of a real 60-character title pins the font size, which a
		// character-count range is too loose to do.
		const title = 'Pricing for growing engineering teams — Northbound Tools';
		expect(title.length).toBeGreaterThanOrEqual(55);
		expect(title.length).toBeLessThanOrEqual(62);

		const px = pixelWidth(title, LIMITS.title.fontSize);
		expect(px).toBeGreaterThan(LIMITS.title.maxPx * 0.8);
		expect(px).toBeLessThanOrEqual(LIMITS.title.maxPx);
	});

	it('920px at 13px fits about 155 description characters', () => {
		const perChar = pixelWidth(prose, LIMITS.description.fontSize) / prose.length;
		const chars = Math.floor(LIMITS.description.maxPx / perChar);
		// At 14px this lands near 147 and flags ordinary copy as truncated.
		expect(chars).toBeGreaterThanOrEqual(150);
		expect(chars).toBeLessThanOrEqual(165);
	});

	it('does not flag a description of the length everyone recommends', () => {
		const typical =
			'Flat per-seat pricing with no usage metering or overage bills. Compare the Team and Enterprise plans, or start a 14-day trial without a credit card.';
		expect(typical.length).toBeGreaterThan(140);
		expect(fit(typical, LIMITS.description).overflows).toBe(false);
	});
});

describe('fit', () => {
	it('reports no overflow and returns the text unchanged when it fits', () => {
		const result = fit('Short title', LIMITS.title);
		expect(result.overflows).toBe(false);
		expect(result.truncated).toBe('Short title');
		expect(result.ratio).toBeLessThan(1);
	});

	it('truncates on a word boundary and appends an ellipsis', () => {
		const result = fit('word '.repeat(60).trim(), LIMITS.title);
		expect(result.overflows).toBe(true);
		expect(result.truncated.endsWith('…')).toBe(true);
		expect(result.truncated).not.toContain('wor…');
	});

	it('keeps the truncated string inside the budget', () => {
		const result = fit('Northbound '.repeat(20), LIMITS.title);
		expect(pixelWidth(result.truncated, LIMITS.title.fontSize)).toBeLessThanOrEqual(
			LIMITS.title.maxPx
		);
	});
});

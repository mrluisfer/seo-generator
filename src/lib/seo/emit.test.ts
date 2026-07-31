import { describe, expect, it } from 'vitest';
import { TARGETS } from './emit';
import { emptyDocument } from './defaults';
import { hostileDocument, POISON } from './test-fixtures';

/**
 * These guard the property that matters most: the generated file must be valid
 * in its own language no matter what the user typed. Every bug this suite has
 * caught so far was an escaping bug, so that is what it leans on.
 */

const doc = hostileDocument();

describe('every target', () => {
	it.each(TARGETS.map((t) => [t.label, t] as const))('%s emits something', (_label, target) => {
		expect(target.emit(doc).trim()).not.toBe('');
	});

	it.each(TARGETS.map((t) => [t.label, t] as const))(
		'%s carries the document content through',
		(_label, target) => {
			expect(target.emit(doc)).toContain('HOSTILE');
		}
	);

	it.each(TARGETS.filter((t) => t.id !== 'json').map((t) => [t.label, t] as const))(
		'%s escapes a raw </script> from the data',
		(_label, target) => {
			// `json` is a data file rather than markup, so a raw </script> is correct there.
			expect(target.emit(doc)).not.toContain('</script> HOSTILE');
		}
	);

	it.each(TARGETS.map((t) => [t.label, t] as const))(
		'%s does not emit a self-cancelling escape',
		(_label, target) => {
			// `'<'` in generated source parses as `<`, so the replace would be a
			// no-op. Only a doubled backslash survives into the running program.
			for (const call of target.emit(doc).match(/\.replace\(\/<\/g,\s*(['"]).*?\1\)/g) ?? []) {
				expect(call).toContain('\\\\u003c');
			}
		}
	);
});

describe('an empty document', () => {
	const empty = emptyDocument();

	it.each(TARGETS.map((t) => [t.label, t] as const))(
		'%s still produces output',
		(_label, target) => {
			expect(target.emit(empty).trim()).not.toBe('');
		}
	);
});

describe('the JSON target', () => {
	const json = TARGETS.find((t) => t.id === 'json')!;

	it('parses as JSON', () => {
		expect(() => JSON.parse(json.emit(doc))).not.toThrow();
	});

	it('round-trips the document verbatim', () => {
		expect(JSON.parse(json.emit(doc))).toEqual(doc);
	});

	it('keeps the raw </script>, because it is data and not markup', () => {
		expect(json.emit(doc)).toContain(POISON);
	});
});

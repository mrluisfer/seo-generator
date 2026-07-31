/** Prints JavaScript object literals for the code-emitting targets. */

export class Raw {
	constructor(public readonly code: string) {}
}

export function raw(code: string): Raw {
	return new Raw(code);
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function quote(value: string): string {
	const escaped = value
		.replace(/\\/g, '\\\\')
		.replace(/'/g, "\\'")
		.replace(/\n/g, '\\n')
		.replace(/\r/g, '\\r')
		.replace(/\t/g, '\\t')
		// `<` is escaped so a value containing `</script>` cannot terminate the
		// <script> block of a Svelte or Vue single-file component.
		.replace(/</g, '\\u003c');
	return `'${escaped}'`;
}

/** Recursively drops undefined, empty strings, empty arrays, and empty objects. */
export function compact<T>(value: T): T | undefined {
	if (value instanceof Raw) return value as T;
	if (value === undefined || value === null) return undefined;
	if (typeof value === 'string') return value.trim() ? (value as T) : undefined;
	if (Array.isArray(value)) {
		const items = value.map(compact).filter((v) => v !== undefined);
		return items.length ? (items as T) : undefined;
	}
	if (typeof value === 'object') {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			const c = compact(v);
			if (c !== undefined) out[k] = c;
		}
		return Object.keys(out).length ? (out as T) : undefined;
	}
	return value;
}

export function printJs(value: unknown, depth = 0, indent = '\t'): string {
	const pad = indent.repeat(depth);
	const padInner = indent.repeat(depth + 1);

	if (value instanceof Raw) return value.code;
	if (value === null) return 'null';
	if (typeof value === 'string') return quote(value);
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);

	if (Array.isArray(value)) {
		if (!value.length) return '[]';
		const scalar = value.every((v) => typeof v === 'string' && v.length < 32);
		if (scalar && value.length <= 6) {
			return `[${value.map((v) => printJs(v, depth, indent)).join(', ')}]`;
		}
		const items = value.map((v) => `${padInner}${printJs(v, depth + 1, indent)}`);
		return `[\n${items.join(',\n')}\n${pad}]`;
	}

	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>).filter(
			([, v]) => v !== undefined
		);
		if (!entries.length) return '{}';
		const body = entries.map(([k, v]) => {
			const key = IDENT.test(k) ? k : quote(k);
			return `${padInner}${key}: ${printJs(v, depth + 1, indent)}`;
		});
		return `{\n${body.join(',\n')}\n${pad}}`;
	}

	return 'undefined';
}

/** Same shape as printJs but with JSON key quoting, for `<script type="application/ld+json">`. */
export function printJson(value: unknown, indent = '\t'): string {
	return JSON.stringify(value, null, indent);
}

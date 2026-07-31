/**
 * A small tokenizer for the output pane.
 *
 * The app only ever highlights code it generated itself, so a full grammar is
 * unnecessary — five token classes cover every target and keep the bundle free
 * of a syntax-highlighting dependency.
 */

type Lang = 'html' | 'ts' | 'tsx' | 'svelte' | 'astro' | 'json';

const MARKUP: Lang[] = ['html', 'svelte', 'astro'];

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

const MARKUP_PATTERN = new RegExp(
	[
		'(?<comment><!--[\\s\\S]*?-->)',
		'(?<string>"[^"\\n]*"|\'[^\'\\n]*\')',
		'(?<tag></?[a-zA-Z][\\w:.-]*)',
		'(?<attr>[a-zA-Z_:@][\\w:.-]*(?=\\s*=))',
		'(?<punct>[<>/=]+)'
	].join('|'),
	'g'
);

const CODE_PATTERN = new RegExp(
	[
		'(?<comment>//[^\\n]*|/\\*[\\s\\S]*?\\*/)',
		'(?<string>`[^`]*`|"[^"\\n]*"|\'[^\'\\n]*\')',
		'(?<keyword>\\b(?:import|export|from|const|let|var|type|interface|return|function|async|await|new|default|as|true|false|null|undefined)\\b)',
		'(?<punct>[{}\\[\\]().,;:]+)'
	].join('|'),
	'g'
);

export function highlight(code: string, lang: Lang): string {
	const pattern = MARKUP.includes(lang) ? MARKUP_PATTERN : CODE_PATTERN;
	pattern.lastIndex = 0;

	let out = '';
	let last = 0;
	let match: RegExpExecArray | null;

	while ((match = pattern.exec(code)) !== null) {
		if (match.index > last) out += escapeHtml(code.slice(last, match.index));
		const groups = match.groups ?? {};
		const kind = Object.keys(groups).find((k) => groups[k] !== undefined);
		const text = escapeHtml(match[0]);
		out += kind ? `<span class="tok-${kind}">${text}</span>` : text;
		last = match.index + match[0].length;
	}

	if (last < code.length) out += escapeHtml(code.slice(last));
	return out;
}

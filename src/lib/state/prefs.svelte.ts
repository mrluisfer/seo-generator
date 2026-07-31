import { browser } from '$app/environment';

/**
 * Display preferences — things that change how the editor reads, never what it
 * emits. Kept apart from the ui store, which is ephemeral, and from the
 * document, which is the thing being authored.
 *
 * Both settings here exist because these companies renamed themselves and the
 * old names stuck: people who say "Twitter" and people who say "X" are both
 * right, and the editor should not argue with either.
 */

export type XName = 'X' | 'Twitter';
export type MetaName = 'Facebook' | 'Meta';

export const X_NAMES = [
	{ id: 'X', label: 'X' },
	{ id: 'Twitter', label: 'Twitter' }
] as const;

export const META_NAMES = [
	{ id: 'Facebook', label: 'Facebook' },
	{ id: 'Meta', label: 'Meta' }
] as const;

/** Reads a stored value, falling back when storage is blocked or holds junk. */
function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
	if (!browser) return fallback;
	try {
		const stored = localStorage.getItem(key);
		if (stored && (allowed as readonly string[]).includes(stored)) return stored as T;
	} catch {
		// Storage blocked — the default is fine.
	}
	return fallback;
}

function write(key: string, value: string) {
	if (!browser) return;
	try {
		localStorage.setItem(key, value);
	} catch {
		// Not persisting is survivable; the choice still holds this session.
	}
}

const X_KEY = 'seo-generator:x-name';
const META_KEY = 'seo-generator:meta-name';

class Prefs {
	#xName = $state<XName>(read(X_KEY, ['X', 'Twitter'], 'X'));
	#metaName = $state<MetaName>(read(META_KEY, ['Facebook', 'Meta'], 'Facebook'));

	/**
	 * Accessor pairs rather than plain fields, so `bind:` persists the choice
	 * without every caller having to remember to.
	 */
	get xName(): XName {
		return this.#xName;
	}

	set xName(value: XName) {
		this.#xName = value;
		write(X_KEY, value);
	}

	get metaName(): MetaName {
		return this.#metaName;
	}

	set metaName(value: MetaName) {
		this.#metaName = value;
		write(META_KEY, value);
	}
}

export const prefs = new Prefs();

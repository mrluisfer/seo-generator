import { browser } from '$app/environment';

export type ThemeMode = 'system' | 'light' | 'dark';

/** Cycle order for the topbar toggle. */
export const MODES: ThemeMode[] = ['system', 'light', 'dark'];

/** Must match the bootstrap script in app.html, which runs before first paint. */
export const THEME_KEY = 'seo-generator:theme';

function read(): ThemeMode {
	if (!browser) return 'system';
	try {
		const stored = localStorage.getItem(THEME_KEY);
		if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
	} catch {
		// Storage blocked — fall back to following the OS.
	}
	return 'system';
}

class Theme {
	mode = $state<ThemeMode>(read());

	get next(): ThemeMode {
		return MODES[(MODES.indexOf(this.mode) + 1) % MODES.length];
	}

	cycle() {
		this.mode = this.next;

		if (!browser) return;
		const root = document.documentElement;
		// No attribute means "inherit from the OS", which is what the CSS
		// defaults to via light-dark().
		if (this.mode === 'system') root.removeAttribute('data-theme');
		else root.dataset.theme = this.mode;

		try {
			localStorage.setItem(THEME_KEY, this.mode);
		} catch {
			// Not persisting is survivable; the choice still applies this session.
		}
	}
}

export const theme = new Theme();

import { browser } from '$app/environment';

export type ProviderId = 'anthropic' | 'openai';

export type ProviderInfo = {
	id: ProviderId;
	label: string;
	model: string;
	keyPrefix: string;
	keyHint: string;
	consoleUrl: string;
};

export const PROVIDERS: ProviderInfo[] = [
	{
		id: 'anthropic',
		label: 'Claude',
		model: 'claude-opus-5',
		keyPrefix: 'sk-ant-',
		keyHint: 'sk-ant-…',
		consoleUrl: 'https://console.anthropic.com/settings/keys'
	},
	{
		id: 'openai',
		label: 'OpenAI',
		model: 'gpt-4.1',
		keyPrefix: 'sk-',
		keyHint: 'sk-…',
		consoleUrl: 'https://platform.openai.com/api-keys'
	}
];

const STORAGE_KEY = 'seo-generator:keys';

type Stored = {
	provider: ProviderId;
	keys: Partial<Record<ProviderId, string>>;
};

function read(): Stored {
	if (!browser) return { provider: 'anthropic', keys: {} };
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		if (parsed && typeof parsed === 'object') {
			return {
				provider: parsed.provider === 'openai' ? 'openai' : 'anthropic',
				keys: typeof parsed.keys === 'object' && parsed.keys ? parsed.keys : {}
			};
		}
	} catch {
		// Corrupt entry — start clean rather than trapping the user on a broken state.
	}
	return { provider: 'anthropic', keys: {} };
}

const initial = read();

class Settings {
	provider = $state<ProviderId>(initial.provider);
	keys = $state<Partial<Record<ProviderId, string>>>(initial.keys);

	get info(): ProviderInfo {
		return PROVIDERS.find((p) => p.id === this.provider) ?? PROVIDERS[0];
	}

	get key(): string {
		return this.keys[this.provider]?.trim() ?? '';
	}

	get hasKey(): boolean {
		return this.key.length > 0;
	}

	setKey(provider: ProviderId, value: string) {
		this.keys = { ...this.keys, [provider]: value };
		this.save();
	}

	clearKey(provider: ProviderId) {
		const next = { ...this.keys };
		delete next[provider];
		this.keys = next;
		this.save();
	}

	setProvider(provider: ProviderId) {
		this.provider = provider;
		this.save();
	}

	save() {
		if (!browser) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider: this.provider, keys: this.keys }));
	}
}

export const settings = new Settings();

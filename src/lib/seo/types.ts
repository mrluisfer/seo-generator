/**
 * The canonical SEO model.
 *
 * Everything in the app derives from this one object: the emitters serialize it,
 * the linter grades it, the previews render it, and the AI fills it. Adding a
 * field here is the only place a new capability needs to be declared.
 */

export type RobotsDirectives = {
	index: boolean;
	follow: boolean;
	noarchive: boolean;
	nosnippet: boolean;
	noimageindex: boolean;
	notranslate: boolean;
	/** -1 means "no limit". null means "don't emit". */
	maxSnippet: number | null;
	maxImagePreview: 'none' | 'standard' | 'large' | null;
	maxVideoPreview: number | null;
	unavailableAfter: string;
};

export type Alternate = {
	id: string;
	hreflang: string;
	href: string;
};

export type OpenGraph = {
	type: string;
	title: string;
	description: string;
	url: string;
	siteName: string;
	locale: string;
	image: string;
	imageAlt: string;
	imageWidth: string;
	imageHeight: string;
	/** Only emitted when og:type is article. */
	publishedTime: string;
	modifiedTime: string;
	author: string;
	section: string;
	tags: string[];
};

export type TwitterCard = {
	card: 'summary' | 'summary_large_image' | 'app' | 'player';
	site: string;
	creator: string;
	title: string;
	description: string;
	image: string;
	imageAlt: string;
};

export type Icons = {
	favicon: string;
	appleTouchIcon: string;
	manifest: string;
	maskIcon: string;
	maskIconColor: string;
};

export type Verification = {
	google: string;
	bing: string;
	yandex: string;
	pinterest: string;
	facebook: string;
};

/**
 * One JSON-LD node. `type` keys into the schema registry; `data` holds its field
 * values. The shape is only known at runtime from the registry, so `data` stays
 * loose — the registry's `build()` is what narrows it back down.
 */
export type StructuredDataEntry = {
	id: string;
	type: string;
	enabled: boolean;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: Record<string, any>;
};

export type SeoDocument = {
	title: string;
	/** e.g. "%s — Acme". `%s` is replaced by `title`. */
	titleTemplate: string;
	description: string;
	canonical: string;
	siteName: string;
	lang: string;
	keywords: string[];
	author: string;
	publisher: string;
	themeColor: string;
	colorScheme: string;
	viewport: string;
	charset: string;
	referrer: string;
	robots: RobotsDirectives;
	alternates: Alternate[];
	og: OpenGraph;
	twitter: TwitterCard;
	icons: Icons;
	verification: Verification;
	structuredData: StructuredDataEntry[];
};

/** Fields the AI is allowed to write. Everything else stays under manual control. */
export type AiDraft = {
	title?: string;
	description?: string;
	keywords?: string[];
	ogTitle?: string;
	ogDescription?: string;
	ogImageAlt?: string;
	twitterTitle?: string;
	twitterDescription?: string;
	faq?: { question: string; answer: string }[];
	notes?: string;
};

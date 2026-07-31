/**
 * The JSON-LD registry.
 *
 * Each entry declares its fields once. The editor renders forms from these
 * descriptors and the emitters build nodes with `build()`, so adding a schema
 * type means adding one object here — no new UI code.
 */

export type FieldKind = 'text' | 'textarea' | 'url' | 'date' | 'number' | 'tags' | 'group';

export type FieldDef = {
	key: string;
	label: string;
	kind: FieldKind;
	hint?: string;
	placeholder?: string;
	/** For kind: 'group' — the shape of each repeated item. */
	fields?: FieldDef[];
	/** Label for the "add" button on repeatable groups. */
	addLabel?: string;
};

/** A schema entry's field values. Shapes are only known at runtime, via the registry. */
export type SchemaData = Record<string, unknown>;

export type SchemaDef = {
	type: string;
	label: string;
	summary: string;
	fields: FieldDef[];
	build: (d: SchemaData) => Record<string, unknown> | null;
};

/** Drops empty strings, empty arrays, and empty objects so JSON-LD stays clean. */
function prune<T>(value: T): T | undefined {
	if (value === null || value === undefined) return undefined;
	if (typeof value === 'string') return value.trim() ? (value.trim() as T) : undefined;
	if (Array.isArray(value)) {
		const items = value.map(prune).filter((v) => v !== undefined);
		return items.length ? (items as T) : undefined;
	}
	if (typeof value === 'object') {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			const pruned = prune(v);
			if (pruned !== undefined) out[k] = pruned;
		}
		// A node carrying only @type is noise.
		const meaningful = Object.keys(out).filter((k) => k !== '@type');
		return meaningful.length ? (out as T) : undefined;
	}
	return value;
}

function rows(d: SchemaData, key: string): SchemaData[] {
	const v = d?.[key];
	return Array.isArray(v) ? (v as SchemaData[]) : [];
}

function list(d: SchemaData, key: string): string[] {
	const v = d?.[key];
	if (Array.isArray(v)) return v.filter((s) => typeof s === 'string' && s.trim());
	return [];
}

const s = (d: SchemaData, key: string): string =>
	typeof d?.[key] === 'string' ? (d[key] as string) : '';

export const SCHEMA_REGISTRY: SchemaDef[] = [
	{
		type: 'Organization',
		label: 'Organization',
		summary: 'Who publishes the site. Feeds the knowledge panel.',
		fields: [
			{ key: 'name', label: 'Name', kind: 'text', placeholder: 'Northbound' },
			{ key: 'url', label: 'URL', kind: 'url', placeholder: 'https://northbound.dev' },
			{ key: 'logo', label: 'Logo URL', kind: 'url', hint: 'At least 112×112px.' },
			{ key: 'description', label: 'Description', kind: 'textarea' },
			{ key: 'email', label: 'Email', kind: 'text' },
			{ key: 'telephone', label: 'Telephone', kind: 'text' },
			{
				key: 'sameAs',
				label: 'Profile URLs',
				kind: 'tags',
				hint: 'Social and directory profiles that belong to this organization.'
			},
			{ key: 'streetAddress', label: 'Street address', kind: 'text' },
			{ key: 'addressLocality', label: 'City', kind: 'text' },
			{ key: 'addressRegion', label: 'Region', kind: 'text' },
			{ key: 'postalCode', label: 'Postal code', kind: 'text' },
			{ key: 'addressCountry', label: 'Country code', kind: 'text', placeholder: 'MX' }
		],
		build: (d) =>
			prune({
				'@type': 'Organization',
				name: s(d, 'name'),
				url: s(d, 'url'),
				logo: s(d, 'logo'),
				description: s(d, 'description'),
				email: s(d, 'email'),
				telephone: s(d, 'telephone'),
				sameAs: list(d, 'sameAs'),
				address: {
					'@type': 'PostalAddress',
					streetAddress: s(d, 'streetAddress'),
					addressLocality: s(d, 'addressLocality'),
					addressRegion: s(d, 'addressRegion'),
					postalCode: s(d, 'postalCode'),
					addressCountry: s(d, 'addressCountry')
				}
			}) ?? null
	},
	{
		type: 'WebSite',
		label: 'WebSite',
		summary: 'The site itself. Add a search URL to enable the sitelinks search box.',
		fields: [
			{ key: 'name', label: 'Name', kind: 'text' },
			{ key: 'url', label: 'URL', kind: 'url' },
			{
				key: 'searchUrl',
				label: 'Search URL template',
				kind: 'url',
				placeholder: 'https://northbound.dev/search?q={search_term_string}',
				hint: 'Must contain {search_term_string}.'
			},
			{ key: 'inLanguage', label: 'Language', kind: 'text', placeholder: 'en' }
		],
		build: (d) => {
			const searchUrl = s(d, 'searchUrl');
			return (
				prune({
					'@type': 'WebSite',
					name: s(d, 'name'),
					url: s(d, 'url'),
					inLanguage: s(d, 'inLanguage'),
					potentialAction: searchUrl.includes('{search_term_string}')
						? {
								'@type': 'SearchAction',
								target: {
									'@type': 'EntryPoint',
									urlTemplate: searchUrl
								},
								'query-input': 'required name=search_term_string'
							}
						: undefined
				}) ?? null
			);
		}
	},
	{
		type: 'Article',
		label: 'Article',
		summary: 'A post or news story. Use for anything with a byline and a date.',
		fields: [
			{ key: 'headline', label: 'Headline', kind: 'text', hint: 'Keep under 110 characters.' },
			{ key: 'description', label: 'Description', kind: 'textarea' },
			{ key: 'image', label: 'Image URL', kind: 'url' },
			{ key: 'authorName', label: 'Author', kind: 'text' },
			{ key: 'authorUrl', label: 'Author URL', kind: 'url' },
			{ key: 'publisherName', label: 'Publisher', kind: 'text' },
			{ key: 'publisherLogo', label: 'Publisher logo URL', kind: 'url' },
			{ key: 'datePublished', label: 'Published', kind: 'date' },
			{ key: 'dateModified', label: 'Modified', kind: 'date' },
			{ key: 'articleSection', label: 'Section', kind: 'text' },
			{ key: 'keywords', label: 'Keywords', kind: 'tags' }
		],
		build: (d) =>
			prune({
				'@type': 'Article',
				headline: s(d, 'headline'),
				description: s(d, 'description'),
				image: s(d, 'image'),
				author: {
					'@type': 'Person',
					name: s(d, 'authorName'),
					url: s(d, 'authorUrl')
				},
				publisher: {
					'@type': 'Organization',
					name: s(d, 'publisherName'),
					logo: s(d, 'publisherLogo')
						? { '@type': 'ImageObject', url: s(d, 'publisherLogo') }
						: undefined
				},
				datePublished: s(d, 'datePublished'),
				dateModified: s(d, 'dateModified'),
				articleSection: s(d, 'articleSection'),
				keywords: list(d, 'keywords')
			}) ?? null
	},
	{
		type: 'Product',
		label: 'Product',
		summary: 'A purchasable item. Price and availability drive the rich result.',
		fields: [
			{ key: 'name', label: 'Name', kind: 'text' },
			{ key: 'description', label: 'Description', kind: 'textarea' },
			{ key: 'image', label: 'Image URL', kind: 'url' },
			{ key: 'sku', label: 'SKU', kind: 'text' },
			{ key: 'brand', label: 'Brand', kind: 'text' },
			{ key: 'price', label: 'Price', kind: 'text', placeholder: '29.00' },
			{ key: 'priceCurrency', label: 'Currency', kind: 'text', placeholder: 'MXN' },
			{
				key: 'availability',
				label: 'Availability',
				kind: 'text',
				placeholder: 'InStock',
				hint: 'InStock, OutOfStock, PreOrder, BackOrder.'
			},
			{ key: 'url', label: 'Product URL', kind: 'url' },
			{ key: 'ratingValue', label: 'Rating', kind: 'text', placeholder: '4.6' },
			{ key: 'reviewCount', label: 'Review count', kind: 'text', placeholder: '128' }
		],
		build: (d) => {
			const price = s(d, 'price');
			const rating = s(d, 'ratingValue');
			const availability = s(d, 'availability');
			return (
				prune({
					'@type': 'Product',
					name: s(d, 'name'),
					description: s(d, 'description'),
					image: s(d, 'image'),
					sku: s(d, 'sku'),
					brand: s(d, 'brand') ? { '@type': 'Brand', name: s(d, 'brand') } : undefined,
					offers: price
						? {
								'@type': 'Offer',
								price,
								priceCurrency: s(d, 'priceCurrency'),
								availability: availability
									? `https://schema.org/${availability.replace(/^https?:\/\/schema\.org\//, '')}`
									: undefined,
								url: s(d, 'url')
							}
						: undefined,
					aggregateRating: rating
						? {
								'@type': 'AggregateRating',
								ratingValue: rating,
								reviewCount: s(d, 'reviewCount')
							}
						: undefined
				}) ?? null
			);
		}
	},
	{
		type: 'BreadcrumbList',
		label: 'Breadcrumbs',
		summary: 'The path to this page. Replaces the URL line in results.',
		fields: [
			{
				key: 'items',
				label: 'Trail',
				kind: 'group',
				addLabel: 'Add crumb',
				fields: [
					{ key: 'name', label: 'Name', kind: 'text' },
					{ key: 'url', label: 'URL', kind: 'url' }
				]
			}
		],
		build: (d) => {
			const items = rows(d, 'items').filter((i) => s(i, 'name'));
			if (!items.length) return null;
			return {
				'@type': 'BreadcrumbList',
				itemListElement: items.map((item, i) => {
					const node: Record<string, unknown> = {
						'@type': 'ListItem',
						position: i + 1,
						name: s(item, 'name')
					};
					// The last crumb is the current page; Google wants no `item` on it.
					if (s(item, 'url') && i < items.length - 1) node.item = s(item, 'url');
					return node;
				})
			};
		}
	},
	{
		type: 'FAQPage',
		label: 'FAQ',
		summary: 'Questions answered on this page, verbatim.',
		fields: [
			{
				key: 'questions',
				label: 'Questions',
				kind: 'group',
				addLabel: 'Add question',
				fields: [
					{ key: 'question', label: 'Question', kind: 'text' },
					{ key: 'answer', label: 'Answer', kind: 'textarea' }
				]
			}
		],
		build: (d) => {
			const qs = rows(d, 'questions').filter((q) => s(q, 'question') && s(q, 'answer'));
			if (!qs.length) return null;
			return {
				'@type': 'FAQPage',
				mainEntity: qs.map((q) => ({
					'@type': 'Question',
					name: s(q, 'question'),
					acceptedAnswer: { '@type': 'Answer', text: s(q, 'answer') }
				}))
			};
		}
	},
	{
		type: 'LocalBusiness',
		label: 'Local business',
		summary: 'A place customers visit. Drives the map pack.',
		fields: [
			{ key: 'name', label: 'Name', kind: 'text' },
			{ key: 'image', label: 'Image URL', kind: 'url' },
			{ key: 'telephone', label: 'Telephone', kind: 'text' },
			{ key: 'priceRange', label: 'Price range', kind: 'text', placeholder: '$$' },
			{ key: 'url', label: 'URL', kind: 'url' },
			{ key: 'streetAddress', label: 'Street address', kind: 'text' },
			{ key: 'addressLocality', label: 'City', kind: 'text' },
			{ key: 'addressRegion', label: 'Region', kind: 'text' },
			{ key: 'postalCode', label: 'Postal code', kind: 'text' },
			{ key: 'addressCountry', label: 'Country code', kind: 'text', placeholder: 'MX' },
			{ key: 'latitude', label: 'Latitude', kind: 'text' },
			{ key: 'longitude', label: 'Longitude', kind: 'text' },
			{
				key: 'hours',
				label: 'Opening hours',
				kind: 'group',
				addLabel: 'Add hours',
				fields: [
					{ key: 'days', label: 'Days', kind: 'text', placeholder: 'Monday, Tuesday' },
					{ key: 'opens', label: 'Opens', kind: 'text', placeholder: '09:00' },
					{ key: 'closes', label: 'Closes', kind: 'text', placeholder: '18:00' }
				]
			}
		],
		build: (d) => {
			const lat = s(d, 'latitude');
			const lon = s(d, 'longitude');
			const hours = rows(d, 'hours').filter((h) => s(h, 'days'));
			return (
				prune({
					'@type': 'LocalBusiness',
					name: s(d, 'name'),
					image: s(d, 'image'),
					telephone: s(d, 'telephone'),
					priceRange: s(d, 'priceRange'),
					url: s(d, 'url'),
					address: {
						'@type': 'PostalAddress',
						streetAddress: s(d, 'streetAddress'),
						addressLocality: s(d, 'addressLocality'),
						addressRegion: s(d, 'addressRegion'),
						postalCode: s(d, 'postalCode'),
						addressCountry: s(d, 'addressCountry')
					},
					geo:
						lat && lon ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lon } : undefined,
					openingHoursSpecification: hours.length
						? hours.map((h) => ({
								'@type': 'OpeningHoursSpecification',
								dayOfWeek: s(h, 'days')
									.split(',')
									.map((x) => x.trim())
									.filter(Boolean),
								opens: s(h, 'opens'),
								closes: s(h, 'closes')
							}))
						: undefined
				}) ?? null
			);
		}
	},
	{
		type: 'Person',
		label: 'Person',
		summary: 'An individual. Use on author and profile pages.',
		fields: [
			{ key: 'name', label: 'Name', kind: 'text' },
			{ key: 'url', label: 'URL', kind: 'url' },
			{ key: 'image', label: 'Image URL', kind: 'url' },
			{ key: 'jobTitle', label: 'Job title', kind: 'text' },
			{ key: 'worksFor', label: 'Works for', kind: 'text' },
			{ key: 'description', label: 'Description', kind: 'textarea' },
			{ key: 'sameAs', label: 'Profile URLs', kind: 'tags' }
		],
		build: (d) =>
			prune({
				'@type': 'Person',
				name: s(d, 'name'),
				url: s(d, 'url'),
				image: s(d, 'image'),
				jobTitle: s(d, 'jobTitle'),
				worksFor: s(d, 'worksFor')
					? { '@type': 'Organization', name: s(d, 'worksFor') }
					: undefined,
				description: s(d, 'description'),
				sameAs: list(d, 'sameAs')
			}) ?? null
	},
	{
		type: 'Event',
		label: 'Event',
		summary: 'Something scheduled. Dates and location are required for the rich result.',
		fields: [
			{ key: 'name', label: 'Name', kind: 'text' },
			{ key: 'description', label: 'Description', kind: 'textarea' },
			{ key: 'image', label: 'Image URL', kind: 'url' },
			{ key: 'startDate', label: 'Starts', kind: 'date' },
			{ key: 'endDate', label: 'Ends', kind: 'date' },
			{
				key: 'attendanceMode',
				label: 'Attendance',
				kind: 'text',
				placeholder: 'Offline',
				hint: 'Offline, Online, or Mixed.'
			},
			{ key: 'locationName', label: 'Venue', kind: 'text' },
			{ key: 'locationAddress', label: 'Venue address', kind: 'text' },
			{ key: 'locationUrl', label: 'Virtual location URL', kind: 'url' },
			{ key: 'organizer', label: 'Organizer', kind: 'text' },
			{ key: 'price', label: 'Price', kind: 'text' },
			{ key: 'priceCurrency', label: 'Currency', kind: 'text', placeholder: 'MXN' },
			{ key: 'ticketUrl', label: 'Ticket URL', kind: 'url' }
		],
		build: (d) => {
			const mode = s(d, 'attendanceMode');
			const price = s(d, 'price');
			const virtual = s(d, 'locationUrl');
			return (
				prune({
					'@type': 'Event',
					name: s(d, 'name'),
					description: s(d, 'description'),
					image: s(d, 'image'),
					startDate: s(d, 'startDate'),
					endDate: s(d, 'endDate'),
					eventAttendanceMode: mode
						? `https://schema.org/${mode.replace(/EventAttendanceMode$/, '')}EventAttendanceMode`
						: undefined,
					location: virtual
						? { '@type': 'VirtualLocation', url: virtual }
						: {
								'@type': 'Place',
								name: s(d, 'locationName'),
								address: s(d, 'locationAddress')
							},
					organizer: s(d, 'organizer')
						? { '@type': 'Organization', name: s(d, 'organizer') }
						: undefined,
					offers: price
						? {
								'@type': 'Offer',
								price,
								priceCurrency: s(d, 'priceCurrency'),
								url: s(d, 'ticketUrl')
							}
						: undefined
				}) ?? null
			);
		}
	},
	{
		type: 'SoftwareApplication',
		label: 'Software',
		summary: 'An app or tool. Shows rating and price in results.',
		fields: [
			{ key: 'name', label: 'Name', kind: 'text' },
			{ key: 'description', label: 'Description', kind: 'textarea' },
			{
				key: 'applicationCategory',
				label: 'Category',
				kind: 'text',
				placeholder: 'DeveloperApplication'
			},
			{ key: 'operatingSystem', label: 'Operating system', kind: 'text', placeholder: 'Web' },
			{ key: 'url', label: 'URL', kind: 'url' },
			{ key: 'price', label: 'Price', kind: 'text', placeholder: '0' },
			{ key: 'priceCurrency', label: 'Currency', kind: 'text', placeholder: 'USD' },
			{ key: 'ratingValue', label: 'Rating', kind: 'text' },
			{ key: 'ratingCount', label: 'Rating count', kind: 'text' }
		],
		build: (d) => {
			const price = s(d, 'price');
			const rating = s(d, 'ratingValue');
			return (
				prune({
					'@type': 'SoftwareApplication',
					name: s(d, 'name'),
					description: s(d, 'description'),
					applicationCategory: s(d, 'applicationCategory'),
					operatingSystem: s(d, 'operatingSystem'),
					url: s(d, 'url'),
					offers: price
						? { '@type': 'Offer', price, priceCurrency: s(d, 'priceCurrency') }
						: undefined,
					aggregateRating: rating
						? {
								'@type': 'AggregateRating',
								ratingValue: rating,
								ratingCount: s(d, 'ratingCount')
							}
						: undefined
				}) ?? null
			);
		}
	},
	{
		type: 'VideoObject',
		label: 'Video',
		summary: 'An embedded video. Enables the video thumbnail in results.',
		fields: [
			{ key: 'name', label: 'Title', kind: 'text' },
			{ key: 'description', label: 'Description', kind: 'textarea' },
			{ key: 'thumbnailUrl', label: 'Thumbnail URL', kind: 'url' },
			{ key: 'uploadDate', label: 'Upload date', kind: 'date' },
			{
				key: 'duration',
				label: 'Duration',
				kind: 'text',
				placeholder: 'PT4M12S',
				hint: 'ISO 8601 duration.'
			},
			{ key: 'contentUrl', label: 'Content URL', kind: 'url' },
			{ key: 'embedUrl', label: 'Embed URL', kind: 'url' }
		],
		build: (d) =>
			prune({
				'@type': 'VideoObject',
				name: s(d, 'name'),
				description: s(d, 'description'),
				thumbnailUrl: s(d, 'thumbnailUrl'),
				uploadDate: s(d, 'uploadDate'),
				duration: s(d, 'duration'),
				contentUrl: s(d, 'contentUrl'),
				embedUrl: s(d, 'embedUrl')
			}) ?? null
	},
	{
		type: 'HowTo',
		label: 'How-to',
		summary: 'An ordered procedure. Steps must match the visible page.',
		fields: [
			{ key: 'name', label: 'Title', kind: 'text' },
			{ key: 'description', label: 'Description', kind: 'textarea' },
			{ key: 'totalTime', label: 'Total time', kind: 'text', placeholder: 'PT30M' },
			{
				key: 'steps',
				label: 'Steps',
				kind: 'group',
				addLabel: 'Add step',
				fields: [
					{ key: 'name', label: 'Step name', kind: 'text' },
					{ key: 'text', label: 'Instruction', kind: 'textarea' },
					{ key: 'url', label: 'Anchor URL', kind: 'url' }
				]
			}
		],
		build: (d) => {
			const steps = rows(d, 'steps').filter((x) => s(x, 'text') || s(x, 'name'));
			if (!steps.length) return null;
			return prune({
				'@type': 'HowTo',
				name: s(d, 'name'),
				description: s(d, 'description'),
				totalTime: s(d, 'totalTime'),
				step: steps.map((step, i) => ({
					'@type': 'HowToStep',
					position: i + 1,
					name: s(step, 'name'),
					text: s(step, 'text'),
					url: s(step, 'url')
				}))
			}) as Record<string, unknown>;
		}
	}
];

export function getSchemaDef(type: string): SchemaDef | undefined {
	return SCHEMA_REGISTRY.find((d) => d.type === type);
}

/** Seeds a new entry with the empty rows a group field needs to render. */
export function initialSchemaData(def: SchemaDef): Record<string, unknown> {
	const data: Record<string, unknown> = {};
	for (const field of def.fields) {
		if (field.kind === 'group') data[field.key] = [emptyRow(field)];
		else if (field.kind === 'tags') data[field.key] = [];
		else data[field.key] = '';
	}
	return data;
}

export function emptyRow(field: FieldDef): Record<string, string> {
	const row: Record<string, string> = {};
	for (const sub of field.fields ?? []) row[sub.key] = '';
	return row;
}

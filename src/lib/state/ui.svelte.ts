import type { TargetId } from '$lib/seo/emit';

/**
 * Chrome-level UI state.
 *
 * The header lives in the layout but its buttons open dialogs and its findings
 * link into editor sections, so this state cannot belong to any single route.
 * Keeping it here is what lets the header be reused across views.
 */
class Ui {
	/** Shared by the side pane and the export dialog. */
	targetId = $state<TargetId>('html');

	assistOpen = $state(false);
	exportOpen = $state(false);

	/** Which editor sections are expanded. */
	sections = $state<Record<string, boolean>>({
		core: true,
		indexing: false,
		social: true,
		structured: true,
		site: false
	});

	openSection(id: string) {
		this.sections[id] = true;
	}

	get anySectionOpen(): boolean {
		return Object.values(this.sections).some(Boolean);
	}

	/** Drives the collapse-all / expand-all toggle above the editor. */
	setAllSections(open: boolean) {
		for (const id of Object.keys(this.sections)) this.sections[id] = open;
	}

	/**
	 * A locally chosen image, for the shared-link preview only.
	 *
	 * It lives here rather than on the document because a `blob:` URL is
	 * meaningless to a crawler — it must never reach the emitted `og:image`, and
	 * it cannot be persisted or serialized either.
	 */
	previewImage = $state<string | null>(null);
	previewImageName = $state('');

	setPreviewImage(file: File | null) {
		// Object URLs pin the file in memory until revoked.
		if (this.previewImage) URL.revokeObjectURL(this.previewImage);
		this.previewImage = file ? URL.createObjectURL(file) : null;
		this.previewImageName = file?.name ?? '';
	}
}

export const ui = new Ui();

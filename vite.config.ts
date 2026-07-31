import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
// vitest/config re-exports Vite's defineConfig widened with the `test` key.
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			/*
				Pinned rather than adapter-auto. adapter-auto resolves and installs the
				platform adapter at build time, which produced a dependency tree on
				Vercel where a CommonJS require of estree-walker hit the ESM-only v3
				and failed the build. Naming the adapter puts it in the lockfile.

				It also means the adapter actually runs locally: adapter-auto detects
				no environment on a dev machine and quietly does nothing, so this
				whole code path went untested until it reached CI.
			*/
			adapter: adapter()
		})
	],

	test: {
		// The suite covers src/lib/seo, which is pure logic with no DOM or
		// SvelteKit runtime dependencies — node keeps it fast.
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		coverage: {
			include: ['src/lib/seo/**'],
			reporter: ['text', 'html']
		}
	}
});

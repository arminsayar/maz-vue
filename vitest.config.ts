import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

/**
 * Nuxt replaces `import.meta.client` / `import.meta.server` with literal
 * booleans at build time. Vite's `define` option does not rewrite member
 * expressions rooted at `import.meta`, so a small pre-transform does it instead.
 *
 * Without this, every client-only branch (focus management, scroll locking)
 * would silently take the server path and remain untested — the code would look
 * covered while proving nothing.
 */
function nuxtClientFlags(): Plugin {
  const replacements: ReadonlyArray<readonly [RegExp, string]> = [
    [/import\.meta\.client/g, 'true'],
    [/import\.meta\.server/g, 'false']
  ]

  return {
    name: 'test:nuxt-client-flags',
    enforce: 'pre',
    transform(code) {
      if (!code.includes('import.meta.')) return null

      return {
        code: replacements.reduce(
          (transformed, [pattern, value]) => transformed.replace(pattern, value),
          code
        ),
        map: null
      }
    }
  }
}

/**
 * Vitest is configured standalone (not via @nuxt/test-utils) on purpose:
 * everything under test here is pure or component-level logic that does not
 * need a running Nuxt runtime, so a lighter, faster harness is the right call.
 * `~` and `@` are aliased to the project root so imports resolve identically
 * to the way Nuxt resolves them.
 */
export default defineConfig({
  plugins: [nuxtClientFlags(), vue()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.{test,spec}.ts'],
    // Auto-stub Nuxt's built-in components/composables when a component that
    // uses them is mounted in isolation.
    setupFiles: ['./tests/setup.ts']
  }
})
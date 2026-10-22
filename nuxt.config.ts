import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Nuxt } from 'nuxt/schema'
import { defineNuxtConfig } from 'nuxt/config'

/**
 * Seeds `<buildDir>/manifest/meta/<buildId>.json` as early as possible.
 *
 * Nuxt points the `#app-manifest` alias at that file, but in dev Nitro only
 * writes it from its own `rollup:before` hook — which runs *after* Vite's
 * dependency optimizer has already transformed
 * `nuxt/dist/app/composables/manifest.js`. On the first `nuxt dev` after a
 * clean `.nuxt` (i.e. after `rm -rf .nuxt` or a fresh `npm install`) the alias
 * therefore has no valid target yet and the console fills up with:
 *
 *   ERROR  Pre-transform error: Failed to resolve import "#app-manifest"
 *   from "node_modules/nuxt/dist/app/composables/manifest.js?v=..."
 *
 * Writing an empty manifest once the build directory exists keeps the alias
 * resolvable at all times; Nitro overwrites the file with the real manifest a
 * moment later, so this hook is purely additive and idempotent.
 *
 * Upstream: nuxt/nuxt#30461 (workaround: clear `node_modules/.vite`),
 * nuxt/nuxt#34565 (proper fix, still unreleased as of Nuxt 3.21.11).
 */
function seedDevAppManifest(nuxt: Nuxt) {
  if (!nuxt.options.dev) return

  const buildId = nuxt.options.buildId || 'dev'
  const manifestDir = join(nuxt.options.buildDir, 'manifest', 'meta')
  const manifestFile = join(manifestDir, `${buildId}.json`)

  if (existsSync(manifestFile)) return

  mkdirSync(manifestDir, { recursive: true })
  writeFileSync(
    manifestFile,
    JSON.stringify({ id: buildId, timestamp: Date.now(), prerendered: [] })
  )
}

/**
 * Nuxt configuration for the Fake Store storefront.
 *
 * Decisions:
 * - SSR enabled (default) so the catalog and product pages are server-rendered,
 *   giving fast first paint and shareable/SEO-friendly URLs.
 * - Runtime config exposes the API base URL so it can be overridden per
 *   environment without code changes.
 * - Global stylesheet carries design tokens + reset + base typography.
 */
export default defineNuxtConfig({
  hooks: {
    // `ready` fires once the build directory has been written and before Vite
    // builds/optimizes anything, which is exactly the window we need.
    ready: (nuxt) => seedDevAppManifest(nuxt)
  },
  compatibilityDate: '2025-01-01',

  devtools: { enabled: false },

  // Flat-config ESLint (Nuxt's official setup). The generated config lives in
  // eslint.config.mjs and is produced by `nuxt prepare`.
  modules: ['@nuxt/eslint'],

  typescript: {
    strict: true,
    typeCheck: false
  },

  // Flat component names.
  //
  // Nuxt's default `pathPrefix` registers nested components under their folder
  // name (components/layout/SiteHeader.vue -> <LayoutSiteHeader>,
  // components/ui/AppIcon.vue -> <UiAppIcon>). Every template here refers to
  // components by their file name alone (<SiteHeader>, <AppIcon>, ...), and with
  // the default prefix those references resolved to nothing: the header, the
  // footer and every icon were silently dropped from the rendered page (the
  // layout showed up as an empty comment placeholder). Registering flat names
  // makes the components resolvable everywhere.
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/tokens.css', '~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      // Override with NUXT_PUBLIC_API_BASE at build/runtime if needed.
      apiBase: 'https://fakestoreapi.com'
    }
  },

  app: {
    head: {
      // The storefront is Persian-only, so the document is declared RTL for
      // real. Everything else in the CSS is authored with logical properties
      // (inline-start / inline-end) so the whole layout mirrors correctly.
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      title: 'Aurora — کالاهای روزمره',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Aurora یک فروشگاه سریع و دسترس‌پذیر برای کالاهای روزمره است؛ کاتالوگ منتخب را مرور کنید، جست‌وجو کنید و بر پایه قیمت یا امتیاز مرتب کنید.'
        },
        { name: 'theme-color', content: '#101828' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          // Vazirmatn: a variable Persian (Arabic-script) family with matching
          // Latin glyphs, so Persian and Latin text share one rhythm. It is the
          // app-wide fallback when the design's Yekan family is unavailable.
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap'
        },
        // The Figma design specifies Yekan Bakh, a licensed family that cannot
        // be redistributed, so the free sibling "Yekan" from the Persian webfont
        // CDN is loaded as the closest available match. See the typography note
        // in assets/css/tokens.css for the full fallback order.
        { rel: 'preconnect', href: 'https://v2.fontcdn.ir', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://v2.fontapi.ir/css/yekan' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },

  nitro: {
    compressPublicAssets: true
  }
})
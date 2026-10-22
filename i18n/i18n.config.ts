/**
 * vue-i18n options for @nuxtjs/i18n.
 *
 * Messages themselves live in `i18n/locales/*.json` and are wired per locale
 * through the `locales[].files` entries in `nuxt.config.ts`; this file holds
 * only the options that apply to the shared vue-i18n instance. The Composition
 * API (`useI18n`) is the only mode used across the app.
 */
export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'fa'
}))

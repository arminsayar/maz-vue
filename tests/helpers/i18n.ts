import { createI18n } from 'vue-i18n'
import fa from '~/i18n/locales/fa.json'
import en from '~/i18n/locales/en.json'

/**
 * A standalone vue-i18n instance for the component tests.
 *
 * The harness runs outside Nuxt, so @nuxtjs/i18n's plugin never loads. This
 * instance mirrors the app's configuration (`legacy: false`, Persian-first,
 * `fa` fallback) and loads the *same* locale files the app uses — the messages
 * under test are therefore the shipped ones, not a fixture that can drift.
 *
 * Vitest isolates module state per test file, so every file gets its own
 * instance through `tests/setup.ts`; within a file the instance is shared by all
 * mounts exactly like the app's single i18n plugin.
 */
export const i18n = createI18n({
  legacy: false,
  locale: 'fa',
  fallbackLocale: 'fa',
  messages: { fa, en }
})

/** The global translator, for asserting against locale-resolved copy. */
export const t = i18n.global.t

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { SITE_NAME } from '~/constants/site'

/**
 * Root component.
 *
 * NuxtLayout applies layouts/default.vue to routed pages, and NuxtPage renders
 * the active route. A page transition is enabled for a subtle sense of
 * navigation; it is neutralised by the reduced-motion rules in main.css.
 *
 * The document's `lang`/`dir` and default title/description are locale-driven:
 * `useLocaleHead` (from @nuxtjs/i18n) resolves them from the active locale and
 * adds hreflang/SEO meta, and the title/description come from the message
 * catalogue so a locale switch re-resolves everything reactively. Pages still
 * override the title per route via `useSeoMeta`.
 */
const { t } = useI18n()
const localeHead = useLocaleHead()

useHead(() => ({
  htmlAttrs: {
    lang: localeHead.value.htmlAttrs.lang,
    // `useLocaleHead` types `dir` as a plain string; Nuxt wants the narrower
    // direction union, and the module only ever emits 'ltr' or 'rtl'.
    dir: localeHead.value.htmlAttrs.dir as 'ltr' | 'rtl' | 'auto'
  },
  title: t('site.title', { site: SITE_NAME }),
  meta: [
    { name: 'description', content: t('site.description') },
    ...localeHead.value.meta
  ],
  link: [...localeHead.value.link]
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Page transitions are declared in main.css so they are globally consistent. */
</style>

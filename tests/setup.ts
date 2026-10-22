import { defineComponent, h } from 'vue'
import { config } from '@vue/test-utils'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppBreadcrumb from '~/components/ui/AppBreadcrumb.vue'
import AppDrawer from '~/components/ui/AppDrawer.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import SocialIcon from '~/components/ui/SocialIcon.vue'
import StarRating from '~/components/ui/StarRating.vue'
import ProductImage from '~/components/product/ProductImage.vue'
import ProductCard from '~/components/product/ProductCard.vue'
import ProductCardSkeleton from '~/components/product/ProductCardSkeleton.vue'
import ProductGrid from '~/components/product/ProductGrid.vue'
import ProductDetails from '~/components/product/ProductDetails.vue'
import SearchInput from '~/components/catalog/SearchInput.vue'
import CategoryFilter from '~/components/catalog/CategoryFilter.vue'
import SortFilter from '~/components/catalog/SortFilter.vue'
import ActiveFilters from '~/components/catalog/ActiveFilters.vue'
import { i18n } from './helpers/i18n'
import { SOCIAL_LINK_DEFAULTS } from '~/constants/site'

/**
 * Global test configuration.
 *
 * Nuxt auto-imports components and composables at build time. Because these
 * tests run through a standalone Vitest config (without the Nuxt runtime), the
 * same components are registered explicitly here so any component under test can
 * resolve its dependencies. `NuxtLink` is stubbed with a plain <a> that renders
 * its slot — routing is not what these unit tests are verifying.
 *
 * `useRuntimeConfig` only exists inside Nuxt; the harness defines it on
 * globalThis with the shipped defaults so composables like `useSocialLinks()`
 * follow the same resolution path as production (config over defaults).
 */
config.global.components = {
  AppIcon,
  AppBreadcrumb,
  AppDrawer,
  BaseButton,
  EmptyState,
  SocialIcon,
  StarRating,
  ProductImage,
  ProductCard,
  ProductCardSkeleton,
  ProductGrid,
  ProductDetails,
  SearchInput,
  CategoryFilter,
  SortFilter,
  ActiveFilters
}

config.global.plugins = [i18n]

// Mirrors the runtimeConfig.public block in nuxt.config.ts (minus its defaults,
// which the composables already fall back to).
//
// The API base URL is configuration, so it is read from the environment exactly
// as the app reads it. The `api.test` placeholder is a non-routable stand-in
// used only when the env var is absent: every test stubs `$fetch`, so the value
// is never dialled — it merely has to be non-empty.
;(globalThis as { useRuntimeConfig?: unknown }).useRuntimeConfig = () => ({
  public: {
    apiBase: process.env.NUXT_PUBLIC_API_BASE?.trim() || 'http://api.test',
    social: { ...SOCIAL_LINK_DEFAULTS }
  }
})

/**
 * Render-function stub (rather than a string `template`): Vitest resolves the
 * runtime-only Vue build, which cannot compile inline templates. The stub also
 * mirrors the `to` it receives onto `data-to`, so tests can assert link targets
 * without needing vue-router.
 */
config.global.stubs = {
  NuxtLink: defineComponent({
    name: 'NuxtLink',
    props: { to: { type: [String, Object], required: true } },
    setup(props, { slots }) {
      return () =>
        h(
          'a',
          {
            href: typeof props.to === 'string' ? props.to : '#',
            'data-to': JSON.stringify(props.to)
          },
          slots.default?.()
        )
    }
  })
}

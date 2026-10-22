import { defineComponent, h } from 'vue'
import { config } from '@vue/test-utils'
import AppIcon from '~/components/ui/AppIcon.vue'
import AppBreadcrumb from '~/components/ui/AppBreadcrumb.vue'
import AppDrawer from '~/components/ui/AppDrawer.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
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

/**
 * Global test configuration.
 *
 * Nuxt auto-imports components at build time. Because these tests run through a
 * standalone Vitest config (without the Nuxt runtime), the same components are
 * registered explicitly here so any component under test can resolve its
 * dependencies. `NuxtLink` is stubbed with a plain <a> that renders its slot —
 * routing is not what these unit tests are verifying.
 */
config.global.components = {
  AppIcon,
  AppBreadcrumb,
  AppDrawer,
  BaseButton,
  EmptyState,
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
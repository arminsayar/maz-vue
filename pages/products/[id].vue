<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ProductDetail } from '~/types/product'
import { fetchProduct, fetchProductsByCategory } from '~/services/products'
import { SITE_NAME } from '~/constants/site'
import { truncate } from '~/utils/format'

/**
 * Product detail page.
 *
 * Data flow:
 *   route param -> :id (validated) -> useAsyncData -> product (+ related) -> UI
 *
 * The product is fetched by id rather than received via navigation state, so a
 * direct visit, refresh or shared link all work identically. Related items come
 * from the category endpoint (one extra request) and stay logically grouped
 * with this page's data. The fetch is keyed per id and watched on the id so
 * navigating between products re-runs it and surfaces the loading state.
 *
 * The breadcrumb is derived from the same data, so it is correct on a direct
 * visit and updates when the user navigates on to another product.
 */
const { t, te } = useI18n()

const route = useRoute()

/** Parse the route param defensively; NaN marks an invalid id. */
const id = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : NaN
})

const { data, status, error, refresh } = await useAsyncData<ProductDetail | null>(
  () => `product-${id.value}`,
  async () => {
    if (!Number.isFinite(id.value)) return null

    const product = await fetchProduct(id.value)
    if (!product) return null

    // Related products from the same category (single extra request).
    const sameCategory = await fetchProductsByCategory(product.category)
    const related = sameCategory.filter((p) => p.id !== product.id).slice(0, 4)

    return { product, related }
  },
  { watch: [id] }
)

const product = computed(() => data.value?.product ?? null)
const related = computed(() => data.value?.related ?? [])

const isLoading = computed(() => status.value === 'pending')
const isNotFound = computed(
  () => !isLoading.value && status.value === 'success' && !product.value
)
const hasError = computed(
  () => status.value === 'error' && !isLoading.value && Boolean(error.value)
)

/**
 * Trail: an icon-only home crumb, then the listing, then the product itself.
 *
 * The last crumb has no `to`, which is what `AppBreadcrumb` renders as the
 * current page. Titles are truncated because a Fake Store title can run to 60+
 * characters and would otherwise push the trail onto three lines.
 */
type Crumb = { label: string; to?: string; icon?: 'home'; hideLabel?: boolean }

const crumbs = computed<Crumb[]>(() => {
  const trail: Crumb[] = [
    { label: t('product.breadcrumb.home'), to: '/', icon: 'home', hideLabel: true },
    { label: t('product.breadcrumb.listing'), to: '/' }
  ]

  if (product.value) trail.push({ label: truncate(product.value.title, 48) })

  return trail
})

/**
 * The API client reports failures as `errors.*` i18n keys; translate the key
 * when it is one, otherwise fall back to the generic copy so a raw, unexpected
 * message never leaks into the page.
 */
const errorDescription = computed(() => {
  const key = error.value?.message
  return key && te(key) ? t(key) : t('product.empty.errorDescription')
})

// Signal a proper 404 to crawlers for genuinely missing products. A watcher
// (not a plain `if`) is used so the status is still correct when the user
// navigates client-side from a valid product to an invalid id.
watchEffect(() => {
  if (isNotFound.value) setResponseStatus(404)
})

// SEO metadata is derived reactively from the fetched product so the title and
// description stay correct when navigating between products (the route
// component is reused, so setup does not re-run).
useSeoMeta({
  title: () =>
    `${product.value?.title || t('product.seo.titleFallback')} — ${SITE_NAME}`,
  description: () =>
    product.value?.description?.slice(0, 155) || t('product.seo.descriptionFallback')
})
</script>

<template>
  <div class="detail container">
    <AppBreadcrumb class="detail__crumbs" :items="crumbs" />

    <!-- Loading: the same two-card shape the loaded page uses. -->
    <div v-if="isLoading" class="detail__skeleton" aria-busy="true">
      <div class="detail__card">
        <div class="skeleton detail__line detail__line--title" />
        <div class="skeleton detail__media" />
      </div>
      <div class="detail__card">
        <div class="skeleton detail__line detail__line--heading" />
        <div class="skeleton detail__line" />
        <div class="skeleton detail__line" />
        <div class="skeleton detail__line" />
      </div>
    </div>

    <!-- Error -->
    <EmptyState
      v-else-if="hasError"
      icon="alert"
      tone="danger"
      :title="t('product.empty.errorTitle')"
      :description="errorDescription"
    >
      <BaseButton :loading="isLoading" @click="refresh()">
        {{ t('product.actions.retry') }}
      </BaseButton>
      <BaseButton variant="secondary" to="/">{{ t('product.actions.backToStore') }}</BaseButton>
    </EmptyState>

    <!-- Not found -->
    <EmptyState
      v-else-if="isNotFound"
      icon="search"
      :title="t('product.empty.notFoundTitle')"
      :description="t('product.empty.notFoundDescription')"
    >
      <BaseButton to="/">{{ t('product.actions.browseAll') }}</BaseButton>
    </EmptyState>

    <!-- Loaded -->
    <ProductDetails v-else-if="product" :product="product" />

    <!-- Related -->
    <section
      v-if="!isLoading && !hasError && related.length"
      class="detail__related"
      aria-labelledby="related-heading"
    >
      <h2 id="related-heading" class="detail__related-title">
        {{ t('product.related.title') }}
      </h2>
      <ProductGrid :products="related" :eager-count="0" />
    </section>
  </div>
</template>

<style scoped>
.detail {
  padding-block: var(--space-6) var(--space-16);
}

.detail__crumbs {
  margin-bottom: var(--space-5);
}

.detail__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.detail__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-panel);
}

.detail__line {
  height: 14px;
  border-radius: var(--radius-xs);
}

.detail__line--title {
  width: 35%;
  height: 26px;
}

.detail__line--heading {
  width: 22%;
  height: 20px;
}

.detail__media {
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-lg);
}

.detail__related {
  margin-top: var(--space-16);
  padding-top: var(--space-10);
  border-top: 1px solid var(--color-border);
}

.detail__related-title {
  font-size: var(--fs-2xl);
  margin-bottom: var(--space-6);
}
</style>
<script setup lang="ts">
import { computed } from 'vue'
import { applyCatalogFilters } from '~/utils/catalog'
import { fetchCategories, fetchProducts } from '~/services/products'
import { SITE_NAME } from '~/constants/site'

/**
 * Product listing page.
 *
 * Data flow:
 *   useAsyncData (SSR) -> full catalog + categories -> applyCatalogFilters ->
 *   ProductGrid
 *
 * The full catalog is fetched once and filtering/sorting happen on the already
 * -fetched array. That is the right call for this API: it exposes only 20
 * products, so per-keystroke category/search requests would add latency and
 * duplicate network traffic for no benefit. Both requests are keyed so Nuxt
 * dedupes them between server render and client hydration (no double fetch).
 *
 * Layout: the filter panel and the results are two columns on desktop (the panel
 * at the inline start, i.e. the right, as in the design) and one stacked column
 * on smaller screens. The page owns that grid — `CatalogToolbar` is only the
 * controls, and the active-filter card sits directly above the grid.
 */

const { data: products, status, error, refresh } = await useAsyncData(
  'catalog-products',
  fetchProducts
)

const { data: categories } = await useAsyncData(
  'catalog-categories',
  fetchCategories
)

const {
  search,
  categories: selectedCategories,
  sort,
  setSearch,
  setCategories,
  toggleCategory,
  setSort,
  clearAll
} = useCatalogFilters()

const isLoading = computed(() => status.value === 'pending')
const hasError = computed(() => status.value === 'error' && !isLoading.value)

const allProducts = computed(() => products.value ?? [])
const categoryList = computed(() => categories.value ?? [])

const filtered = computed(() =>
  applyCatalogFilters(allProducts.value, {
    search: search.value,
    categories: selectedCategories.value,
    sort: sort.value
  })
)

/** Catalog itself is empty (API returned nothing usable). */
const isCatalogEmpty = computed(
  () => !isLoading.value && !hasError.value && allProducts.value.length === 0
)

/** Catalog has products, but the active filters match none of them. */
const isFilteredEmpty = computed(
  () =>
    !isLoading.value &&
    !hasError.value &&
    allProducts.value.length > 0 &&
    filtered.value.length === 0
)

useSeoMeta({
  title: `${SITE_NAME} — خرید کالاهای روزمره`,
  description:
    'مجموعهای از کالاهای روزمره را مرور کنید؛ جستوجو کنید، بر پایهٔ دستهبندی فیلتر کنید و بر پایهٔ قیمت یا امتیاز مرتب کنید.'
})
</script>

<template>
  <div class="listing container">
    <!-- The design opens straight on the filters and the grid, so the page's
         single h1 is present for assistive tech without occupying a hero band. -->
    <h1 class="visually-hidden">کالاهای روزمره</h1>

    <div class="catalog">
      <CatalogToolbar
        :categories="categoryList"
        :search="search"
        :selected-categories="selectedCategories"
        :sort="sort"
        :result-count="filtered.length"
        @update:search="setSearch"
        @update:categories="setCategories"
        @update:sort="setSort"
      />

      <section class="results" aria-live="polite" :aria-busy="isLoading">
        <h2 class="visually-hidden">محصولات</h2>

        <!-- The card the design puts on top of the grid: every applied filter,
             each removable on its own. -->
        <ActiveFilters
          :search="search"
          :categories="selectedCategories"
          @clear-search="setSearch('')"
          @clear-category="toggleCategory"
          @clear-all="clearAll"
        />

        <!-- Skeletons don't consume real data, so the loading branch passes an
             empty list and only controls the placeholder count. -->
        <ProductGrid v-if="isLoading" :products="[]" loading :skeleton-count="6" />

        <EmptyState
          v-else-if="hasError"
          icon="alert"
          tone="danger"
          title="بارگذاری کاتالوگ ممکن نشد"
          :description="
            error?.message ||
            'فروشگاه در این لحظه در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.'
          "
        >
          <BaseButton :loading="isLoading" @click="refresh()">تلاش دوباره</BaseButton>
        </EmptyState>

        <EmptyState
          v-else-if="isCatalogEmpty"
          icon="package"
          title="هنوز محصولی ثبت نشده است"
          description="کاتالوگ در حال حاضر خالی است. لطفاً کمی بعد سر بزنید."
        >
          <BaseButton variant="secondary" @click="refresh()">بارگذاری دوباره</BaseButton>
        </EmptyState>

        <EmptyState
          v-else-if="isFilteredEmpty"
          icon="search"
          title="هیچ محصولی با فیلترهای شما همخوانی ندارد"
          description="عبارت جستوجوی دیگری بنویسید، دستهٔ دیگری انتخاب کنید یا فیلترها را پاک کنید تا همهچیز نمایش داده شود."
        >
          <BaseButton @click="clearAll">پاک کردن همهٔ فیلترها</BaseButton>
        </EmptyState>

        <ProductGrid v-else :products="filtered" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.listing {
  padding-block: var(--space-8) var(--space-16);
}

/* One column by default; the panel moves beside the grid once there is room for
   both. DOM order puts the panel first, which is the inline start — the right
   in this RTL document, exactly where the design places it. */
.catalog {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-5);
  align-items: start;
}

.results {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  min-width: 0;
}

@media (min-width: 900px) {
  .catalog {
    grid-template-columns: 300px minmax(0, 1fr);
    gap: var(--space-6);
  }
}
</style>
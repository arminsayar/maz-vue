<script setup lang="ts">
import type { Product } from '~/types/product'

/**
 * Responsive product grid.
 *
 * Owns the grid layout so pages don't each redefine it. Renders skeletons while
 * loading and real cards once data is present. Keys use the stable product id.
 * The first row loads eagerly to improve LCP for content that is immediately
 * visible; the rest stay lazy.
 */
withDefaults(
  defineProps<{
    products: ReadonlyArray<Product>
    loading?: boolean
    skeletonCount?: number
    eagerCount?: number
  }>(),
  { loading: false, skeletonCount: 8, eagerCount: 4 }
)
</script>

<template>
  <ul v-if="loading" class="grid" aria-hidden="true">
    <li v-for="n in skeletonCount" :key="n">
      <ProductCardSkeleton />
    </li>
  </ul>

  <ul v-else class="grid">
    <li v-for="(product, index) in products" :key="product.id">
      <ProductCard :product="product" :eager="index < eagerCount" />
    </li>
  </ul>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-5);
  align-items: stretch;
  list-style: none;
  margin: 0;
}

@media (max-width: 420px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--space-4);
  }
}
</style>
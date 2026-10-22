<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { Product } from '~/types/product'
import { formatCategoryLabel, formatInteger, formatPrice } from '~/utils/format'

/**
 * Presentational product detail block — the design's two stacked cards.
 *
 * Card 1 is the hero: the product title and a wide image with a zoom
 * affordance. Card 2 is the «مشخصات فنی» sheet, a label/value table that maps
 * the API fields onto the design's rows (price, description, category, rating
 * and review count).
 *
 * Extracted from the route so the presentation is independently testable and the
 * page stays responsible only for fetching and state selection (loading / error /
 * not-found / loaded). The component is purely a function of its `product` prop.
 */
const props = defineProps<{ product: Product }>()

const categoryLabel = computed(() => formatCategoryLabel(props.product.category))

/**
 * The description arrives as running prose; the design lists it as bullets, so
 * each sentence becomes one point. `filter` drops the empty tail a trailing
 * terminator leaves behind.
 */
const points = computed(() =>
  props.product.description
    .split(/(?<=[.!?؟])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
)

/* --- Zoom ---------------------------------------------------------------- */

const zoomed = ref(false)
const zoomClose = ref<HTMLButtonElement | null>(null)

async function openZoom(): Promise<void> {
  zoomed.value = true
  await nextTick()
  zoomClose.value?.focus()
}

function onZoomKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') zoomed.value = false
}

// The listener lives on the window (not the overlay) so Escape closes the zoom
// even after focus has moved somewhere unexpected. Only attached while open, and
// only in the browser.
watch(zoomed, (isZoomed) => {
  if (!import.meta.client) return
  if (isZoomed) window.addEventListener('keydown', onZoomKeydown)
  else window.removeEventListener('keydown', onZoomKeydown)
})

// A new product must never inherit the previous one's zoom state.
watch(
  () => props.product.id,
  () => {
    zoomed.value = false
  }
)

onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('keydown', onZoomKeydown)
})
</script>

<template>
  <article class="pdp">
    <!-- Hero: title + image + zoom -->
    <section class="pdp__card">
      <h1 class="pdp__title">{{ product.title }}</h1>

      <figure class="pdp__media">
        <ProductImage
          :src="product.image"
          :alt="product.title"
          ratio="16/9"
          eager
          sizes="(min-width: 900px) 70vw, 100vw"
        />

        <button
          type="button"
          class="pdp__zoom"
          aria-haspopup="dialog"
          :aria-expanded="zoomed"
          @click="openZoom"
        >
          <AppIcon name="zoom-in" :size="18" />
          <span class="visually-hidden">بزرگنمایی تصویر</span>
        </button>
      </figure>
    </section>

    <!-- Spec sheet -->
    <section class="pdp__card" aria-labelledby="product-spec-heading">
      <h2 id="product-spec-heading" class="pdp__heading">مشخصات فنی</h2>

      <dl class="spec">
        <div class="spec__row">
          <dt class="spec__term">قیمت</dt>
          <dd class="spec__value spec__value--price">
            {{ formatPrice(product.price) }}
          </dd>
        </div>

        <div class="spec__row">
          <dt class="spec__term">توضیحات</dt>
          <dd class="spec__value">
            <ul v-if="points.length" class="spec__points">
              <li v-for="(point, index) in points" :key="index">{{ point }}</li>
            </ul>
            <span v-else>—</span>
          </dd>
        </div>

        <div class="spec__row">
          <dt class="spec__term">دسته بندی</dt>
          <dd class="spec__value">
            <NuxtLink
              class="spec__link"
              :to="{ path: '/', query: { category: product.category } }"
            >
              {{ categoryLabel }}
            </NuxtLink>
          </dd>
        </div>

        <div class="spec__row">
          <dt class="spec__term">رتبه</dt>
          <dd class="spec__value">
            <StarRating :rate="product.rating.rate" :count="product.rating.count" />
          </dd>
        </div>

        <div class="spec__row">
          <dt class="spec__term">تعداد</dt>
          <dd class="spec__value">{{ formatInteger(product.rating.count) }}</dd>
        </div>
      </dl>
    </section>

    <!-- Zoom overlay -->
    <div
      v-if="zoomed"
      class="zoom"
      role="dialog"
      aria-modal="true"
      aria-label="تصویر بزرگ محصول"
      @click.self="zoomed = false"
    >
      <button
        ref="zoomClose"
        type="button"
        class="zoom__close"
        @click="zoomed = false"
      >
        <AppIcon name="close" :size="22" />
        <span class="visually-hidden">بستن تصویر بزرگ</span>
      </button>

      <img
        class="zoom__img"
        :src="product.image"
        :alt="product.title"
        @click.stop
      >
    </div>
  </article>
</template>

<style scoped>
.pdp {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* One raised white panel per group — the design's two cards on the blue-grey
   canvas. */
.pdp__card {
  padding: var(--space-5);
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-panel);
}

/* The design's title sits at the inline start (right in RTL), above the image. */
.pdp__title {
  font-size: var(--fs-2xl);
  color: var(--color-ink);
  overflow-wrap: anywhere;
  margin-bottom: var(--space-4);
}

.pdp__heading {
  font-size: var(--fs-xl);
  color: var(--color-ink);
  margin-bottom: var(--space-5);
}

.pdp__media {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: var(--color-surface-subtle);
}

/* The zoom control floats at the top-right of the image (inline start in RTL). */
.pdp__zoom {
  position: absolute;
  inset-block-start: var(--space-3);
  inset-inline-start: var(--space-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  color: var(--color-ink-muted);
  background-color: color-mix(in srgb, var(--color-surface) 88%, transparent);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(4px);
  transition:
    color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}

.pdp__zoom:hover {
  color: var(--color-active);
  border-color: var(--color-active);
}

/* --- Spec sheet --------------------------------------------------------- */

.spec {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Two cells per row: the term at the inline start, the value filling the rest.
   The term column is fixed so every label lines up down the sheet. */
.spec__row {
  display: grid;
  grid-template-columns: minmax(6rem, 10rem) minmax(0, 1fr);
  gap: var(--space-2);
  align-items: stretch;
}

.spec__term,
.spec__value {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  font-size: var(--fs-base);
  border-radius: var(--radius-md);
}

.spec__term {
  color: var(--color-ink-muted);
  background-color: var(--color-surface-subtle);
}

.spec__value {
  color: var(--color-ink);
  background-color: color-mix(in srgb, var(--color-surface-subtle) 55%, transparent);
  line-height: var(--lh-normal);
}

.spec__value--price {
  font-weight: var(--fw-bold);
}

/* The design's bulleted description. */
.spec__points {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
}

.spec__points li {
  position: relative;
  padding-inline-start: var(--space-4);
}

.spec__points li::before {
  content: '';
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0.6em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: var(--color-ink-muted);
}

.spec__link {
  color: var(--color-accent);
  font-weight: var(--fw-medium);
}

.spec__link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* --- Zoom overlay ------------------------------------------------------- */

.zoom {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background-color: rgba(10, 42, 81, 0.72);
}

.zoom__close {
  position: absolute;
  inset-block-start: var(--space-5);
  inset-inline-end: var(--space-5);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-pill);
  color: var(--color-ink);
  background-color: var(--color-surface);
}

.zoom__close:hover {
  background-color: var(--color-accent-soft);
  color: var(--color-accent);
}

/* The full-size image, contained so it never overflows the viewport. */
.zoom__img {
  max-width: min(100%, 64rem);
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
}

@media (min-width: 900px) {
  .pdp__card {
    padding: var(--space-6) var(--space-8);
  }

  .pdp__title {
    font-size: var(--fs-3xl);
  }
}
</style>
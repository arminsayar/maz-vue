<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '~/types/product'

/**
 * A single product card, matching the design: image, title, and one "view
 * details" action — nothing else. Price, rating and category are deliberately
 * *not* on the card (the design keeps them on the detail page's spec sheet), so
 * the grid scans as a wall of products rather than a wall of numbers.
 *
 * The whole card is one link (not a clickable div), so it is keyboard-focusable,
 * supports middle/right-click and announces as a link. The image is marked
 * decorative (alt="") because the adjacent title already names the product —
 * repeating it in the alt text would double-announce for screen-reader users.
 * The action is a styled span, not a nested link: an anchor inside an anchor is
 * invalid HTML, and the card's own link already carries the destination.
 */
const props = defineProps<{ product: Product; eager?: boolean }>()

const href = computed(() => `/products/${props.product.id}`)
</script>

<template>
  <article class="card">
    <NuxtLink :to="href" class="card__link">
      <div class="card__media">
        <ProductImage :src="product.image" alt="" :eager="eager" ratio="4/3" />
      </div>

      <div class="card__body">
        <h3 class="card__title">{{ product.title }}</h3>

        <span class="card__cta" aria-hidden="true">
          <!-- RTL: "forward" points left, so the chevron is mirrored. -->
          <AppIcon name="chevron-left" :size="15" />
          مشاهده جزئیات
        </span>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
.card {
  height: 100%;
}

.card__link {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  transition:
    box-shadow var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out);
}

.card__link:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.card__link:focus-visible {
  outline: var(--ring-width) solid var(--color-border-focus);
  outline-offset: var(--ring-offset);
}

/* The image is inset inside the card and rounded on all four corners, as in the
   design — it reads as a photo laid on the card, not as a full-bleed banner. */
.card__media {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: var(--color-surface-subtle);
}

.card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  flex: 1;
}

.card__title {
  font-family: var(--font-sans);
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  line-height: var(--lh-snug);
  letter-spacing: 0;
  color: var(--color-ink);
  text-align: center;
  /* Clamp long titles to two lines so cards stay aligned. */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(var(--fs-base) * var(--lh-snug) * 2);
}

/* The "view details" affordance: a centred pill that mirrors the design's
   outlined button. `margin-top: auto` pins it to the bottom of every card so
   the row stays aligned whatever the title's length. */
.card__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  margin-top: auto;
  min-height: 42px;
  padding-inline: var(--space-4);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--color-accent);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  transition:
    border-color var(--dur-fast) var(--ease-out),
    background-color var(--dur-fast) var(--ease-out);
}

.card__link:hover .card__cta {
  border-color: var(--color-accent);
  background-color: var(--color-accent-soft);
}

@media (prefers-reduced-motion: reduce) {
  .card__link:hover {
    transform: none;
  }
}
</style>
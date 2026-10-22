<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormatters } from '~/composables/useFormatters'

/**
 * Star rating.
 *
 * Stars are purely decorative; the exact value and review count are exposed on
 * the wrapper via `role="img"` + `aria-label`, so screen-reader users get the
 * precise figure rather than having to infer it from the number of stars.
 *
 * The review count uses the message pair (no/one/many) with the count already
 * formatted in locale digits, rather than vue-i18n's numeric pluralisation,
 * because a pre-formatted Persian-digit string can no longer drive the latter.
 */
const props = withDefaults(
  defineProps<{
    rate: number
    count?: number
    showMeta?: boolean
    size?: 'sm' | 'md'
  }>(),
  { count: 0, showMeta: true, size: 'sm' }
)

const { t } = useI18n()
const { rating, integer } = useFormatters()

const clamped = computed(() => Math.max(0, Math.min(5, props.rate || 0)))

const stars = computed(() =>
  Array.from({ length: 5 }, (_, i) => ({
    index: i,
    isFull: i + 1 <= Math.round(clamped.value)
  }))
)

const reviewCount = computed(() => props.count ?? 0)

const reviewLabel = computed(() => {
  const count = reviewCount.value
  if (count === 0) return t('rating.noReviews')
  if (count === 1) return t('rating.oneReview', { count: integer(count) })
  return t('rating.reviews', { count: integer(count) })
})

const accessibleLabel = computed(() =>
  props.rate > 0
    ? t('rating.accessible', { rate: rating(props.rate), reviews: reviewLabel.value })
    : t('rating.noRating')
)
</script>

<template>
  <div class="rating" :class="`rating--${size}`">
    <span class="rating__stars" role="img" :aria-label="accessibleLabel">
      <span
        v-for="star in stars"
        :key="star.index"
        class="rating__star"
        :class="{ 'rating__star--full': star.isFull }"
      >
        <AppIcon name="star" :size="size === 'sm' ? 14 : 17" filled />
      </span>
    </span>
    <span v-if="showMeta" class="rating__meta">
      <span class="rating__value">{{ rating(rate) }}</span>
      <span class="rating__count">{{ reviewLabel }}</span>
    </span>
  </div>
</template>

<style scoped>
.rating {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.rating__stars {
  display: inline-flex;
  gap: 1px;
}

.rating__star {
  color: var(--color-border-strong);
  opacity: 0.75;
  line-height: 0;
}

.rating__star--full {
  color: var(--color-star);
  opacity: 1;
}

.rating--md .rating__stars {
  gap: 2px;
}

.rating__meta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-sm);
  color: var(--color-ink-muted);
}

.rating__value {
  font-weight: var(--fw-semibold);
  color: var(--color-ink);
}

.rating--sm .rating__meta {
  font-size: var(--fs-xs);
}

@media (prefers-reduced-motion: no-preference) {
  .rating__star {
    transition: color var(--dur-fast) var(--ease-out);
  }
}
</style>

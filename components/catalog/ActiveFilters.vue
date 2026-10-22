<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormatters } from '~/composables/useFormatters'

/**
 * Active-filter summary, rendered as the card that sits on top of the product
 * grid.
 *
 * Gives the user an explicit, removable chip for every active constraint — the
 * search term counts once and each selected category gets its own chip — plus a
 * single "clear all". Chips are buttons so each is keyboard-operable, and this
 * is what makes the "show the selected filters" requirement concrete.
 *
 * The card renders nothing at all when no constraint is active, so the grid
 * starts flush with the toolbar instead of leaving an empty panel behind.
 * Category labels resolve through the locale-aware formatter, and the chip copy
 * (search term, removal labels, clear-all) comes from `catalog.active.*`.
 */
const props = defineProps<{
  search: string
  categories: ReadonlyArray<string>
}>()

const emit = defineEmits<{
  'clear-search': []
  'clear-category': [value: string]
  'clear-all': []
}>()

const { t } = useI18n()
const { categoryLabel } = useFormatters()

const hasAny = computed(() =>
  Boolean(props.search.trim() || props.categories.length)
)

const searchTerm = computed(() => props.search.trim())
</script>

<template>
  <section v-if="hasAny" class="active" :aria-label="t('catalog.active.title')">
    <p class="active__title">{{ t('catalog.active.title') }}</p>

    <ul class="active__list">
      <li v-if="searchTerm">
        <button type="button" class="active__chip" @click="emit('clear-search')">
          <AppIcon name="search" :size="14" />
          <span>{{ t('catalog.active.searchChip', { term: searchTerm }) }}</span>
          <AppIcon name="close" :size="12" />
          <span class="visually-hidden">{{ t('catalog.active.removeSearch') }}</span>
        </button>
      </li>
      <li v-for="category in categories" :key="category">
        <button
          type="button"
          class="active__chip"
          @click="emit('clear-category', category)"
        >
          <span>{{ categoryLabel(category) }}</span>
          <AppIcon name="close" :size="12" />
          <span class="visually-hidden">
            {{ t('catalog.active.removeCategory', { category: categoryLabel(category) }) }}
          </span>
        </button>
      </li>
    </ul>

    <button type="button" class="active__clear" @click="emit('clear-all')">
      {{ t('catalog.active.clearAll') }}
    </button>
  </section>
</template>

<style scoped>
/* White card, same surface/radius/shadow as the filter boxes, with the title at
   the inline start and the chips pushed to the inline end — the design's
   "فیلترهای اعمال شده" row. */
.active {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-3);
  padding: var(--space-4) var(--space-5);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

/* An auto inline-end margin absorbs the free space, so the title stays against
   the start edge and everything after it is pushed to the end edge. */
.active__title {
  margin-inline-end: auto;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: var(--color-ink);
}

.active__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.active__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-ink);
  background-color: var(--color-surface-subtle);
  border-radius: var(--radius-pill);
  max-width: 22rem;
  transition: background-color var(--dur-fast) var(--ease-out);
}

.active__chip:hover {
  background-color: var(--color-accent-soft);
  color: var(--color-accent-active);
}

.active__chip span:first-of-type {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.active__clear {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--color-ink-muted);
  text-decoration: underline;
  text-underline-offset: 2px;
  padding: var(--space-1) var(--space-2);
}

.active__clear:hover {
  color: var(--color-active);
}
</style>
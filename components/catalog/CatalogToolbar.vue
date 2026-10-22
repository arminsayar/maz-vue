<script setup lang="ts">
import { computed } from 'vue'
import type { SortKey } from '~/types/catalog'

/**
 * Persian numerals for user-facing counts. `Intl` gives the Persian digits and
 * the Persian thousands separator without any manual digit mapping.
 */
const numberFormatter = new Intl.NumberFormat('fa-IR')

/**
 * Catalog filter panel.
 *
 * The design's control column, and nothing else: three boxes — search, sort and
 * category — in a raised white panel next to the product grid. The page owns the
 * two-column layout and the grid itself; this component only owns the controls,
 * so it stays a pure "filters in, filter changes out" view and never has to know
 * how the results are laid out.
 *
 * The sort and category boxes are `<details>` elements, collapsed no further
 * than the design shows and with a chevron that flips when open. They are
 * `open` by default because the design shows every option, and the native
 * element keeps the disclosure keyboard- and screen-reader-accessible for free.
 */
const props = defineProps<{
  categories: ReadonlyArray<string>
  search: string
  selectedCategories: ReadonlyArray<string>
  sort: SortKey
  resultCount: number
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:categories': [value: string[]]
  'update:sort': [value: SortKey]
}>()

const countLabel = computed(
  () => `${numberFormatter.format(props.resultCount)} محصول`
)
</script>

<template>
  <aside class="panel" aria-label="فیلتر و جستجو">
    <section class="fbox">
      <h2 class="fbox__title">فیلتر و جستجو</h2>
      <div class="fbox__body">
        <SearchInput
          :model-value="search"
          submit-label="جستجو"
          @update:model-value="emit('update:search', $event)"
        />
      </div>
    </section>

    <details class="fbox" open>
      <summary class="fbox__head">
        <span class="fbox__title">مرتب سازی</span>
        <AppIcon class="fbox__chevron" name="chevron-down" :size="16" />
      </summary>
      <div class="fbox__body">
        <SortFilter
          :model-value="sort"
          @update:model-value="emit('update:sort', $event)"
        />
      </div>
    </details>

    <details class="fbox" open>
      <summary class="fbox__head">
        <span class="fbox__title">دسته بندی</span>
        <AppIcon class="fbox__chevron" name="chevron-down" :size="16" />
      </summary>
      <div class="fbox__body">
        <CategoryFilter
          :categories="categories"
          :model-value="selectedCategories"
          @update:model-value="emit('update:categories', $event)"
        />
      </div>
    </details>

    <p class="panel__count" aria-live="polite">{{ countLabel }}</p>
  </aside>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* One raised white box per control group. */
.fbox {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}

/* The search box's heading is a plain h2; the other two use the <summary>,
   which is a heading-like control already. Both share one type style. */
.fbox__title {
  font-family: var(--font-sans);
  font-size: var(--fs-md);
  font-weight: var(--fw-bold);
  line-height: var(--lh-snug);
  color: var(--color-ink);
}

.fbox > .fbox__title {
  display: block;
  padding: var(--space-4) var(--space-5) 0;
  text-align: center;
}

.fbox__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  list-style: none;
}

/* Remove the platform disclosure triangle; the chevron does that job. */
.fbox__head::-webkit-details-marker {
  display: none;
}

.fbox__chevron {
  color: var(--color-ink-subtle);
  transition: transform var(--dur-fast) var(--ease-out);
}

.fbox[open] .fbox__chevron {
  transform: rotate(180deg);
}

.fbox__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5) var(--space-5);
}

/* The summary already carries the box's top padding, so the open body only
   needs its bottom half. */
.fbox__head + .fbox__body {
  padding-top: 0;
}

.panel__count {
  font-size: var(--fs-sm);
  color: var(--color-ink-subtle);
  text-align: center;
}
</style>
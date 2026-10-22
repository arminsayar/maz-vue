<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { SortKey } from '~/types/catalog'
import { SORT_OPTIONS } from '~/constants/catalog'

/**
 * Sort control, rendered as a radio group.
 *
 * The design shows the sort options as radios inside the toolbar's «مرتب سازی»
 * box rather than a dropdown, so a native `<input type="radio">` group is used:
 * it is keyboard- and screen-reader-friendly out of the box, arrow keys move
 * between options for free, and there is no custom popup to maintain.
 *
 * The incoming value is validated against the known sort keys instead of being
 * cast, so a hand-edited URL can never produce an unsupported sort. The control
 * is not repeated anywhere else in the tree, so a fixed radio `name` is enough
 * to keep the group exclusive. Option labels resolve from the
 * `catalog.sortOptions.*` messages via each option's `labelKey`.
 */
defineProps<{ modelValue: SortKey }>()

const emit = defineEmits<{ 'update:modelValue': [value: SortKey] }>()

const { t } = useI18n()

function onChange(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  const match = SORT_OPTIONS.find((option) => option.value === raw)
  if (match) emit('update:modelValue', match.value)
}
</script>

<template>
  <div class="sort" role="radiogroup" :aria-label="t('catalog.sort.title')">
    <label
      v-for="option in SORT_OPTIONS"
      :key="option.value"
      class="sort__option"
      :class="{ 'sort__option--active': option.value === modelValue }"
    >
      <input
        class="sort__input"
        type="radio"
        name="catalog-sort"
        :value="option.value"
        :checked="option.value === modelValue"
        @change="onChange"
      >
      <span class="sort__label">{{ t(option.labelKey) }}</span>
    </label>
  </div>
</template>

<style scoped>
.sort {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* The circle sits at the inline start (the right in RTL) and the label follows
   it, exactly as in the design. */
.sort__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  color: var(--color-ink-muted);
  transition: color var(--dur-fast) var(--ease-out);
}

.sort__option:hover {
  color: var(--color-ink);
}

.sort__option--active {
  color: var(--color-active);
  font-weight: var(--fw-medium);
}

/*
 * Custom radio: `appearance: none` then draw the circle ourselves so the
 * selected state is the design's solid magenta dot rather than the OS default.
 * A 9px inset shadow fills the whole 18px control, leaving the border as a ring.
 */
.sort__input {
  appearance: none;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin: 0;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 50%;
  background-color: var(--color-surface);
  cursor: pointer;
  transition:
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}

.sort__input:hover {
  border-color: var(--color-ink-subtle);
}

.sort__input:checked {
  border-color: var(--color-active);
  box-shadow: inset 0 0 0 9px var(--color-active);
}

.sort__label {
  font-size: var(--fs-base);
  line-height: var(--lh-snug);
}
</style>
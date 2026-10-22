<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFormatters } from '~/composables/useFormatters'

/**
 * Category filter — a multi-select checkbox group.
 *
 * The design shows the categories as a list of checkboxes, and the brief asks
 * that more than one filter can be active at a time, so this is a real group of
 * `<input type="checkbox">` elements: several categories can be ticked at once
 * and the catalog matches a product when its category is *any* of them.
 *
 * No "all" row is needed — an empty selection already means "everything" — so
 * the list mirrors the design exactly. Because it is a plain checkbox group it
 * is keyboard-operable, screen-reader-friendly and label-associated for free.
 * Labels follow the active locale via `useFormatters().categoryLabel`.
 */
const props = defineProps<{
  categories: ReadonlyArray<string>
  modelValue: ReadonlyArray<string>
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>()

const { t } = useI18n()
const { categoryLabel } = useFormatters()

const options = computed(() =>
  props.categories.map((category) => ({
    value: category,
    label: categoryLabel(category)
  }))
)

const selected = computed(() => new Set(props.modelValue))

function toggle(value: string): void {
  const next = new Set(props.modelValue)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  emit('update:modelValue', [...next])
}
</script>

<template>
  <div class="cats" role="group" :aria-label="t('catalog.categories.filterAria')">
    <label
      v-for="option in options"
      :key="option.value"
      class="cats__option"
      :class="{ 'cats__option--active': selected.has(option.value) }"
    >
      <input
        class="cats__input"
        type="checkbox"
        :value="option.value"
        :checked="selected.has(option.value)"
        @change="toggle(option.value)"
      >
      <span class="cats__label">{{ option.label }}</span>
    </label>
  </div>
</template>

<style scoped>
.cats {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* The box sits at the inline start (the right in RTL) and the label follows it,
   exactly as in the design. */
.cats__option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  color: var(--color-ink-muted);
  transition: color var(--dur-fast) var(--ease-out);
}

.cats__option:hover {
  color: var(--color-ink);
}

.cats__option--active {
  color: var(--color-active);
  font-weight: var(--fw-medium);
}

/*
 * Custom checkbox. `appearance: none` plus a white check glyph as a background
 * image, so the ticked state is the design's magenta square with a white check
 * rather than whatever the OS draws. The SVG is inlined (not fetched) so the
 * control renders offline and adds no request.
 */
.cats__input {
  appearance: none;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin: 0;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 4px;
  background-color: var(--color-surface);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 12px 12px;
  cursor: pointer;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out);
}

.cats__input:hover {
  border-color: var(--color-ink-subtle);
}

.cats__input:checked {
  border-color: var(--color-active);
  background-color: var(--color-active);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
}

.cats__label {
  font-size: var(--fs-base);
  line-height: var(--lh-snug);
}
</style>
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { SEARCH_DEBOUNCE_MS } from '~/constants/catalog'

/**
 * Catalog search field.
 *
 * The input owns a local text buffer and debounces the outgoing update so the
 * URL is not rewritten on every keystroke. The parent (`useCatalogFilters`)
 * remains the source of truth: when it changes the value externally — a
 * back/forward navigation or a cleared filter — the buffer is resynced without
 * re-emitting, so there is no feedback loop.
 *
 * Enter and the optional submit button flush immediately, so an intentional
 * search never waits out the debounce. Passing `submitLabel` renders the
 * design's full-width «جستجو» button below the field; without it the component
 * is just the field, for contexts that want the control on its own.
 */
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeholder?: string
    id?: string
    submitLabel?: string
  }>(),
  {
    placeholder: 'جستوجو در محصولات',
    id: 'catalog-search',
    submitLabel: undefined
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
}>()

const text = ref(props.modelValue)
let timer: ReturnType<typeof setTimeout> | undefined

function cancelPending(): void {
  if (timer !== undefined) {
    clearTimeout(timer)
    timer = undefined
  }
}

// Keep the buffer in step with external changes (clear-all, back/forward).
watch(
  () => props.modelValue,
  (value) => {
    if (value !== text.value) {
      cancelPending()
      text.value = value
    }
  }
)

function commit(value: string): void {
  cancelPending()
  emit('update:modelValue', value)
}

/** Apply the current buffer immediately (Enter, or the submit button). */
function onSubmit(): void {
  commit(text.value)
  emit('submit', text.value)
}

function onInput(event: Event): void {
  text.value = (event.target as HTMLInputElement).value
  cancelPending()
  timer = setTimeout(() => emit('update:modelValue', text.value), SEARCH_DEBOUNCE_MS)
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') onSubmit()
}

function onClear(): void {
  text.value = ''
  commit('')
}

onBeforeUnmount(cancelPending)
</script>

<template>
  <div class="search" :class="{ 'search--stacked': submitLabel }">
    <div class="search__field">
      <label class="visually-hidden" :for="id">جستوجوی محصولات بر پایهٔ نام</label>
      <span class="search__icon" aria-hidden="true">
        <AppIcon name="search" :size="18" />
      </span>

      <input
        :id="id"
        class="search__input"
        type="search"
        autocomplete="off"
        enterkeyhint="search"
        :placeholder="placeholder"
        :value="text"
        @input="onInput"
        @keydown="onKeydown"
      >

      <button
        v-if="text"
        type="button"
        class="search__clear"
        @click="onClear"
      >
        <AppIcon name="close" :size="15" />
        <span class="visually-hidden">پاک کردن جستوجو</span>
      </button>
    </div>

    <button v-if="submitLabel" type="button" class="search__submit" @click="onSubmit">
      {{ submitLabel }}
    </button>
  </div>
</template>

<style scoped>
.search {
  display: flex;
  align-items: center;
}

/* With a submit button the field and the button stack (the design's layout). */
.search--stacked {
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-3);
}

.search__field {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search__icon {
  position: absolute;
  inset-inline-start: var(--space-4);
  display: inline-flex;
  color: var(--color-ink-subtle);
  pointer-events: none;
}

.search__input {
  width: 100%;
  min-height: 46px;
  padding: 0 var(--space-10) 0 var(--space-10);
  font-size: var(--fs-base);
  color: var(--color-ink);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  transition:
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}

.search__input::placeholder {
  color: var(--color-ink-subtle);
}

.search__input:hover {
  border-color: var(--color-ink-subtle);
}

.search__input:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 var(--ring-width) var(--ring-color);
}

/* Hide the native WebKit clear affordance — we render our own. */
.search__input::-webkit-search-cancel-button {
  appearance: none;
}

.search__clear {
  position: absolute;
  inset-inline-end: var(--space-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-pill);
  color: var(--color-ink-muted);
}

.search__clear:hover {
  background-color: var(--color-surface-subtle);
  color: var(--color-ink);
}

/* The design's primary search action: full-width magenta pill. */
.search__submit {
  width: 100%;
  min-height: 46px;
  padding-inline: var(--space-4);
  font-size: var(--fs-md);
  font-weight: var(--fw-semibold);
  color: var(--color-accent-contrast);
  background-color: var(--color-accent);
  border-radius: var(--radius-pill);
  transition: background-color var(--dur-fast) var(--ease-out);
}

.search__submit:hover {
  background-color: var(--color-accent-hover);
}
</style>
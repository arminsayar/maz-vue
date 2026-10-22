<script setup lang="ts">
/**
 * Button primitive.
 *
 * Renders a real <button> by default, or a <NuxtLink> when `to` is provided, so
 * navigation uses link semantics (right-click, middle-click, correct announce)
 * instead of a clickable div. Loading and disabled states are handled here so
 * callers never re-implement them.
 */
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    to?: string
    type?: 'button' | 'submit'
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    to: undefined,
    type: 'button',
    disabled: false,
    loading: false,
    block: false
  }
)
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    class="btn"
    :class="[
      `btn--${variant}`,
      `btn--${size}`,
      { 'btn--block': block, 'btn--loading': loading }
    ]"
    :to="to"
    :type="to ? undefined : type"
    :disabled="to ? undefined : disabled || loading"
    :aria-disabled="to ? undefined : disabled || loading"
    :aria-busy="loading || undefined"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-base);
  line-height: 1;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  text-align: center;
  white-space: nowrap;
  min-height: 40px;
  padding: 0 var(--space-4);
  touch-action: manipulation;
  transition:
    background-color var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}

.btn--sm {
  min-height: 34px;
  font-size: var(--fs-sm);
  padding: 0 var(--space-3);
}

.btn--lg {
  min-height: 48px;
  font-size: var(--fs-lg);
  padding: 0 var(--space-6);
}

.btn--block {
  display: flex;
  width: 100%;
}

.btn--primary {
  background-color: var(--color-accent);
  color: var(--color-accent-contrast);
  border-color: var(--color-accent);
}

.btn--primary:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.btn--primary:active:not(:disabled) {
  background-color: var(--color-accent-active);
  transform: translateY(1px);
}

.btn--secondary {
  background-color: var(--color-surface);
  color: var(--color-ink);
  border-color: var(--color-border-strong);
}

.btn--secondary:hover:not(:disabled) {
  border-color: var(--color-ink-subtle);
  background-color: var(--color-surface-subtle);
}

.btn--ghost {
  background-color: transparent;
  color: var(--color-ink-muted);
}

.btn--ghost:hover:not(:disabled) {
  background-color: var(--color-surface-subtle);
  color: var(--color-ink);
}

.btn--danger {
  background-color: transparent;
  color: var(--color-danger);
  border-color: var(--color-danger-border);
}

.btn--danger:hover:not(:disabled) {
  background-color: var(--color-danger-soft);
}

.btn:disabled,
.btn[aria-disabled='true'] {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn__spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: btn-spin 0.6s linear infinite;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn__spinner {
    animation-duration: 1.4s;
  }
}
</style>
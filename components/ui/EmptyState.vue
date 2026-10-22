<script setup lang="ts">
/**
 * Shared empty / error presentation.
 *
 * One component covers "no products", "no results", "not found" and "error"
 * states so they stay visually consistent. The caller supplies the message and
 * an optional action slot (e.g. Retry or Clear filters). Error tone announces
 * assertively; neutral tone announces politely.
 */
withDefaults(
  defineProps<{
    icon?: 'package' | 'search' | 'alert'
    title: string
    description?: string
    tone?: 'neutral' | 'danger'
  }>(),
  { icon: 'package', description: '', tone: 'neutral' }
)
</script>

<template>
  <div
    class="empty"
    :class="`empty--${tone}`"
    :role="tone === 'danger' ? 'alert' : 'status'"
  >
    <span class="empty__icon" aria-hidden="true">
      <AppIcon :name="icon" :size="26" />
    </span>
    <h2 class="empty__title">{{ title }}</h2>
    <p v-if="description" class="empty__description">{{ description }}</p>
    <div v-if="$slots.default" class="empty__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  max-width: 44ch;
  margin: var(--space-12) auto;
  padding: var(--space-8) var(--space-4);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
}

.empty__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: var(--radius-pill);
  background-color: var(--color-surface-subtle);
  color: var(--color-ink-muted);
  margin-bottom: var(--space-1);
}

.empty--danger .empty__icon {
  background-color: var(--color-danger-soft);
  color: var(--color-danger);
}

.empty__title {
  font-size: var(--fs-xl);
  font-family: var(--font-display);
  color: var(--color-ink);
}

.empty__description {
  font-size: var(--fs-base);
  color: var(--color-ink-muted);
  line-height: var(--lh-normal);
}

.empty__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}
</style>
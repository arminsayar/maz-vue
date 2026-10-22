<script setup lang="ts">
/**
 * Loading placeholder for a product card.
 *
 * Mirrors the real card — inset, rounded media, two title lines and the
 * "view details" pill — so there is no layout shift when the real data arrives.
 */
</script>

<template>
  <div class="card-skeleton" aria-hidden="true">
    <div class="skeleton card-skeleton__media" />
    <div class="card-skeleton__body">
      <div class="skeleton card-skeleton__line card-skeleton__line--lg" />
      <div class="skeleton card-skeleton__line card-skeleton__line--md" />
      <div class="skeleton card-skeleton__cta" />
    </div>
  </div>
</template>

<style scoped>
.card-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

.card-skeleton__media {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg);
}

.card-skeleton__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-1);
}

.card-skeleton__line {
  height: 12px;
  border-radius: var(--radius-xs);
}

.card-skeleton__line--lg {
  width: 90%;
}

.card-skeleton__line--md {
  width: 60%;
}

.card-skeleton__cta {
  width: 100%;
  height: 42px;
  margin-top: var(--space-2);
  border-radius: var(--radius-pill);
}
</style>
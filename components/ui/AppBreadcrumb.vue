<script setup lang="ts">
/**
 * Breadcrumb trail.
 *
 * A real `<nav>` + ordered list, so assistive tech announces it as navigation
 * and reading order matches the visual order. The last crumb — the one without a
 * `to` — is marked `aria-current="page"` and is not a link, which is what the
 * design shows in navy rather than magenta.
 *
 * Separators point *left* (‹) because the document is RTL and "deeper" is to the
 * left; the glyph is picked explicitly instead of being flipped with a transform.
 */
export interface BreadcrumbItem {
  label: string
  /** Omit on the current page: it renders as text, not a link. */
  to?: string
  icon?: 'home'
  /** Icon-only crumb (the home link): its label stays for screen readers only. */
  hideLabel?: boolean
}

defineProps<{ items: ReadonlyArray<BreadcrumbItem> }>()
</script>

<template>
  <nav class="crumbs" aria-label="مسیر صفحه">
    <ol class="crumbs__list">
      <li
        v-for="(item, index) in items"
        :key="`${index}-${item.label}`"
        class="crumbs__item"
      >
        <NuxtLink v-if="item.to" class="crumbs__link" :to="item.to">
          <AppIcon v-if="item.icon" :name="item.icon" :size="18" />
          <span :class="{ 'visually-hidden': item.hideLabel }">{{ item.label }}</span>
        </NuxtLink>

        <span v-else class="crumbs__current" aria-current="page">
          <AppIcon v-if="item.icon" :name="item.icon" :size="18" />
          <span :class="{ 'visually-hidden': item.hideLabel }">{{ item.label }}</span>
        </span>

        <AppIcon
          v-if="index < items.length - 1"
          class="crumbs__sep"
          name="chevron-left"
          :size="14"
        />
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.crumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.crumbs__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.crumbs__link,
.crumbs__current {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  line-height: 1;
}

.crumbs__link {
  color: var(--color-ink);
  transition: color var(--dur-fast) var(--ease-out);
}

.crumbs__link:hover {
  color: var(--color-active);
}

.crumbs__current {
  color: var(--color-ink);
  font-weight: var(--fw-semibold);
}

.crumbs__sep {
  color: var(--color-ink-subtle);
}
</style>
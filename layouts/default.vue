<script setup lang="ts">
/**
 * Default layout: skip link, header, routed content, footer.
 *
 * The skip link is the first focusable element on the page and targets #main.
 * A single <main> landmark wraps the routed page, so pages themselves never
 * need to declare one.
 */
</script>

<template>
  <div class="layout">
    <a class="skip-link" href="#main">رفتن به محتوای اصلی</a>
    <SiteHeader />
    <main id="main" class="layout__main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.layout__main {
  flex: 1;
}
</style>
<script setup lang="ts">
/**
 * Root component.
 *
 * NuxtLayout applies layouts/default.vue to routed pages, and NuxtPage renders
 * the active route. A page transition is enabled for a subtle sense of
 * navigation; it is neutralised by the reduced-motion rules in main.css.
 */
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Page transitions are declared in main.css so they are globally consistent. */
</style>
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { NuxtError } from '#app'

/**
 * Global error page.
 *
 * Renders for unhandled route errors (including 404s that Nuxt cannot match to
 * a page). It deliberately reuses the same EmptyState presentation as the
 * in-page states so error UI is visually consistent everywhere, and offers a
 * single clear recovery action. Copy comes from the `errorPage.*` messages so
 * the page stays localisable like the rest of the UI.
 */
const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()

const isNotFound = computed(() => props.error?.statusCode === 404)

function goHome(): void {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="error-page container">
    <EmptyState
      :icon="isNotFound ? 'search' : 'alert'"
      :tone="isNotFound ? 'neutral' : 'danger'"
      :title="isNotFound ? t('errorPage.notFoundTitle') : t('errorPage.genericTitle')"
      :description="
        isNotFound
          ? t('errorPage.notFoundDescription')
          : t('errorPage.genericDescription')
      "
    >
      <BaseButton @click="goHome">{{ t('errorPage.backToStore') }}</BaseButton>
    </EmptyState>
  </div>
</template>

<style scoped>
.error-page {
  padding-block: var(--space-16);
}
</style>
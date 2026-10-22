<script setup lang="ts">
import type { NuxtError } from '#app'

/**
 * Global error page.
 *
 * Renders for unhandled route errors (including 404s that Nuxt cannot match to
 * a page). It deliberately reuses the same EmptyState presentation as the
 * in-page states so error UI is visually consistent everywhere, and offers a
 * single clear recovery action.
 */
const props = defineProps<{ error: NuxtError }>()

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
      :title="isNotFound ? 'صفحه پیدا نشد' : 'مشکلی پیش آمد'"
      :description="
        isNotFound
          ? 'صفحه‌ای که به دنبالش هستید وجود ندارد یا جابه‌جا شده است.'
          : 'هنگام نمایش این صفحه خطای پیش‌بینی‌نشده‌ای رخ داد.'
      "
    >
      <BaseButton @click="goHome">بازگشت به فروشگاه</BaseButton>
    </EmptyState>
  </div>
</template>

<style scoped>
.error-page {
  padding-block: var(--space-16);
}
</style>
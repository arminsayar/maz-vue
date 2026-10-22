<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Product image with a fixed aspect ratio, lazy loading and an error fallback.
 *
 * Centralising this means the card and the detail gallery share identical
 * sizing/loading behaviour, and neither re-implements broken-image handling.
 * Aspect ratio is set via CSS so space is reserved before load (no layout shift),
 * and the fallback copy comes from the `product.image.*` messages so it follows
 * the active locale.
 */
const props = withDefaults(
  defineProps<{
    src: string
    alt: string
    ratio?: '4/3' | '1/1' | '3/4' | '16/9'
    eager?: boolean
    sizes?: string
  }>(),
  { ratio: '4/3', eager: false, sizes: undefined }
)

const { t } = useI18n()

const failed = ref(false)

// A new src deserves a fresh chance to load.
watch(
  () => props.src,
  () => {
    failed.value = false
  }
)
</script>

<template>
  <div class="pimage" :style="{ aspectRatio: ratio }">
    <img
      v-if="src && !failed"
      class="pimage__img"
      :src="src"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      :sizes="sizes"
      decoding="async"
      @error="failed = true"
    >
    <div
      v-else
      class="pimage__fallback"
      role="img"
      :aria-label="alt || t('product.image.unavailableAria')"
    >
      <AppIcon name="package" :size="30" />
      <span class="pimage__fallback-text">{{ t('product.image.unavailable') }}</span>
    </div>
  </div>
</template>

<style scoped>
.pimage {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-surface-subtle);
}

.pimage__img {
  width: 100%;
  height: 100%;
  /* Product photography sits on white; contain avoids awkward cropping. */
  object-fit: contain;
  object-position: center;
}

.pimage__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-ink-subtle);
}

.pimage__fallback-text {
  font-size: var(--fs-xs);
  letter-spacing: 0.01em;
}
</style>
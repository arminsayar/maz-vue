<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * Accessible slide-over.
 *
 * The layout mounts it for the mobile navigation menu (the hamburger's target),
 * and it is generic enough to host any secondary panel.
 *
 * Renders only while open (so nothing enters the SSR output, avoiding hydration
 * mismatch) and is teleported to <body> to escape ancestor stacking or overflow
 * contexts. Implements: Escape to close, backdrop dismissal, body scroll lock,
 * initial focus into the panel, a focus trap while open, and focus restoration
 * to whatever was focused before opening.
 */
const props = withDefaults(
  defineProps<{ open: boolean; title: string; closeLabel?: string }>(),
  { closeLabel: undefined }
)
const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()

const closeText = computed(() => props.closeLabel ?? t('common.close'))

const panel = ref<HTMLElement | null>(null)
let previouslyFocused: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusableItems(): HTMLElement[] {
  if (!panel.value) return []
  return Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE))
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    emit('close')
    return
  }
  if (event.key !== 'Tab') return

  const items = focusableItems()
  if (items.length === 0) return

  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement as HTMLElement | null

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (!import.meta.client) return

    if (isOpen) {
      previouslyFocused = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      await nextTick()
      const items = focusableItems()
      ;(items[0] ?? panel.value)?.focus()
    } else {
      document.body.style.overflow = ''
      previouslyFocused?.focus?.()
      previouslyFocused = null
    }
  },
  // `immediate` so the side effects (scroll lock, initial focus) also apply if
  // the drawer ever mounts already open. On the server the guard above exits.
  { immediate: true }
)

onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport v-if="open" to="body">
    <div class="drawer">
      <div class="drawer__backdrop" @click="emit('close')" />
      <div
        ref="panel"
        class="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabindex="-1"
        @keydown="onKeydown"
      >
        <header class="drawer__header">
          <h2 id="drawer-title" class="drawer__title">{{ title }}</h2>
          <button
            type="button"
            class="drawer__close"
            :aria-label="closeText"
            @click="emit('close')"
          >
            <AppIcon name="close" :size="20" />
          </button>
        </header>

        <div class="drawer__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="drawer__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.drawer {
  position: fixed;
  inset: 0;
  z-index: var(--z-drawer);
}

.drawer__backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(10, 42, 81, 0.45);
  animation: drawer-fade var(--dur-base) var(--ease-out);
}

/*
 * The drawer is anchored to the inline-end edge (physical left in RTL) and
 * slides in along the inline axis. The offset direction therefore has to flip
 * with the document direction, which the `--drawer-slide-from` variable keeps
 * in one place instead of duplicating the whole keyframe rule.
 */
.drawer__panel {
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  height: 100%;
  width: min(22rem, 90vw);
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-lg);
  outline: none;
  animation: drawer-slide var(--dur-slow) var(--ease-out);
}

:root[dir='rtl'] .drawer__panel {
  --drawer-slide-from: -100%;
}

.drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.drawer__title {
  font-size: var(--fs-lg);
}

.drawer__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-pill);
  color: var(--color-ink-muted);
}

.drawer__close:hover {
  background-color: var(--color-surface-subtle);
  color: var(--color-ink);
}

.drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.drawer__footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--space-3);
}

@keyframes drawer-fade {
  from {
    opacity: 0;
  }
}

@keyframes drawer-slide {
  from {
    transform: translateX(var(--drawer-slide-from, 100%));
  }
}

@media (prefers-reduced-motion: reduce) {
  .drawer__backdrop,
  .drawer__panel {
    animation: none;
  }
}
</style>
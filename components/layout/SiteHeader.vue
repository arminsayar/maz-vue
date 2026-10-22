<script setup lang="ts">
import { ref } from 'vue'
import {
  HEADER_CALL,
  HEADER_CTA,
  HEADER_LINKS,
  HEADER_MENU_LABEL
} from '~/constants/site'

/**
 * Site header.
 *
 * A full-bleed white bar — flush with the top of the viewport and running edge
 * to edge. It carries one of two things, depending on the viewport:
 *
 *   - desktop: the design's quick-links row (four icon + label links) plus the
 *     magenta «تماس با ما» button;
 *   - mobile: only the two icon buttons the design shows — a hamburger and a
 *     call button. Tapping the hamburger opens a slide-over with the same links,
 *     so nothing is lost on a small screen; the call button is a real `tel:`
 *     link, so on a phone it dials.
 *
 * Only the background is full-bleed; the content stays on the page's `container`
 * grid so the header lines up with the catalog below it.
 */
const menuOpen = ref(false)
</script>

<template>
  <header class="header">
    <div class="container header__inner">
      <nav class="header__nav" aria-label="ناوبری اصلی">
        <NuxtLink
          v-for="link in HEADER_LINKS"
          :key="link.label"
          class="header__link"
          :class="{ 'header__link--accent': link.accent }"
          :to="link.to"
        >
          <AppIcon :name="link.icon" :size="16" />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <NuxtLink class="header__cta" :to="HEADER_CTA.to">
        <AppIcon :name="HEADER_CTA.icon" :size="16" />
        <span>{{ HEADER_CTA.label }}</span>
      </NuxtLink>

      <!--
        Mobile controls. DOM order is hamburger-then-call so that, in RTL, the
        menu sits at the inline start (the right) and the call button at the
        inline end (the left) — the layout in the design.
      -->
      <div class="header__compact">
        <button
          type="button"
          class="header__icon-btn"
          :aria-label="HEADER_MENU_LABEL"
          :aria-expanded="menuOpen"
          @click="menuOpen = true"
        >
          <AppIcon name="menu" :size="22" />
        </button>

        <a
          class="header__icon-btn"
          :href="HEADER_CALL.href"
          :aria-label="HEADER_CALL.label"
        >
          <AppIcon name="phone" :size="20" />
        </a>
      </div>
    </div>

    <AppDrawer
      :open="menuOpen"
      :title="HEADER_MENU_LABEL"
      close-label="بستن منو"
      @close="menuOpen = false"
    >
      <nav class="menu" aria-label="ناوبری موبایل">
        <NuxtLink
          v-for="link in HEADER_LINKS"
          :key="link.label"
          class="menu__link"
          :class="{ 'menu__link--accent': link.accent }"
          :to="link.to"
          @click="menuOpen = false"
        >
          <AppIcon :name="link.icon" :size="18" />
          <span>{{ link.label }}</span>
        </NuxtLink>
      </nav>

      <template #footer>
        <NuxtLink class="menu__cta" :to="HEADER_CTA.to" @click="menuOpen = false">
          <AppIcon :name="HEADER_CTA.icon" :size="16" />
          <span>{{ HEADER_CTA.label }}</span>
        </NuxtLink>
      </template>
    </AppDrawer>
  </header>
</template>

<style scoped>
/*
 * The header palette comes straight from the design: the navy ink of the line
 * icons and the magenta accent (#E20054) for the contact item, the call button
 * and the hamburger's frame. Scoping the values here keeps that local decision
 * from leaking into `tokens.css`, where the accent token is the app-wide one.
 */
.header {
  --header-ink: #0a2a51;
  --header-accent: #e20054;
  --header-accent-hover: #c00049;
  /* Hairline under the white bar: tinted navy rather than the app's cool
     `--color-border`, so the divider reads as a shadow, not a rule. */
  --header-border: rgba(10, 42, 81, 0.08);

  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  /* Full-bleed bar, flush with the top of the viewport. The surface belongs to
     the <header> itself — not to an inset card — so it runs edge to edge with no
     gap above it, and is opaque so catalog content scrolls behind it. */
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--header-border);
}

/* The bar's background is full-bleed; its content is not. `.container` keeps the
   row on the same grid as the catalog, and `min-height` centres it without any
   vertical padding (so nothing pushes the bar off the top edge). */
.header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3) var(--space-6);
  min-height: var(--header-height);
}

.header__nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-6);
}

/* Icons use currentColor, so the glyph and its label always share one ink. */
.header__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding-block: var(--space-2);
  font-size: var(--fs-base);
  font-weight: var(--fw-medium);
  color: var(--header-ink);
  transition: color var(--dur-fast) var(--ease-out);
}

.header__link:hover {
  color: var(--header-accent);
}

/* The design singles out «تماس با ما» in magenta, text and icon alike. */
.header__link--accent {
  color: var(--header-accent);
}

.header__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-pill);
  background-color: var(--header-accent);
  color: var(--color-accent-contrast);
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  transition: background-color var(--dur-fast) var(--ease-out);
}

.header__cta:hover {
  background-color: var(--header-accent-hover);
}

/* --- Mobile controls ---------------------------------------------------- */

/* The two icon buttons are the *only* header content on small screens, so they
   are hidden by default and swapped in below the breakpoint. */
.header__compact {
  display: none;
  align-items: center;
  gap: var(--space-3);
}

/* 46×46 rounded squares with a magenta outline, as in the design — comfortably
   above the 44px minimum touch target. */
.header__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  color: var(--header-accent);
  border: 1.5px solid var(--header-accent);
  background-color: var(--color-surface);
  transition:
    background-color var(--dur-fast) var(--ease-out),
    color var(--dur-fast) var(--ease-out);
}

.header__icon-btn:hover {
  background-color: var(--color-accent-soft);
}

/* --- Mobile menu (rendered inside the drawer) --------------------------- */

.menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.menu__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 48px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-md);
  font-weight: var(--fw-medium);
  color: var(--header-ink);
  border-radius: var(--radius-md);
  transition: background-color var(--dur-fast) var(--ease-out);
}

.menu__link:hover {
  background-color: var(--color-surface-subtle);
}

.menu__link--accent {
  color: var(--header-accent);
}

.menu__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  min-height: 46px;
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: var(--color-accent-contrast);
  background-color: var(--header-accent);
  border-radius: var(--radius-pill);
}

/* --- Breakpoint --------------------------------------------------------- */

/* Below the desktop row's comfortable width the header collapses to the design's
   two icon buttons; the links move into the drawer. */
@media (max-width: 859px) {
  .header__nav,
  .header__cta {
    display: none;
  }

  .header__compact {
    display: flex;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
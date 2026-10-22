<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  FOOTER_BADGES,
  FOOTER_COLUMNS,
  FOOTER_SOCIAL_COLUMN,
  SITE_NAME
} from '~/constants/site'
import { useFormatters } from '~/composables/useFormatters'
import { useSocialLinks } from '~/composables/useSocialLinks'

/**
 * Site footer.
 *
 * Mounted once by `layouts/default.vue`, so every routed page carries it without
 * a single page having to opt in.
 *
 * Structure follows the design: a white main band holding three link sections
 * (quick access, site guide, social networks) with the opening-hours note at the
 * opposite end, then a bar with the trust badges at one end and the copyright
 * line above the social badge row at the other. All labels resolve through i18n,
 * and every URL that can differ per environment comes from runtime config.
 * Directional CSS uses logical properties, so the whole footer mirrors with the
 * document's `dir="rtl"` — the note lands on the right and the badges on the
 * left without a single physical `left`/`right`.
 */
const { t } = useI18n()
const { currentYear } = useFormatters()

const year = currentYear()

/** The full badge row (five brands) from `useSocialLinks`. */
const socialLinks = useSocialLinks()

/** The subset the design lists in the «شبکههای اجتماعی» column. */
const socialColumn = socialLinks.filter((social) =>
  FOOTER_SOCIAL_COLUMN.includes(social.icon)
)
</script>

<template>
  <footer class="footer">
    <div class="footer__main">
      <div class="container footer__inner">
        <!--
          DOM order is RTL reading order: the note occupies the inline start
          (the right), the three link sections fill the rest of the row.
        -->
        <p class="footer__note">{{ t('footer.note') }}</p>

        <nav class="footer__columns" :aria-label="t('footer.nav')">
          <div
            v-for="column in FOOTER_COLUMNS"
            :key="column.titleKey"
            class="footer__column"
          >
            <h2 class="footer__heading">{{ t(column.titleKey) }}</h2>
            <ul class="footer__list">
              <li v-for="link in column.links" :key="link.labelKey + link.to">
                <NuxtLink
                  class="footer__link"
                  :class="{ 'footer__link--accent': link.accent }"
                  :to="link.to"
                >
                  <AppIcon v-if="link.icon" :name="link.icon" :size="16" filled />
                  <span>{{ t(link.labelKey) }}</span>
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!--
            Social profiles are external by definition, so this column renders
            plain anchors (new tab, opener severed) instead of router links.
          -->
          <div class="footer__column">
            <h2 class="footer__heading">{{ t('footer.social.title') }}</h2>
            <ul class="footer__list">
              <li v-for="social in socialColumn" :key="social.icon">
                <a
                  class="footer__link"
                  :href="social.href"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon :name="social.icon" :size="18" />
                  <span>{{ social.label }}</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>

    <div class="footer__bar">
      <div class="container footer__bar-inner">
        <div class="footer__legal">
          <p class="footer__copyright">
            <span class="footer__credit">© {{ year }} {{ SITE_NAME }}</span>
            {{ t('footer.copyright') }}
          </p>

          <ul class="footer__social">
            <li v-for="social in socialLinks" :key="social.icon">
              <a
                class="footer__social-link"
                :class="{ 'footer__social-link--accent': social.accent }"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="
                  t('footer.social.onPlatform', {
                    site: SITE_NAME,
                    platform: social.label
                  })
                "
              >
                <SocialIcon :name="social.icon" :size="38" />
              </a>
            </li>
          </ul>
        </div>

        <ul class="footer__badges">
          <li v-for="badge in FOOTER_BADGES" :key="badge.src">
            <a
              class="footer__badge"
              :href="badge.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="t(badge.labelKey)"
            >
              <!-- Decorative: the anchor's label already names the badge. -->
              <img :src="badge.src" alt="" loading="lazy" decoding="async">
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/*
 * The footer palette comes from the design rather than from the global tokens:
 * the design accents the footer with its own magenta (#E20054) and pairs it with
 * a muted pink for the social marks. Scoping the values here keeps that local
 * decision from leaking into `tokens.css`.
 */
.footer {
  --footer-accent: #e20054;
  --footer-icon: #f180a9;
  --footer-heading: #253343;
  --footer-link: #30445b;
  --footer-copy: #445a74;

  margin-top: var(--space-20);
  /* Lifts the footer off the page without a hard divider line. */
  box-shadow: 0 -2px 2px rgba(10, 42, 81, 0.04);
}

/* --- Main band ---------------------------------------------------------- */

.footer__main {
  padding-block: 40px 48px;
  background-color: var(--color-surface);
  /* Rounded top corners only: the footer reads as a panel sliding up over the
     blue-grey canvas, and meets the bottom bar with a square edge. */
  border-radius: 20px 20px 0 0;
}

.footer__inner {
  display: grid;
  /* inline start (the right, holding the note) | the three link sections */
  grid-template-columns: minmax(120px, 220px) minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}

.footer__note {
  font-size: 0.8125rem;
  line-height: 24px;
  color: var(--footer-copy);
}

.footer__columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px 40px;
}

.footer__column {
  min-width: 0;
}

.footer__heading {
  /* Overrides the global display font/weight so the heading matches the spec
     exactly. */
  font-family: inherit;
  font-size: 1.0625rem;
  font-weight: 700;
  line-height: 1.6;
  color: var(--footer-heading);
  margin-bottom: 14px;
}

.footer__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.8;
  color: var(--footer-link);
  transition: color var(--dur-fast) var(--ease-out);
}

.footer__link:hover {
  color: var(--footer-accent);
}

.footer__link--accent {
  color: var(--footer-accent);
}

/* --- Bottom bar --------------------------------------------------------- */

.footer__bar {
  background-color: #f8f9fc;
}

.footer__bar-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-block: 28px;
}

/* Auto inline margins centre the copyright + social block while the badges stay
   pinned to the inline end (the left in RTL). */
.footer__legal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 38rem;
  margin-inline: auto;
  text-align: center;
}

.footer__copyright {
  font-size: 0.8125rem;
  line-height: 24px;
  color: var(--footer-copy);
}

/* The © year + brand sit on their own line above the legal sentence. */
.footer__credit {
  display: block;
  font-weight: 600;
  color: var(--footer-heading);
}

.footer__social {
  display: flex;
  gap: 12px;
  margin: 0;
}

/*
 * The badge is the mark: SocialIcon draws a full disc with the glyph knocked
 * out, so the disc's own colour IS the tile. Colour alone separates the muted
 * pink badges from the one the design accents (#E20054).
 */
.footer__social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  color: var(--footer-icon);
  transition:
    color var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}

.footer__social-link--accent {
  color: var(--footer-accent);
}

.footer__social-link:hover {
  color: var(--footer-accent);
  transform: translateY(-2px);
}

/* --- Trust badges ------------------------------------------------------- */

.footer__badges {
  display: flex;
  gap: 16px;
  margin: 0;
  flex-shrink: 0;
}

.footer__badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  padding: 3px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-xs);
  transition:
    border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out);
}

.footer__badge:hover {
  border-color: var(--footer-icon);
  box-shadow: var(--shadow-sm);
}

/* The tile owns the geometry (and therefore the layout space), so the artwork is
   contained rather than cropped — the e-namad badge is portrait, the samandehi
   badge square. */
.footer__badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* --- Responsive --------------------------------------------------------- */

/* Tablet: the note and the sections stack, and the link sections become an
   auto-fitting grid so they never crowd. */
@media (max-width: 1023px) {
  .footer__inner {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }

  .footer__note {
    max-width: 32rem;
  }

  .footer__columns {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

/* Mobile: a single centred stack with tighter insets. */
@media (max-width: 639px) {
  .footer {
    margin-top: var(--space-12);
  }

  .footer__main {
    padding-block: 28px 32px;
  }

  .footer__columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 16px;
  }

  .footer__bar-inner {
    flex-direction: column-reverse;
    align-items: center;
    text-align: center;
  }

  .footer__badges {
    justify-content: center;
  }

  .footer__badge {
    width: 60px;
    height: 60px;
  }
}
</style>

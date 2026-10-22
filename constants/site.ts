/** Static site-level structure. Kept in one place to avoid magic strings. */

/**
 * The store's brand name.
 *
 * It is a *constant* rather than a message because it is a proper noun: the
 * same word in every locale. It is interpolated into the `site.*` and
 * `footer.social.*` messages, which is why those templates carry a `{site}`
 * placeholder.
 */
export const SITE_NAME = 'Aurora'

/**
 * The literal subset of `AppIcon` names the header may use. Declared here (rather
 * than importing) keeps this file free of Vue imports while still turning a
 * removed icon into a compile-time error at the `:name` binding in
 * `SiteHeader.vue` instead of a silently empty `<svg>`.
 */
export type HeaderIconName = 'grid' | 'book' | 'question' | 'phone'

/**
 * Header quick-links — the four icon + label items from the design.
 *
 * They are the desktop row and, on mobile, the contents of the hamburger menu —
 * so the same links and targets exist at every breakpoint even though the small
 * screen shows only a menu button and a call button. The demo only has two real
 * routes (`/` and `/products/:id`), so, as with the footer's first column,
 * every item points at the catalog instead of a dead `#` anchor. `accent` marks
 * the contact item, which the design colours magenta to set it apart.
 *
 * Labels are i18n keys resolved with `t()` where they render, so the structure
 * stays locale-independent.
 */
export const HEADER_LINKS: ReadonlyArray<{
  labelKey: string
  to: string
  icon: HeaderIconName
  accent?: boolean
}> = [
    { labelKey: 'header.links.products', to: '/', icon: 'grid' },
    { labelKey: 'header.links.consultation', to: '/', icon: 'book' },
    { labelKey: 'header.links.faq', to: '/', icon: 'question' },
    { labelKey: 'header.links.contact', to: '/', icon: 'phone', accent: true }
]

/** The magenta contact button that closes the desktop header row. */
export const HEADER_CTA: { labelKey: string; to: string; icon: HeaderIconName } = {
  labelKey: 'header.links.contact',
  to: '/',
  icon: 'phone'
}

/**
 * The mobile header's call button.
 *
 * The design's mobile header is just two icon buttons — a menu and a call — so
 * this one is a real `tel:` link (`<a href="tel:…">`) rather than a route: on a
 * phone it opens the dialler, which is what "call us" means. The number is a
 * placeholder for the demo (the storefront has no real support line).
 */
export const HEADER_CALL = {
  labelKey: 'header.links.contact',
  href: 'tel:+982191000000'
}

/**
 * The exact literal subset of `AppIcon` names the social marks may use, and the
 * double duty it serves: the same identifiers drive `SocialIcon` (the footer's
 * circular brand badges), the inline marks in the footer's social column and the
 * keys of `SOCIAL_LINK_DEFAULTS`. Keeping them one type means removing a brand
 * is a compile-time error everywhere at once.
 */
export type SocialIconName =
  | 'telegram'
  | 'instagram'
  | 'twitter'
  | 'youtube'
  | 'linkedin'

/**
 * Default social profile URLs. These are the values the app ships with; they are
 * imported into `runtimeConfig.public.social` in `nuxt.config.ts` so each one
 * can be overridden per environment via `NUXT_PUBLIC_SOCIAL_<NAME>` (see
 * `.env.example`) without touching the code.
 */
export const SOCIAL_LINK_DEFAULTS: Readonly<Record<SocialIconName, string>> = {
  telegram: 'https://telegram.org',
  instagram: 'https://instagram.com',
  twitter: 'https://twitter.com',
  youtube: 'https://youtube.com',
  linkedin: 'https://linkedin.com'
}

/** One footer link. `icon` renders a brand mark before the label. */
export interface FooterLink {
  /** i18n key for the visible label. */
  labelKey: string
  /**
   * Internal route (`/`, `/?sort=rating-desc`). The footer renders these as
   * `<NuxtLink>` — the social section is the only place with external hrefs,
   * and it builds them from `useSocialLinks()` instead of this type.
   */
  to: string
  /** Marks the one link the design colours magenta (درباره ما). */
  accent?: boolean
  icon?: SocialIconName
}

/**
 * Footer link sections — the design's two link columns (دسترسی سریع and
 * راهنمای سایت). The third column (شبکههای اجتماعی) is rendered from
 * `useSocialLinks()` because its labels and hrefs are locale/env driven.
 *
 * The demo has no CMS or auth routes, so the informational links all land on the
 * catalog rather than on a dead `#` anchor — a footer link that goes nowhere is
 * worse than one that lands on the listing.
 */
export const FOOTER_COLUMNS: ReadonlyArray<{
  titleKey: string
  links: ReadonlyArray<FooterLink>
}> = [
  {
    titleKey: 'footer.columns.quickAccess.title',
    links: [
      { labelKey: 'footer.columns.quickAccess.about', to: '/', accent: true },
      { labelKey: 'footer.columns.quickAccess.blog', to: '/' },
      { labelKey: 'footer.columns.quickAccess.contact', to: '/' },
      { labelKey: 'footer.columns.quickAccess.afterSales', to: '/' }
    ]
  },
  {
    titleKey: 'footer.columns.siteGuide.title',
    links: [
      { labelKey: 'footer.columns.siteGuide.terms', to: '/' },
      { labelKey: 'footer.columns.siteGuide.consultation', to: '/?sort=rating-desc' },
      { labelKey: 'footer.columns.siteGuide.feedback', to: '/' }
    ]
  }
]

/**
 * The social brands the design lists in the footer's «شبکههای اجتماعی»
 * column (a subset of the full badge row below it).
 */
export const FOOTER_SOCIAL_COLUMN: ReadonlyArray<SocialIconName> = [
  'telegram',
  'instagram',
  'linkedin'
]

/**
 * Social profiles rendered as the round badge row in the footer's bottom bar
 * (the same 5-brand set as the design). Order is the design's reading order.
 * Labels come from the `social.*` i18n keys and hrefs from
 * `useSocialLinks()` (runtime config over `SOCIAL_LINK_DEFAULTS`).
 *
 * `accent` marks the single badge the design highlights (#E20054); the rest use
 * the muted pink (#F180A9).
 */
export const SOCIAL_LINKS: ReadonlyArray<{
  icon: SocialIconName
  accent?: boolean
}> = [
    { icon: 'telegram' },
    { icon: 'instagram' },
    { icon: 'twitter', accent: true },
    { icon: 'youtube' },
    { icon: 'linkedin' }
]

/**
 * The two 72×72 trust badges at the end of the footer's main band. The artwork
 * is local (`public/images/footer/`), so the tiles render offline and are never
 * a third-party request.
 */
export const FOOTER_BADGES: ReadonlyArray<{
  src: string
  labelKey: string
  href: string
}> = [
  {
    src: '/images/footer/e-namad.png',
    labelKey: 'footer.badges.enamad',
    href: 'https://enamad.ir'
  },
  {
    src: '/images/footer/e-namad2.png',
    labelKey: 'footer.badges.samandehi',
    href: 'https://samandehi.ir'
  }
]

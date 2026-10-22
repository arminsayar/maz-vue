/** Static site-level constants. Kept in one place to avoid magic strings. */

export const SITE_NAME = 'Aurora'

export const SITE_TAGLINE = 'کالاهای روزمره، با انتخابی سنجیده.'

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
 * routes (`/` and `/products/:id`), so, as with the footer's account column,
 * every item points at the catalog instead of a dead `#` anchor. `accent` marks
 * the contact item, which the design colours magenta to set it apart.
 */
export const HEADER_LINKS: ReadonlyArray<{
  label: string
  to: string
  icon: HeaderIconName
  accent?: boolean
}> = [
  { label: 'لیست محصولات', to: '/', icon: 'grid' },
  { label: 'دریافت مشاوره', to: '/', icon: 'book' },
  { label: 'سوالات متداول', to: '/', icon: 'question' },
  { label: 'تماس با ما', to: '/', icon: 'phone', accent: true }
]

/** The magenta contact button that closes the desktop header row. */
export const HEADER_CTA: { label: string; to: string; icon: HeaderIconName } = {
  label: 'تماس با ما',
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
  label: 'تماس با ما',
  href: 'tel:+982191000000'
}

/** Accessible name for the mobile hamburger button. */
export const HEADER_MENU_LABEL = 'منو'

/**
 * The exact literal subset of `AppIcon` names the social marks may use.
 * Declared here (rather than importing) keeps this file free of Vue imports
 * while still turning a removed brand into a compile-time error at the `:name`
 * binding in `SiteFooter.vue` instead of a silently empty `<svg>`.
 */
export type SocialIconName =
  | 'telegram'
  | 'instagram'
  | 'twitter'
  | 'youtube'
  | 'linkedin'

/** One footer link. `icon` renders a brand mark before the label. */
export interface FooterLink {
  label: string
  /**
   * Internal route (`/`, `/?category=…`) or an absolute external URL. The footer
   * renders anything starting with `http` as a real `<a target="_blank">` with
   * `rel="noopener noreferrer"`, and everything else as a `<NuxtLink>` — so a
   * social link never quietly becomes a full page reload and an internal link
   * never becomes an unsafe new tab.
   */
  to: string
  /** Marks the one link the design colours magenta (درباره ما). */
  accent?: boolean
  icon?: SocialIconName
}

/**
 * Footer link sections — three, matching the design's link area:
 * دسترسی سریع, راهنمای سایت and شبکههای اجتماعی.
 *
 * The demo has no CMS or auth routes, so the informational links all land on the
 * catalog rather than on a dead `#` anchor — a footer link that goes nowhere is
 * worse than one that lands on the listing. The social section is the exception:
 * those really are external profiles, so they carry their own hrefs.
 */
export const FOOTER_COLUMNS: ReadonlyArray<{
  title: string
  links: ReadonlyArray<FooterLink>
}> = [
  {
    title: 'دسترسی سریع',
    links: [
      { label: 'درباره ما', to: '/', accent: true },
      { label: 'بلاگ', to: '/' },
      { label: 'تماس با ما', to: '/' },
      { label: 'خدمات پس از فروش', to: '/' }
    ]
  },
  {
    title: 'راهنمای سایت',
    links: [
      { label: 'قوانین و مقررات', to: '/' },
      { label: 'دریافت مشاوره', to: '/?sort=rating-desc' },
      { label: 'انتقادات و پیشنهادات', to: '/' }
    ]
  },
  {
    title: 'شبکههای اجتماعی',
    links: [
      { label: 'تلگرام', to: 'https://telegram.org', icon: 'telegram' },
      { label: 'اینستاگرام', to: 'https://instagram.com', icon: 'instagram' },
      { label: 'لینکدین', to: 'https://linkedin.com', icon: 'linkedin' }
    ]
  }
]

/**
 * The opening-hours note the design places at the opposite end of the footer's
 * link area (the inline start, i.e. the right in RTL).
 */
export const FOOTER_NOTE = 'هفت روز هفته از ۸ صبح تا ۱۲ شب پاسخگو هستیم.'

/**
 * Social profiles rendered as the round icon row in the footer's bottom bar
 * (the same 5-brand set as the design). `SOCIAL_LINKS` is also where a brand
 * that needs a *link* rather than a mark — the شبکههای اجتماعی section — could
 * pull from; the footer currently keeps that section's hrefs inline so its
 * labels and icons stay next to each other in `FOOTER_COLUMNS`.
 *
 * `accent` marks the single tile the design highlights (#E20054); the rest use
 * the muted pink (#F180A9).
 */
export const SOCIAL_LINKS: ReadonlyArray<{
  icon: SocialIconName
  label: string
  href: string
  accent?: boolean
}> = [
  { icon: 'telegram', label: 'تلگرام', href: 'https://telegram.org' },
  { icon: 'instagram', label: 'اینستاگرام', href: 'https://instagram.com' },
  { icon: 'twitter', label: 'توییتر', href: 'https://twitter.com', accent: true },
  { icon: 'youtube', label: 'یوتیوب', href: 'https://youtube.com' },
  { icon: 'linkedin', label: 'لینکدین', href: 'https://linkedin.com' }
]

/**
 * The two 72×72 trust badges at the end of the footer's main band. The artwork
 * is local (`public/images/footer/`), so the tiles render offline and are never
 * a third-party request.
 */
export const FOOTER_BADGES: ReadonlyArray<{ src: string; label: string; href: string }> = [
  {
    src: '/images/footer/e-namad.png',
    label: 'نماد اعتماد الکترونیکی',
    href: 'https://enamad.ir'
  },
  {
    src: '/images/footer/e-namad2.png',
    label: 'ساماندهی پایگاههای اینترنتی',
    href: 'https://samandehi.ir'
  }
]

/**
 * Single source of truth for the footer's copyright line — the exact wording
 * supplied with the design, rendered verbatim in the bottom bar.
 */
export const FOOTER_COPYRIGHT =
  'تمامی حقوق مادی و معنوی این وبسایت متعلق به میباشد و هر گونه کپی برداری پیگرد قانونی دارد.'
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SiteFooter from '~/components/layout/SiteFooter.vue'
import {
  FOOTER_BADGES,
  FOOTER_COLUMNS,
  FOOTER_SOCIAL_COLUMN,
  SITE_NAME,
  SOCIAL_LINK_DEFAULTS,
  SOCIAL_LINKS
} from '~/constants/site'
import { formatCurrentYear } from '~/utils/format'
import { t } from '../helpers/i18n'

/**
 * The footer is mounted by the shared layout on every page, so it is the one
 * piece of UI that can regress the whole app at once. These tests pin its
 * structure (three link sections, the note, the social row, the trust badges,
 * the copyright line) and, more importantly, the properties that are invisible
 * in a screenshot: internal links stay client-side, external links are safely
 * targeted, and every icon-only link carries an accessible name.
 *
 * Copy is asserted against the same i18n messages the component renders, so
 * editing the catalogue never invalidates the test.
 */
const ALL_LINKS = FOOTER_COLUMNS.flatMap((column) => column.links)

describe('SiteFooter', () => {
  const wrapper = mount(SiteFooter)

  it('renders every link section with its heading and links', () => {
    const headings = wrapper
      .findAll('.footer__heading')
      .map((heading) => heading.text())

    // The two link columns plus the social column, which is rendered from
    // `useSocialLinks()` rather than from a static column definition.
    expect(headings).toEqual([
      ...FOOTER_COLUMNS.map((column) => t(column.titleKey)),
      t('footer.social.title')
    ])

    const linkTexts = wrapper.findAll('.footer__link').map((link) => link.text())
    expect(linkTexts).toEqual([
      ...ALL_LINKS.map((link) => t(link.labelKey)),
      ...FOOTER_SOCIAL_COLUMN.map((icon) => t(`social.${icon}`))
    ])
  })

  it('labels the footer nav landmark and renders the opening-hours note', () => {
    expect(wrapper.element.tagName).toBe('FOOTER')
    expect(wrapper.get('.footer__columns').attributes('aria-label')).toBe(
      t('footer.nav')
    )
    expect(wrapper.get('.footer__note').text()).toBe(t('footer.note'))
  })

  it('renders internal links as routes and external ones as safe new tabs', () => {
    const hrefs = wrapper
      .findAll('.footer__link')
      .map((link) => link.attributes('href') ?? '')

    expect(hrefs).toEqual([
      ...ALL_LINKS.map((link) => link.to),
      ...FOOTER_SOCIAL_COLUMN.map((icon) => SOCIAL_LINK_DEFAULTS[icon])
    ])
    expect(hrefs).not.toContain('#')

    const external = wrapper.findAll('.footer__link[target="_blank"]')
    expect(external.map((link) => link.attributes('href'))).toEqual(
      FOOTER_SOCIAL_COLUMN.map((icon) => SOCIAL_LINK_DEFAULTS[icon])
    )
    expect(
      external.every((link) => link.attributes('rel') === 'noopener noreferrer')
    ).toBe(true)
  })

  it('accents only the link the design colours magenta', () => {
    const accented = wrapper.findAll('.footer__link--accent')
    const expected = ALL_LINKS.filter((link) => link.accent)

    expect(accented).toHaveLength(expected.length)
    expect(accented.map((link) => link.text())).toEqual(
      expected.map((link) => t(link.labelKey))
    )
  })

  it('renders one labelled, securely-targeted link per social network', () => {
    const links = wrapper.findAll('.footer__social-link')

    expect(links.map((link) => link.attributes('href'))).toEqual(
      SOCIAL_LINKS.map((social) => SOCIAL_LINK_DEFAULTS[social.icon])
    )
    expect(links.map((link) => link.attributes('aria-label'))).toEqual(
      SOCIAL_LINKS.map((social) =>
        t('footer.social.onPlatform', {
          site: SITE_NAME,
          platform: t(`social.${social.icon}`)
        })
      )
    )
    expect(links.every((link) => link.attributes('target') === '_blank')).toBe(true)
    expect(links.every((link) => link.attributes('rel') === 'noopener noreferrer')).toBe(
      true
    )
  })

  it('draws the brand marks as filled icons that inherit their link colour', () => {
    const icons = wrapper.findAll('.footer__social-link svg')

    expect(icons).toHaveLength(SOCIAL_LINKS.length)
    expect(icons.every((icon) => icon.attributes('fill') === 'currentColor')).toBe(
      true
    )
  })

  it('highlights exactly the social tile the design accents', () => {
    const accented = wrapper.findAll('.footer__social-link--accent')
    const expected = SOCIAL_LINKS.filter((social) => social.accent)

    expect(accented).toHaveLength(expected.length)
    expect(accented.map((link) => link.attributes('aria-label'))).toEqual(
      expected.map((social) =>
        t('footer.social.onPlatform', {
          site: SITE_NAME,
          platform: t(`social.${social.icon}`)
        })
      )
    )
  })

  it('renders both trust badges from local artwork, named by the link', () => {
    const badges = wrapper.findAll('.footer__badge')

    expect(badges.map((badge) => badge.attributes('href'))).toEqual(
      FOOTER_BADGES.map((badge) => badge.href)
    )
    expect(badges.map((badge) => badge.attributes('aria-label'))).toEqual(
      FOOTER_BADGES.map((badge) => t(badge.labelKey))
    )
    expect(wrapper.findAll('.footer__badge img').map((img) => img.attributes('src'))).toEqual(
      FOOTER_BADGES.map((badge) => badge.src)
    )
    // Decorative: the anchor already carries the name, so the alt stays empty to
    // avoid announcing the same badge twice.
    expect(wrapper.get('.footer__badge img').attributes('alt')).toBe('')
  })

  it('shows the supplied copyright text under a Persian-digit © line', () => {
    const copyright = wrapper.get('.footer__copyright')

    expect(copyright.text()).toContain(t('footer.copyright'))

    const credit = wrapper.get('.footer__credit').text()
    expect(credit).toContain('©')
    expect(credit).toContain(SITE_NAME)
    expect(credit).toContain(formatCurrentYear())
    // The Persian (Solar Hijri) year, never the Gregorian one.
    expect(credit).not.toContain(String(new Date().getFullYear()))
  })
})
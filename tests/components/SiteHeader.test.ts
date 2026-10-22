import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import SiteHeader from '~/components/layout/SiteHeader.vue'
import { HEADER_CALL, HEADER_CTA, HEADER_LINKS } from '~/constants/site'
import { t } from '../helpers/i18n'

/**
 * The header is mounted by the shared layout on every page, so a regression here
 * shows up everywhere at once. These tests pin the two shapes the design calls
 * for — the desktop quick-link row plus its magenta contact button, and the
 * mobile hamburger + call pair — and the two properties a screenshot cannot
 * show: every link resolves somewhere real, and the mobile menu exposes the very
 * same links as the desktop row.
 *
 * Labels are asserted against the same i18n messages the components render
 * (`header.links.*`), so the test stays correct if copy is edited in the
 * catalogue rather than in this file.
 */
afterEach(() => {
  document.body.innerHTML = ''
  document.body.style.overflow = ''
})

describe('SiteHeader', () => {
  const wrapper = mount(SiteHeader, { attachTo: document.body })

  it('renders the labelled desktop quick-link nav with one item per design link', () => {
    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.get('.header__nav').attributes('aria-label')).toBe(
      t('header.primaryNav')
    )
    expect(wrapper.findAll('.header__link').map((link) => link.text())).toEqual(
      HEADER_LINKS.map((link) => t(link.labelKey))
    )
  })

  it('points every header link at a real route instead of a dead anchor', () => {
    const hrefs = wrapper
      .findAll('.header__link')
      .map((link) => link.attributes('href') ?? '')

    expect(hrefs).toEqual(HEADER_LINKS.map((link) => link.to))
    expect(hrefs).not.toContain('#')
  })

  it('draws an icon inside every nav item and the CTA button', () => {
    expect(wrapper.findAll('.header__link svg')).toHaveLength(HEADER_LINKS.length)
    expect(wrapper.findAll('.header__cta svg')).toHaveLength(1)
  })

  it('accents only the contact link the design highlights', () => {
    const accented = wrapper.findAll('.header__link--accent')
    const expected = HEADER_LINKS.filter((link) => link.accent)

    expect(accented).toHaveLength(expected.length)
    expect(accented.map((link) => link.text())).toEqual(
      expected.map((link) => t(link.labelKey))
    )
  })

  it('renders the desktop contact button from the CTA spec', () => {
    const cta = wrapper.get('.header__cta')

    expect(cta.text()).toBe(t(HEADER_CTA.labelKey))
    expect(cta.attributes('href')).toBe(HEADER_CTA.to)
  })

  it('renders exactly a menu button and a call button for small screens', () => {
    const compact = wrapper.get('.header__compact')
    const controls = compact.findAll('button, a')
    const menuButton = compact.get('button')

    expect(controls).toHaveLength(2)
    // The menu button is first so that, in RTL, it lands at the inline start
    // (the right) and the call button at the inline end — the design's order.
    expect(menuButton.attributes('aria-label')).toBe(t('header.menu'))
    expect(menuButton.attributes('aria-expanded')).toBe('false')

    const call = compact.get('a')
    expect(call.attributes('href')).toBe(HEADER_CALL.href)
    expect(call.attributes('href')).toMatch(/^tel:/)
    expect(call.attributes('aria-label')).toBe(t(HEADER_CALL.labelKey))
  })

  it('opens a drawer holding the same links when the menu button is pressed', async () => {
    const menuButton = wrapper.get('.header__compact button')
    await menuButton.trigger('click')
    await flushPromises()

    expect(menuButton.attributes('aria-expanded')).toBe('true')

    const menuLinks = document.querySelectorAll<HTMLAnchorElement>('.menu__link')
    expect(Array.from(menuLinks).map((link) => link.textContent)).toEqual(
      HEADER_LINKS.map((link) => t(link.labelKey))
    )
    expect(Array.from(menuLinks).map((link) => link.getAttribute('href'))).toEqual(
      HEADER_LINKS.map((link) => link.to)
    )
  })
})

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AppBreadcrumb from '~/components/ui/AppBreadcrumb.vue'

/**
 * The breadcrumb is real navigation markup, so these tests pin what a screen
 * reader gets: an ordered trail, real links for everything but the current page,
 * and a `aria-current` marker on the page the user is already on.
 */
const items = [
  { label: 'خانه', to: '/', icon: 'home' as const, hideLabel: true },
  { label: 'لیست محصولات', to: '/' },
  { label: 'درب اتوماتیک بازویی' }
]

describe('AppBreadcrumb', () => {
  it('renders a labelled nav with an ordered trail', () => {
    const wrapper = mount(AppBreadcrumb, { props: { items } })

    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('مسیر صفحه')
    expect(wrapper.findAll('.crumbs__item')).toHaveLength(items.length)
    expect(wrapper.findAll('.crumbs__link')).toHaveLength(2)
  })

  it('keeps the home crumb icon-only for sighted users', () => {
    const wrapper = mount(AppBreadcrumb, { props: { items } })

    expect(wrapper.get('.crumbs__link svg')).toBeTruthy()
    expect(wrapper.get('.crumbs__link .visually-hidden').text()).toBe('خانه')
  })

  it('marks the last crumb as the current page, not a link', () => {
    const wrapper = mount(AppBreadcrumb, { props: { items } })
    const current = wrapper.get('.crumbs__current')

    expect(current.attributes('aria-current')).toBe('page')
    expect(current.text()).toBe('درب اتوماتیک بازویی')
    // The current page has no href, so it cannot be navigated to again.
    expect(wrapper.findAll('.crumbs__link')).toHaveLength(items.length - 1)
  })

  it('draws one separator between each pair of crumbs', () => {
    const wrapper = mount(AppBreadcrumb, { props: { items } })

    expect(wrapper.findAll('.crumbs__sep')).toHaveLength(items.length - 1)
  })
})
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ActiveFilters from '~/components/catalog/ActiveFilters.vue'

/**
 * The active-filter card is the visible answer to "which constraints are applied
 * right now?", so each chip must map to exactly one clear action — and there
 * must be one chip per selected category, since categories are multi-select.
 */
describe('ActiveFilters', () => {
  it('renders nothing when no filter is active', () => {
    const wrapper = mount(ActiveFilters, {
      props: { search: '   ', categories: [] }
    })

    expect(wrapper.find('.active').exists()).toBe(false)
  })

  it('shows the trimmed search term as a removable chip', () => {
    const wrapper = mount(ActiveFilters, {
      props: { search: '  jacket ', categories: [] }
    })

    expect(wrapper.get('.active__chip').text()).toContain('جستجو: «jacket»')
    expect(wrapper.get('.active__clear').text()).toBe('پاک کردن همه')
  })

  it('translates the category chip and renders one per selection', () => {
    const wrapper = mount(ActiveFilters, {
      props: { search: '', categories: ["men's clothing", 'jewelery'] }
    })

    const chips = wrapper.findAll('.active__chip')
    expect(chips).toHaveLength(2)
    expect(chips[0].text()).toContain('پوشاک مردانه')
    expect(chips[1].text()).toContain('زیورآلات')
  })

  it('emits the matching clear event for each control', async () => {
    const wrapper = mount(ActiveFilters, {
      props: { search: 'jacket', categories: ['electronics'] }
    })
    const chips = wrapper.findAll('.active__chip')

    await chips[0].trigger('click')
    await chips[1].trigger('click')
    await wrapper.get('.active__clear').trigger('click')

    expect(wrapper.emitted('clear-search')).toHaveLength(1)
    expect(wrapper.emitted('clear-category')).toEqual([['electronics']])
    expect(wrapper.emitted('clear-all')).toHaveLength(1)
  })

  it('omits the category chips when only a search term is set', () => {
    const wrapper = mount(ActiveFilters, {
      props: { search: 'jacket', categories: [] }
    })

    expect(wrapper.findAll('.active__chip')).toHaveLength(1)
  })
})
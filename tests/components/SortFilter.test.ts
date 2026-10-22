import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SortFilter from '~/components/catalog/SortFilter.vue'
import { SORT_OPTIONS } from '~/constants/catalog'

/**
 * The sort control is a radio group (the design shows the options inline rather
 * than behind a dropdown), so it must render one radio per sort key, reflect the
 * current value, and reject anything the switch does not emit.
 */
describe('SortFilter', () => {
  it('renders the options as a labelled radio group', () => {
    const wrapper = mount(SortFilter, { props: { modelValue: 'relevance' } })

    expect(wrapper.get('.sort').attributes('role')).toBe('radiogroup')
    expect(wrapper.get('.sort').attributes('aria-label')).toBe('مرتبسازی')
    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(SORT_OPTIONS.length)
    expect(wrapper.findAll('.sort__label').map((label) => label.text())).toEqual(
      SORT_OPTIONS.map((option) => option.label)
    )
  })

  it('checks the radio matching the current value', () => {
    const wrapper = mount(SortFilter, { props: { modelValue: 'price-desc' } })

    const checked = wrapper
      .findAll('input')
      .filter((input) => (input.element as HTMLInputElement).checked)

    expect(checked).toHaveLength(1)
    expect((checked[0].element as HTMLInputElement).value).toBe('price-desc')
  })

  it('emits the chosen sort key', async () => {
    const wrapper = mount(SortFilter, { props: { modelValue: 'relevance' } })

    await wrapper.findAll('input')[1].trigger('change')

    expect(wrapper.emitted('update:modelValue')).toEqual([['price-asc']])
  })
})
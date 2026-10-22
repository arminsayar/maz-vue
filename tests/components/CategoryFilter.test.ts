import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CategoryFilter from '~/components/catalog/CategoryFilter.vue'
import { formatCategoryLabel } from '~/utils/format'
import { t } from '../helpers/i18n'

/**
 * The category filter is the multi-select control: several categories can be
 * active at once, and each change emits the *whole* new selection so the parent
 * stays the single source of truth. Labels are asserted against the same
 * formatter and i18n messages the component renders through.
 */
describe('CategoryFilter', () => {
  const categories = ['electronics', 'jewelery']

  it('renders one checkbox per category with a localised label', () => {
    const wrapper = mount(CategoryFilter, {
      props: { categories, modelValue: [] }
    })

    const labels = wrapper.findAll('.cats__label').map((label) => label.text())
    expect(labels).toEqual(categories.map((category) => formatCategoryLabel(category)))
    expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(categories.length)
    expect(wrapper.get('.cats').attributes('aria-label')).toBe(
      t('catalog.categories.filterAria')
    )
  })

  it('checks exactly the selected categories', () => {
    const wrapper = mount(CategoryFilter, {
      props: { categories, modelValue: ['jewelery'] }
    })

    const inputs = wrapper.findAll('input')
    expect((inputs[0].element as HTMLInputElement).checked).toBe(false)
    expect((inputs[1].element as HTMLInputElement).checked).toBe(true)
    expect(wrapper.findAll('.cats__option--active')).toHaveLength(1)
  })

  it('adds a category to the selection instead of replacing it', async () => {
    const wrapper = mount(CategoryFilter, {
      props: { categories, modelValue: ['jewelery'] }
    })

    await wrapper.findAll('input')[0].trigger('change')

    const emitted = wrapper.emitted('update:modelValue')?.[0]?.[0] as string[]
    expect([...emitted].sort()).toEqual(['electronics', 'jewelery'])
  })

  it('removes a category that is already selected', async () => {
    const wrapper = mount(CategoryFilter, {
      props: { categories, modelValue: ['jewelery'] }
    })

    await wrapper.findAll('input')[1].trigger('change')

    // `emitted()` returns one entry per emit call, each holding that call's
    // argument list — so a single call carrying an empty selection is `[[[]]]`.
    expect(wrapper.emitted('update:modelValue')).toEqual([[[]]])
  })
})
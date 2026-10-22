import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductGrid from '~/components/product/ProductGrid.vue'
import { makeProducts } from '../helpers/factory'

/**
 * The grid owns two behaviours worth pinning down: the loading placeholder and
 * how many images are loaded eagerly (an LCP decision).
 */
describe('ProductGrid', () => {
  it('renders one card per product', () => {
    const wrapper = mount(ProductGrid, {
      props: { products: makeProducts(3) }
    })

    expect(wrapper.findAll('.card')).toHaveLength(3)
    expect(wrapper.get('ul').attributes('aria-hidden')).toBeUndefined()
  })

  it('renders skeletons and hides them from assistive tech while loading', () => {
    const wrapper = mount(ProductGrid, {
      props: { products: [], loading: true, skeletonCount: 4 }
    })

    expect(wrapper.findAll('.card-skeleton')).toHaveLength(4)
    expect(wrapper.findAll('.card')).toHaveLength(0)
    expect(wrapper.get('ul').attributes('aria-hidden')).toBe('true')
  })

  it('defaults to eight skeletons and four eager images', () => {
    const loading = mount(ProductGrid, {
      props: { products: [], loading: true }
    })
    const loaded = mount(ProductGrid, { props: { products: makeProducts(6) } })

    expect(loading.findAll('.card-skeleton')).toHaveLength(8)
    expect(
      loaded.findAll('img').filter((img) => img.attributes('loading') === 'eager')
    ).toHaveLength(4)
  })

  it('eager-loads only the first `eagerCount` images', () => {
    const wrapper = mount(ProductGrid, {
      props: { products: makeProducts(4), eagerCount: 2 }
    })

    expect(wrapper.findAll('img').map((img) => img.attributes('loading'))).toEqual(
      ['eager', 'eager', 'lazy', 'lazy']
    )
  })

  it('renders an empty grid when there are no products', () => {
    const wrapper = mount(ProductGrid, { props: { products: [] } })

    expect(wrapper.findAll('.card')).toHaveLength(0)
    expect(wrapper.find('ul').exists()).toBe(true)
  })
})
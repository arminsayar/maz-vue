import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '~/components/product/ProductCard.vue'
import { makeProduct } from '../helpers/factory'

/**
 * The card is the primary navigation surface of the listing, so these tests
 * cover the link target, the content the design keeps on the card (image, title,
 * one action) and the content it deliberately leaves to the detail page.
 */
describe('ProductCard', () => {
  const product = makeProduct({
    id: 7,
    title: 'Mens Cotton Jacket',
    price: 55.99,
    category: "men's clothing",
    rating: { rate: 4.7, count: 500 }
  })

  it('links to the product detail route', () => {
    const wrapper = mount(ProductCard, { props: { product } })

    expect(wrapper.get('.card__link').attributes('href')).toBe('/products/7')
  })

  it('shows the title, the image and the single view-details action', () => {
    const wrapper = mount(ProductCard, { props: { product } })

    expect(wrapper.get('.card__title').text()).toBe('Mens Cotton Jacket')
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.get('.card__cta').text()).toBe('مشاهده جزئیات')
  })

  it('leaves price, rating and category to the detail page', () => {
    const wrapper = mount(ProductCard, { props: { product } })

    expect(wrapper.find('.card__price').exists()).toBe(false)
    expect(wrapper.find('.card__category').exists()).toBe(false)
    expect(wrapper.find('.rating').exists()).toBe(false)
  })

  it('marks the action decorative inside the card link', () => {
    const wrapper = mount(ProductCard, { props: { product } })

    // The card's own link already names the destination, so the inner action is
    // hidden from assistive tech (an anchor inside an anchor is invalid HTML).
    expect(wrapper.get('.card__cta').attributes('aria-hidden')).toBe('true')
    expect(wrapper.get('.card__cta svg')).toBeTruthy()
  })

  it('marks the image decorative so the title is not announced twice', () => {
    const wrapper = mount(ProductCard, { props: { product } })

    expect(wrapper.get('img').attributes('alt')).toBe('')
  })

  it('lazy-loads by default and prioritises the first row', () => {
    const lazy = mount(ProductCard, { props: { product } })
    const eager = mount(ProductCard, { props: { product, eager: true } })

    expect(lazy.get('img').attributes('loading')).toBe('lazy')
    expect(lazy.get('img').attributes('fetchpriority')).toBe('auto')
    expect(eager.get('img').attributes('loading')).toBe('eager')
    expect(eager.get('img').attributes('fetchpriority')).toBe('high')
  })

  it('re-targets the link when the product changes', async () => {
    const wrapper = mount(ProductCard, { props: { product } })

    await wrapper.setProps({ product: makeProduct({ id: 9 }) })

    expect(wrapper.get('.card__link').attributes('href')).toBe('/products/9')
  })
})
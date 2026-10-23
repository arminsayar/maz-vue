import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductDetails from '~/components/product/ProductDetails.vue'
import { makeProduct } from '../helpers/factory'

/**
 * ProductDetails is a pure function of its prop, so these tests assert the
 * rendered contract (what a user sees and what assistive tech announces) rather
 * than internal state: the design's two cards, the spec sheet, and the zoom
 * affordance on the hero image.
 */
describe('ProductDetails', () => {
  const product = makeProduct({
    id: 5,
    title: 'Solid Gold Petite Micropave',
    price: 168,
    description: 'Satisfaction Guaranteed. Returns accepted within 30 days.',
    category: "men's clothing",
    rating: { rate: 3.9, count: 70 }
  })

  it('renders the title in the hero card above the image', () => {
    const wrapper = mount(ProductDetails, { props: { product } })
    const hero = wrapper.findAll('section')[0]

    expect(wrapper.get('h1').text()).toBe('Solid Gold Petite Micropave')
    expect(hero.get('h1').text()).toBe('Solid Gold Petite Micropave')
    expect(hero.find('.pdp__media').exists()).toBe(true)
  })

  it('gives the hero image meaningful alt text', () => {
    const wrapper = mount(ProductDetails, { props: { product } })

    expect(wrapper.get('img').attributes('alt')).toBe(product.title)
  })

  it('renders the spec sheet rows from the product', () => {
    const wrapper = mount(ProductDetails, { props: { product } })

    expect(wrapper.get('.pdp__heading').text()).toBe('مشخصات فنی')
    // U+200E is the bidi mark `Intl` puts before the currency symbol.
    expect(wrapper.get('.spec__value--price').text()).toBe('\u200e$۱۶۸٫۰۰')
  })

  it('lists the description sentences as the design\'s bullet points', () => {
    const wrapper = mount(ProductDetails, { props: { product } })

    expect(wrapper.findAll('.spec__points li').map((li) => li.text())).toEqual([
      'Satisfaction Guaranteed.',
      'Returns accepted within 30 days.'
    ])
  })

  it('renders the rating and its review count in the spec sheet', () => {
    const wrapper = mount(ProductDetails, { props: { product } })

    expect(wrapper.get('.rating__value').text()).toBe('۳٫۹')
    expect(wrapper.get('.rating__count').text()).toBe('۷۰ نظر')
    expect(wrapper.get('.rating__stars').attributes('aria-label')).toBe(
      'امتیاز ۳٫۹ از ۵ بر پایه ۷۰ نظر'
    )
  })

  it('shows the review count as a bare Persian number', () => {
    const wrapper = mount(ProductDetails, { props: { product } })
    const rows = wrapper.findAll('.spec__row')

    expect(rows[rows.length - 1].get('.spec__term').text()).toBe('تعداد')
    expect(rows[rows.length - 1].get('.spec__value').text()).toBe('۷۰')
  })

  it('links the category back to the pre-filtered catalog', () => {
    const wrapper = mount(ProductDetails, { props: { product } })
    const link = wrapper.get('.spec__link')

    expect(link.text()).toBe('پوشاک مردانه')
    // The setup stub mirrors the resolved `to` onto `data-to`. The query keeps
    // the raw API category so the catalog filter still matches.
    expect(JSON.parse(link.attributes('data-to') ?? '{}')).toEqual({
      path: '/',
      query: { category: "men's clothing" }
    })
  })

  it('associates the spec sheet with its heading', () => {
    const wrapper = mount(ProductDetails, { props: { product } })
    const sheet = wrapper.findAll('section')[1]

    expect(sheet.attributes('aria-labelledby')).toBe('product-spec-heading')
    expect(wrapper.get('#product-spec-heading').text()).toBe('مشخصات فنی')
  })

  it('opens a dismissible zoom overlay from the hero image button', async () => {
    const wrapper = mount(ProductDetails, { props: { product } })

    expect(wrapper.find('.zoom').exists()).toBe(false)

    await wrapper.get('.pdp__zoom').trigger('click')

    const overlay = wrapper.get('.zoom')
    expect(overlay.attributes('role')).toBe('dialog')
    expect(overlay.get('img').attributes('src')).toBe(product.image)

    // Escape closes it again.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.zoom').exists()).toBe(false)
  })

  it('drops the overlay when the product changes', async () => {
    const wrapper = mount(ProductDetails, { props: { product } })

    await wrapper.get('.pdp__zoom').trigger('click')
    expect(wrapper.find('.zoom').exists()).toBe(true)

    await wrapper.setProps({ product: makeProduct({ id: 6 }) })

    expect(wrapper.find('.zoom').exists()).toBe(false)
  })
})
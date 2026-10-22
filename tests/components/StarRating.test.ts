import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StarRating from '~/components/ui/StarRating.vue'

/**
 * The stars are decorative, so the interesting contract is the accessible label
 * (the exact value) and the number of filled stars.
 */
describe('StarRating', () => {
  it('always renders five stars', () => {
    const wrapper = mount(StarRating, { props: { rate: 3.6 } })

    expect(wrapper.findAll('.rating__star')).toHaveLength(5)
  })

  it('fills stars by the rounded rate', () => {
    const wrapper = mount(StarRating, { props: { rate: 3.6 } })

    expect(wrapper.findAll('.rating__star--full')).toHaveLength(4)
  })

  it('exposes the exact rating and review count to assistive tech', () => {
    const wrapper = mount(StarRating, { props: { rate: 4.5, count: 12 } })

    expect(wrapper.get('.rating__stars').attributes('aria-label')).toBe(
      'امتیاز ۴٫۵ از ۵ بر پایهٔ ۱۲ نظر'
    )
    expect(wrapper.get('.rating__value').text()).toBe('۴٫۵')
    expect(wrapper.get('.rating__count').text()).toBe('۱۲ نظر')
  })

  it('labels a single review count', () => {
    const wrapper = mount(StarRating, { props: { rate: 4, count: 1 } })

    expect(wrapper.get('.rating__count').text()).toBe('۱ نظر')
  })

  it('clamps out-of-range rates instead of overflowing the scale', () => {
    const high = mount(StarRating, { props: { rate: 9 } })
    const low = mount(StarRating, { props: { rate: -3 } })

    expect(high.findAll('.rating__star--full')).toHaveLength(5)
    expect(low.findAll('.rating__star--full')).toHaveLength(0)
    expect(low.get('.rating__stars').attributes('aria-label')).toBe(
      'بدون امتیاز'
    )
  })

  it('hides the numeric meta when asked', () => {
    const wrapper = mount(StarRating, {
      props: { rate: 4, count: 10, showMeta: false }
    })

    expect(wrapper.find('.rating__meta').exists()).toBe(false)
  })

  it('scales the icons with the size prop', () => {
    const small = mount(StarRating, { props: { rate: 4, size: 'sm' } })
    const medium = mount(StarRating, { props: { rate: 4, size: 'md' } })

    expect(small.get('svg').attributes('width')).toBe('14')
    expect(medium.get('svg').attributes('width')).toBe('17')
    expect(medium.get('.rating').classes()).toContain('rating--md')
  })
})
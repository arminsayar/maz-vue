import { describe, expect, it } from 'vitest'
import {
  formatCategoryLabel,
  formatCurrentYear,
  formatInteger,
  formatPrice,
  formatRating,
  formatReviewCount,
  truncate
} from '~/utils/format'

/**
 * `Intl` prefixes a Persian price with U+200E (LEFT-TO-RIGHT MARK) so the "$"
 * survives the RTL paragraph direction. It is part of the output contract.
 */
const LRM = '\u200e'

describe('formatPrice', () => {
  it('formats finite numbers as Persian-formatted USD', () => {
    expect(formatPrice(10)).toBe(`${LRM}$۱۰٫۰۰`)
    expect(formatPrice(109.95)).toBe(`${LRM}$۱۰۹٫۹۵`)
  })

  it('degrades gracefully for bad input', () => {
    expect(formatPrice(Number.NaN)).toBe('—')
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe('—')
  })
})

describe('formatRating', () => {
  it('rounds to one decimal place using Persian digits', () => {
    expect(formatRating(4.567)).toBe('۴٫۶')
    expect(formatRating(3)).toBe('۳٫۰')
  })

  it('degrades gracefully for bad input', () => {
    expect(formatRating(Number.NaN)).toBe('—')
  })
})

describe('formatInteger', () => {
  it('renders a whole number in Persian digits with thousands separators', () => {
    expect(formatInteger(5)).toBe('۵')
    expect(formatInteger(1200)).toBe('۱٬۲۰۰')
  })

  it('degrades gracefully for bad input', () => {
    expect(formatInteger(Number.NaN)).toBe('—')
  })
})

describe('formatCategoryLabel', () => {
  it('translates known API category slugs into Persian labels', () => {
    expect(formatCategoryLabel("men's clothing")).toBe('پوشاک مردانه')
    expect(formatCategoryLabel("women's clothing")).toBe('پوشاک زنانه')
    expect(formatCategoryLabel('jewelery')).toBe('زیورآلات')
    expect(formatCategoryLabel('electronics')).toBe('الکترونیک')
  })

  it('falls back to the raw slug for an unknown category', () => {
    expect(formatCategoryLabel('garden tools')).toBe('garden tools')
  })

  it('returns an empty string for an empty category', () => {
    expect(formatCategoryLabel('')).toBe('')
  })
})

describe('formatReviewCount', () => {
  it('uses the same noun shape for every positive count', () => {
    expect(formatReviewCount(1)).toBe('۱ نظر')
    expect(formatReviewCount(2)).toBe('۲ نظر')
  })

  it('handles Persian thousands separators', () => {
    expect(formatReviewCount(1200)).toBe('۱٬۲۰۰ نظر')
  })

  it('avoids a misleading zero-reviews label', () => {
    expect(formatReviewCount(0)).toBe('بدون نظر')
    expect(formatReviewCount(-3)).toBe('بدون نظر')
  })
})

describe('truncate', () => {
  it('leaves short strings untouched', () => {
    expect(truncate('short', 10)).toBe('short')
  })

  it('truncates with an ellipsis', () => {
    expect(truncate('a very long product title', 10)).toBe('a very...')
  })

  it('trims surrounding whitespace', () => {
    expect(truncate('  padded  ', 20)).toBe('padded')
  })
})

describe('formatCurrentYear', () => {
  it('converts to the Persian (Solar Hijri) calendar in Persian digits', () => {
    // 1 June 2025 falls inside the Jalali year 1404 (21 Mar 2025 – 20 Mar 2026).
    expect(formatCurrentYear(new Date('2025-06-01T12:00:00Z'))).toBe('۱۴۰۴')
  })

  it('always renders exactly four Persian digits', () => {
    expect(formatCurrentYear(new Date('2024-01-01T12:00:00Z'))).toMatch(/^[۰-۹]{4}$/)
    expect(formatCurrentYear(new Date('2026-12-31T12:00:00Z'))).toMatch(/^[۰-۹]{4}$/)
  })
})
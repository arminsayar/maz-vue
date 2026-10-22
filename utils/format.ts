/** Presentation helpers. Pure functions — trivially unit-testable. */

/**
 * Prices come from the Fake Store API in USD, so the currency is not converted
 * — it is only *presented* in Persian. `fa-IR` gives the Persian (extended
 * Arabic-Indic) digits, the Persian decimal separator (٫) and the correct RTL
 * symbol placement for free.
 *
 * NOTE: `Intl` prefixes the output with U+200E (LEFT-TO-RIGHT MARK). That mark
 * is deliberate and must not be stripped: inside an RTL paragraph the bare "$"
 * is a neutral character, so without it the bidi algorithm would re-order the
 * price to "۱۰٫۹۵$". Keeping the mark is what guarantees "$۱۰٫۹۵".
 */
const priceFormatter = new Intl.NumberFormat('fa-IR', {
  style: 'currency',
  currency: 'USD'
})

const integerFormatter = new Intl.NumberFormat('fa-IR')

const oneDecimalFormatter = new Intl.NumberFormat('fa-IR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
})

/** Placeholder for any value that cannot be meaningfully rendered. */
const UNKNOWN = '—'

/**
 * The Fake Store API exposes a fixed, tiny set of categories. Showing
 * "men's clothing" inside an otherwise Persian UI reads like a bug, so the
 * known slugs are mapped to Persian labels. The raw API value is still what
 * travels in the URL — only the label is translated. Unknown categories fall
 * back to the raw string rather than being hidden.
 */
const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  electronics: 'الکترونیک',
  jewelery: 'زیورآلات',
  "men's clothing": 'پوشاک مردانه',
  "women's clothing": 'پوشاک زنانه',
  // Sentinel used by the API layer when a payload has no usable category.
  uncategorised: 'دسته‌بندی‌نشده'
}

/** Format a numeric price in Persian. Non-finite input degrades gracefully. */
export function formatPrice(value: number): string {
  if (!Number.isFinite(value)) return UNKNOWN
  return priceFormatter.format(value)
}

/** Round a rating to one decimal, guarding against missing/invalid values. */
export function formatRating(value: number): string {
  if (!Number.isFinite(value)) return UNKNOWN
  return oneDecimalFormatter.format(value)
}

/**
 * Format a whole number in Persian, with no noun attached.
 *
 * Used where the surrounding label already names the quantity (the product
 * sheet's «تعداد» row), so `formatInteger(5)` reads as `۵` next to that label
 * rather than as a repeated `۵ نظر`.
 */
export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return UNKNOWN
  return integerFormatter.format(value)
}

/** Persian label for an API category slug, e.g. "jewelery" -> "زیورآلات". */
export function formatCategoryLabel(category: string): string {
  const key = category.trim()
  if (!key) return ''
  return CATEGORY_LABELS[key.toLowerCase()] ?? key
}

/**
 * Persian (Solar Hijri) calendar year, e.g. `۱۴۰۴`.
 *
 * The storefront is Persian-only, so a Gregorian year would be the one
 * un-localised value on the page. `Intl` handles both the calendar conversion
 * and the Persian digits. The date is a parameter (rather than an implicit
 * `new Date()`) so the function stays pure and testable.
 *
 * `formatToParts` is used instead of `format` so the result is guaranteed to be
 * the digits alone: a full date pattern can add era or other segments depending
 * on the ICU build, which would leak non-numeric text into the output.
 */
const yearFormatter = new Intl.DateTimeFormat('fa-IR', { year: 'numeric' })

export function formatCurrentYear(date: Date = new Date()): string {
  const year = yearFormatter.formatToParts(date).find((part) => part.type === 'year')
  return year?.value ?? ''
}

/**
 * Count label for reviews. Persian does not inflect nouns after a numeral, so
 * a single `X نظر` shape is correct for every count; only the "none" case needs
 * its own wording.
 */
export function formatReviewCount(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return 'بدون نظر'
  return `${integerFormatter.format(count)} نظر`
}

/**
 * Clamp a string for display, appending an ellipsis when truncated. Uses a
 * character budget (not CSS) so tests can assert exact behaviour: `max` counts
 * the ellipsis, and whitespace left dangling by a cut is trimmed away so we
 * never render "a very ...".
 */
export function truncate(text: string, max: number): string {
  if (!Number.isFinite(max) || max <= 0) return ''
  const clean = text.trim()
  if (clean.length <= max) return clean
  if (max <= 3) return clean.slice(0, max)
  return clean.slice(0, max - 3).trimEnd() + '...'
}
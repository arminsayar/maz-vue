/**
 * Presentation helpers. Pure functions — trivially unit-testable.
 *
 * Every formatter takes an optional locale (`'fa'` by default, matching the
 * storefront's default) so the same helpers serve any locale the i18n setup
 * activates, without any of them needing the Vue/i18n runtime.
 */

/**
 * Locales the storefront can format for. Kept deliberately narrow: adding a
 * locale means adding its category labels below, and TypeScript then enforces
 * that at compile time rather than at run time.
 */
export type FormatLocale = 'fa' | 'en'

const LOCALE_TAGS: Readonly<Record<FormatLocale, string>> = {
  fa: 'fa-IR',
  en: 'en-US'
}

/** Placeholder for any value that cannot be meaningfully rendered. */
const UNKNOWN = '—'

function numberFormat(
  locale: FormatLocale,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], options)
}

/**
 * Prices come from the Fake Store API in USD, so the currency is not converted
 * — it is only *presented*. `fa-IR` gives the Persian (extended Arabic-Indic)
 * digits, the Persian decimal separator (٫) and the correct RTL symbol
 * placement for free.
 *
 * NOTE: `Intl` prefixes the output with U+200E (LEFT-TO-RIGHT MARK). That mark
 * is deliberate and must not be stripped: inside an RTL paragraph the bare "$"
 * is a neutral character, so without it the bidi algorithm would re-order the
 * price to "۱۰٫۹۵$". Keeping the mark is what guarantees "$۱۰٫۹۵".
 */
export function formatPrice(value: number, locale: FormatLocale = 'fa'): string {
  if (!Number.isFinite(value)) return UNKNOWN
  return numberFormat(locale, { style: 'currency', currency: 'USD' }).format(value)
}

/** Round a rating to one decimal, guarding against missing/invalid values. */
export function formatRating(value: number, locale: FormatLocale = 'fa'): string {
  if (!Number.isFinite(value)) return UNKNOWN
  return numberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value)
}

/**
 * Format a whole number, with no noun attached.
 *
 * Used where the surrounding label already names the quantity (the product
 * sheet's «تعداد» row), so `formatInteger(5)` reads as `۵` next to that label
 * rather than as a repeated `۵ نظر`.
 */
export function formatInteger(value: number, locale: FormatLocale = 'fa'): string {
  if (!Number.isFinite(value)) return UNKNOWN
  return numberFormat(locale).format(value)
}

/**
 * The Fake Store API exposes a fixed, tiny set of categories. Showing
 * "men's clothing" inside an otherwise Persian UI reads like a bug, so the
 * known slugs are mapped to per-locale labels. The raw API value is still what
 * travels in the URL — only the label is translated. Unknown categories fall
 * back to the raw string rather than being hidden.
 */
const CATEGORY_LABELS: Readonly<Record<FormatLocale, Readonly<Record<string, string>>>> = {
  fa: {
    electronics: 'الکترونیک',
    jewelery: 'زیورآلات',
    "men's clothing": 'پوشاک مردانه',
    "women's clothing": 'پوشاک زنانه',
    // Sentinel used by the API layer when a payload has no usable category.
    uncategorised: 'دسته‌بندی‌نشده'
  },
  en: {
    electronics: 'Electronics',
    jewelery: 'Jewellery',
    "men's clothing": "Men's clothing",
    "women's clothing": "Women's clothing",
    uncategorised: 'Uncategorised'
  }
}

/** Localised label for an API category slug, e.g. "jewelery" -> "زیورآلات". */
export function formatCategoryLabel(
  category: string,
  locale: FormatLocale = 'fa'
): string {
  const key = category.trim()
  if (!key) return ''
  return CATEGORY_LABELS[locale][key.toLowerCase()] ?? key
}

/**
 * Localised calendar year — Persian (Solar Hijri, e.g. `۱۴۰۴`) for `fa`,
 * Gregorian for `en`.
 *
 * The storefront is Persian-first, so a Gregorian year would be the one
 * un-localised value on the page. `Intl` handles both the calendar conversion
 * and the digits. The date is a parameter (rather than an implicit
 * `new Date()`) so the function stays pure and testable.
 *
 * `formatToParts` is used instead of `format` so the result is guaranteed to be
 * the digits alone: a full date pattern can add era or other segments depending
 * on the ICU build, which would leak non-numeric text into the output.
 */
export function formatCurrentYear(
  date: Date = new Date(),
  locale: FormatLocale = 'fa'
): string {
  const formatter = new Intl.DateTimeFormat(LOCALE_TAGS[locale], { year: 'numeric' })
  const year = formatter.formatToParts(date).find((part) => part.type === 'year')
  return year?.value ?? ''
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

/** Review-count label. Persian does not inflect the noun after a numeral, so a
 * single `X نظر` shape is correct for every positive count; only the absence case
 * needs its own wording.
 */
export function formatReviewCount(count: number, locale: FormatLocale = 'fa'): string {
  if (!Number.isFinite(count) || count <= 0) return locale === 'en' ? 'No reviews' : 'بدون نظر'
  return `${numberFormat(locale).format(count)} ${locale === 'en' ? 'reviews' : 'نظر'}`
}

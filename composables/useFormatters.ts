import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  formatCategoryLabel,
  formatCurrentYear,
  formatInteger,
  formatPrice,
  formatRating,
  formatReviewCount,
  type FormatLocale
} from '~/utils/format'

/**
 * Locale-aware formatting for templates.
 *
 * The pure helpers in `utils/format.ts` take an explicit locale so they stay
 * testable without the i18n runtime; this composable binds them to the *active*
 * locale so components get one-call formatters that re-resolve when the locale
 * changes.
 */
export function useFormatters() {
  const { locale } = useI18n()

  const active = computed<FormatLocale>(() =>
    locale.value === 'en' ? 'en' : 'fa'
  )

  return {
    price: (value: number) => formatPrice(value, active.value),
    rating: (value: number) => formatRating(value, active.value),
    integer: (value: number) => formatInteger(value, active.value),
    categoryLabel: (slug: string) => formatCategoryLabel(slug, active.value),
    currentYear: (date: Date = new Date()) => formatCurrentYear(date, active.value),
    reviewCount: (count: number) => formatReviewCount(count, active.value)
  }
}

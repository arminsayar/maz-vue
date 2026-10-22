import type { SortKey } from '~/types/catalog'

/** Sort options rendered in the toolbar / drawer. Order is user-facing. */
export const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: 'relevance', label: 'منتخب' },
  { value: 'price-asc', label: 'قیمت: کم به زیاد' },
  { value: 'price-desc', label: 'قیمت: زیاد به کم' },
  { value: 'rating-desc', label: 'رتبه: زیاد به کم' },
  { value: 'title-asc', label: 'نام: الف تا ی' }
]

export const DEFAULT_SORT: SortKey = 'relevance'

/** Debounce applied to the search input before it is written to the URL. */
export const SEARCH_DEBOUNCE_MS = 300

/** Fallback shown when a product has no usable rating value. */
export const NO_RATING_LABEL = 'بدون امتیاز'
import type { SortKey } from '~/types/catalog'

/**
 * Sort options rendered in the toolbar / drawer. Order is user-facing; the
 * labels are i18n keys (`catalog.sortOptions.*`) resolved where they render.
 */
export const SORT_OPTIONS: ReadonlyArray<{ value: SortKey; labelKey: string }> = [
  { value: 'relevance', labelKey: 'catalog.sortOptions.relevance' },
  { value: 'price-asc', labelKey: 'catalog.sortOptions.price-asc' },
  { value: 'price-desc', labelKey: 'catalog.sortOptions.price-desc' },
  { value: 'rating-desc', labelKey: 'catalog.sortOptions.rating-desc' },
  { value: 'title-asc', labelKey: 'catalog.sortOptions.title-asc' }
]

export const DEFAULT_SORT: SortKey = 'relevance'

/** Debounce applied to the search input before it is written to the URL. */
export const SEARCH_DEBOUNCE_MS = 300

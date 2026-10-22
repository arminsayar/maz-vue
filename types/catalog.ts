/** View-model types for catalog controls (search, filter, sort). */

/** Sort keys supported by the catalog. Price asc/desc are the required minimum. */
export type SortKey =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'title-asc'

/** The complete, serialisable catalog control state (mirrored to the URL). */
export interface CatalogFilters {
  search: string
  /**
   * Selected categories. Multi-select: the catalog matches a product when its
   * category is in this list, so several categories can be combined at once.
   * An empty array means "all categories".
   */
  categories: string[]
  sort: SortKey
}

/** Parsed, sanitised filters plus helpers derived from them. */
export interface CatalogFilterState extends CatalogFilters {
  /** True when any non-default filter is active. */
  isActive: boolean
  /** Count of active filters excluding sort (sort is not a "filter" per se). */
  activeCount: number
}
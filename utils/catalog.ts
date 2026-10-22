import type { Product } from '~/types/product'
import type { CatalogFilters, SortKey } from '~/types/catalog'
import { DEFAULT_SORT } from '~/constants/catalog'

/**
 * Pure catalog transforms.
 *
 * Filtering and sorting live here (not in a component or the API layer) so they
 * are independently testable, reusable and free of any Vue/DOM dependency. The
 * composable that powers the UI is a thin reactive wrapper around these.
 */

function normalise(value: string): string {
  return value.trim().toLowerCase()
}

/** Case-insensitive title search. Empty query matches everything. */
export function matchesSearch(product: Product, query: string): boolean {
  const q = normalise(query)
  if (!q) return true
  return normalise(product.title).includes(q)
}

/** Category match. An empty selection matches everything; otherwise the product's
 *  category must be one of the selected ones (multi-select). */
export function matchesCategory(
  product: Product,
  categories: ReadonlyArray<string>
): boolean {
  const selected = categories
    .map((category) => category.trim())
    .filter((category) => category.length > 0)
  if (selected.length === 0) return true
  return selected.includes(product.category)
}

/** Comparator factory for the supported sort keys. Never mutates input. */
export function compareProducts(a: Product, b: Product, sort: SortKey): number {
  switch (sort) {
    case 'price-asc':
      return a.price - b.price
    case 'price-desc':
      return b.price - a.price
    case 'rating-desc':
      return b.rating.rate - a.rating.rate || b.rating.count - a.rating.count
    case 'title-asc':
      return a.title.localeCompare(b.title)
    case 'relevance':
    default:
      // "Featured" preserves the API's curated order (originally by id).
      return a.id - b.id
  }
}

/** Apply search + category filters, then sort. Returns a new array. */
export function applyCatalogFilters(
  products: ReadonlyArray<Product>,
  filters: Pick<CatalogFilters, 'search' | 'categories' | 'sort'>
): Product[] {
  return products
    .filter(
      (p) =>
        matchesSearch(p, filters.search) &&
        matchesCategory(p, filters.categories)
    )
    .slice()
    .sort((a, b) => compareProducts(a, b, filters.sort))
}

/**
 * Coerce a single query value (or a repeated one) into a clean, de-duplicated
 * list of category slugs. Non-strings — a hand-edited or hostile URL can put
 * anything in the query — are dropped rather than cast, so the filters can only
 * ever hold real category names.
 */
function readCategoryList(value: unknown): string[] {
  const raw = Array.isArray(value) ? value : [value]
  const selected: string[] = []

  for (const item of raw) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (trimmed && !selected.includes(trimmed)) selected.push(trimmed)
  }

  return selected
}

/**
 * Coerce untrusted URL query values into a valid CatalogFilters object.
 * Anything unrecognised falls back to a safe default, so a hand-edited URL can
 * never crash the page or produce an invalid sort.
 */
export function parseCatalogFilters(
  query: Record<string, unknown>,
  validSorts: ReadonlyArray<SortKey>
): CatalogFilters {
  const search = typeof query.q === 'string' ? query.q : ''
  const categories = readCategoryList(query.category)
  const rawSort = typeof query.sort === 'string' ? query.sort : ''
  const sort = (validSorts as ReadonlyArray<string>).includes(rawSort)
    ? (rawSort as SortKey)
    : DEFAULT_SORT

  return { search, categories, sort }
}

/**
 * Build a query object from filters, omitting defaults for clean URLs.
 * `category` repeats once per selected category (`?category=a&category=b`),
 * which is the one shape a URL can carry a list in without inventing a
 * separator that could also appear inside a slug.
 */
export function buildCatalogQuery(
  filters: CatalogFilters
): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {}
  if (filters.search.trim()) query.q = filters.search.trim()
  if (filters.categories.length) query.category = [...filters.categories]
  if (filters.sort !== DEFAULT_SORT) query.sort = filters.sort
  return query
}

/** True when a filter set differs from the default (used for UI affordances). */
export function hasActiveFilters(
  filters: Pick<CatalogFilters, 'search' | 'categories'>
): boolean {
  return Boolean(filters.search.trim() || filters.categories.length)
}
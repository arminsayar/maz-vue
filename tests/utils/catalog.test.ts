import { describe, expect, it } from 'vitest'
import {
  applyCatalogFilters,
  buildCatalogQuery,
  compareProducts,
  hasActiveFilters,
  matchesCategory,
  matchesSearch,
  parseCatalogFilters
} from '~/utils/catalog'
import { SORT_OPTIONS } from '~/constants/catalog'
import { makeProduct, makeProducts } from '../helpers/factory'

const VALID_SORTS = SORT_OPTIONS.map((option) => option.value)

describe('matchesSearch', () => {
  const product = makeProduct({ title: 'Fjallraven - Foldsack No. 1 Backpack' })

  it('matches on a case-insensitive substring of the title', () => {
    expect(matchesSearch(product, 'backpack')).toBe(true)
    expect(matchesSearch(product, 'FJALLRAVEN')).toBe(true)
    expect(matchesSearch(product, '  foldsack  ')).toBe(true)
  })

  it('does not match unrelated terms', () => {
    expect(matchesSearch(product, 'headphones')).toBe(false)
  })

  it('treats an empty or whitespace query as "match everything"', () => {
    expect(matchesSearch(product, '')).toBe(true)
    expect(matchesSearch(product, '   ')).toBe(true)
  })
})

describe('matchesCategory', () => {
  const product = makeProduct({ category: "men's clothing" })

  it('matches the exact category', () => {
    expect(matchesCategory(product, ["men's clothing"])).toBe(true)
  })

  it('does not match a different category', () => {
    expect(matchesCategory(product, ['jewelery'])).toBe(false)
  })

  it('matches when several categories are selected at once', () => {
    expect(matchesCategory(product, ['electronics', "men's clothing"])).toBe(true)
    expect(matchesCategory(product, ['electronics', 'jewelery'])).toBe(false)
  })

  it('treats an empty or blank selection as "match everything"', () => {
    expect(matchesCategory(product, [])).toBe(true)
    expect(matchesCategory(product, ['', '   '])).toBe(true)
  })
})

describe('compareProducts', () => {
  it('sorts by price ascending', () => {
    const cheap = makeProduct({ id: 1, price: 5 })
    const dear = makeProduct({ id: 2, price: 50 })
    expect(compareProducts(cheap, dear, 'price-asc')).toBeLessThan(0)
  })

  it('sorts by price descending', () => {
    const cheap = makeProduct({ id: 1, price: 5 })
    const dear = makeProduct({ id: 2, price: 50 })
    expect(compareProducts(cheap, dear, 'price-desc')).toBeGreaterThan(0)
  })

  it('breaks rating ties using the review count', () => {
    const few = makeProduct({ id: 1, rating: { rate: 4, count: 3 } })
    const many = makeProduct({ id: 2, rating: { rate: 4, count: 300 } })
    expect(compareProducts(few, many, 'rating-desc')).toBeGreaterThan(0)
  })

  it('falls back to id order for "relevance"', () => {
    const first = makeProduct({ id: 1, title: 'Zebra' })
    const second = makeProduct({ id: 2, title: 'Apple' })
    expect(compareProducts(first, second, 'relevance')).toBeLessThan(0)
  })
})

describe('applyCatalogFilters', () => {
  const catalog = [
    makeProduct({ id: 1, title: 'Gold ring', category: 'jewelery', price: 30 }),
    makeProduct({ id: 2, title: 'Silver ring', category: 'jewelery', price: 10 }),
    makeProduct({ id: 3, title: 'Laptop stand', category: 'electronics', price: 20 }),
    makeProduct({ id: 4, title: 'Ring binder', category: 'electronics', price: 5 })
  ]

  it('combines search, category and sort correctly', () => {
    const result = applyCatalogFilters(catalog, {
      search: 'ring',
      categories: ['jewelery'],
      sort: 'price-asc'
    })

    expect(result.map((p) => p.id)).toEqual([2, 1])
  })

  it('keeps products from every selected category', () => {
    const result = applyCatalogFilters(catalog, {
      search: '',
      categories: ['jewelery', 'electronics'],
      sort: 'relevance'
    })

    expect(result.map((p) => p.id)).toEqual([1, 2, 3, 4])
  })

  it('returns every product when nothing is filtered', () => {
    const result = applyCatalogFilters(catalog, {
      search: '',
      categories: [],
      sort: 'relevance'
    })
    expect(result).toHaveLength(4)
  })

  it('returns an empty array when nothing matches', () => {
    const result = applyCatalogFilters(catalog, {
      search: 'does-not-exist',
      categories: [],
      sort: 'relevance'
    })
    expect(result).toEqual([])
  })

  it('does not mutate the source array', () => {
    const source = makeProducts(3, (i) => ({ price: 10 - i }))
    const snapshot = source.map((p) => p.id)
    applyCatalogFilters(source, { search: '', categories: [], sort: 'price-asc' })
    expect(source.map((p) => p.id)).toEqual(snapshot)
  })
})

describe('hasActiveFilters', () => {
  it('is false for defaults and whitespace-only values', () => {
    expect(hasActiveFilters({ search: '', categories: [] })).toBe(false)
    expect(hasActiveFilters({ search: '  ', categories: [] })).toBe(false)
  })

  it('is true when either filter has a real value', () => {
    expect(hasActiveFilters({ search: 'ring', categories: [] })).toBe(true)
    expect(hasActiveFilters({ search: '', categories: ['jewelery'] })).toBe(true)
  })
})

describe('parseCatalogFilters', () => {
  it('reads valid query values', () => {
    expect(
      parseCatalogFilters(
        { q: 'ring', category: 'jewelery', sort: 'price-desc' },
        VALID_SORTS
      )
    ).toEqual({ search: 'ring', categories: ['jewelery'], sort: 'price-desc' })
  })

  it('reads a repeated category param as a multi-select list', () => {
    const parsed = parseCatalogFilters(
      { category: ['jewelery', 'electronics'] },
      VALID_SORTS
    )

    expect(parsed.categories).toEqual(['jewelery', 'electronics'])
  })

  it('de-duplicates and trims a repeated category param', () => {
    const parsed = parseCatalogFilters(
      { category: [' jewelery ', 'jewelery', ''] },
      VALID_SORTS
    )

    expect(parsed.categories).toEqual(['jewelery'])
  })

  it('defaults everything when the query is empty', () => {
    expect(parseCatalogFilters({}, VALID_SORTS)).toEqual({
      search: '',
      categories: [],
      sort: 'relevance'
    })
  })

  it('rejects an unknown sort key instead of trusting the URL', () => {
    expect(parseCatalogFilters({ sort: 'DROP TABLE' }, VALID_SORTS).sort).toBe(
      'relevance'
    )
  })

  it('ignores non-string query values (e.g. duplicated search params)', () => {
    expect(
      parseCatalogFilters({ q: ['a', 'b'], category: 5 }, VALID_SORTS)
    ).toEqual({ search: '', categories: [], sort: 'relevance' })
  })
})

describe('buildCatalogQuery', () => {
  it('omits default values so URLs stay clean', () => {
    expect(
      buildCatalogQuery({ search: '', categories: [], sort: 'relevance' })
    ).toEqual({})
  })

  it('serialises active filters and trims the search term', () => {
    expect(
      buildCatalogQuery({
        search: '  ring ',
        categories: ['jewelery'],
        sort: 'price-asc'
      })
    ).toEqual({ q: 'ring', category: ['jewelery'], sort: 'price-asc' })
  })

  it('repeats the category param once per selected category', () => {
    expect(
      buildCatalogQuery({
        search: '',
        categories: ['jewelery', 'electronics'],
        sort: 'relevance'
      })
    ).toEqual({ category: ['jewelery', 'electronics'] })
  })

  it('round-trips through parseCatalogFilters', () => {
    const filters = {
      search: 'ring',
      categories: ['jewelery', 'electronics'],
      sort: 'price-desc'
    } as const
    expect(parseCatalogFilters(buildCatalogQuery(filters), VALID_SORTS)).toEqual(
      filters
    )
  })
})
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fetchCategories,
  fetchProduct,
  fetchProducts,
  fetchProductsByCategory,
  normaliseCategories,
  normaliseProduct,
  normaliseProducts
} from '~/services/products'

/**
 * These tests exercise the API layer's two responsibilities: mapping the
 * network response and *not* trusting it. `$fetch` is stubbed at the global
 * level because that is exactly how the service consumes it.
 */
const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const validPayload = {
  id: 3,
  title: 'Mens Cotton Jacket',
  price: 55.99,
  description: 'great outerwear',
  category: "men's clothing",
  image: 'https://fakestoreapi.com/img/3.jpg',
  rating: { rate: 4.7, count: 500 }
}

describe('normaliseProduct', () => {
  it('keeps a well-formed product intact', () => {
    expect(normaliseProduct(validPayload)).toEqual(validPayload)
  })

  it('rejects payloads that are not objects or have no usable id', () => {
    expect(normaliseProduct(null)).toBeNull()
    expect(normaliseProduct('nope')).toBeNull()
    expect(normaliseProduct({})).toBeNull()
    expect(normaliseProduct({ id: 'abc', title: 'x' })).toBeNull()
  })

  it('repairs missing fields instead of rendering undefined', () => {
    const result = normaliseProduct({ id: 7, title: null, price: 'nope' })
    expect(result).not.toBeNull()
    expect(result?.title).toBe('محصول بدون نام')
    expect(result?.price).toBe(0)
    expect(result?.category).toBe('uncategorised')
    expect(result?.rating).toEqual({ rate: 0, count: 0 })
  })

  it('accepts numeric strings for id and price', () => {
    const result = normaliseProduct({ id: '9', price: '12.5' })
    expect(result?.id).toBe(9)
    expect(result?.price).toBe(12.5)
  })
})

describe('normaliseProducts', () => {
  it('returns an empty array for a non-array payload', () => {
    expect(normaliseProducts(null)).toEqual([])
    expect(normaliseProducts({})).toEqual([])
  })

  it('drops unusable entries but keeps the rest', () => {
    const result = normaliseProducts([validPayload, null, { title: 'no id' }])
    expect(result.map((p) => p.id)).toEqual([3])
  })
})

describe('normaliseCategories', () => {
  it('keeps only non-empty strings', () => {
    expect(normaliseCategories(['electronics', '', '  ', 5, null])).toEqual([
      'electronics'
    ])
  })

  it('returns an empty array for a non-array payload', () => {
    expect(normaliseCategories(undefined)).toEqual([])
  })
})

describe('fetchProducts', () => {
  it('calls the products endpoint and normalises the response', async () => {
    fetchMock.mockResolvedValue([validPayload, { title: 'broken' }])
    const result = await fetchProducts()
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/products')
    expect(result).toHaveLength(1)
  })

  it('propagates a normalised ApiError when the API fails', async () => {
    fetchMock.mockRejectedValue({ status: 500 })
    await expect(fetchProducts()).rejects.toThrow(
      'فروشگاه در این لحظه دچار مشکل است.'
    )
  })

  it('reports a connection problem when no status is available', async () => {
    fetchMock.mockRejectedValue(new Error('socket hang up'))
    await expect(fetchProducts()).rejects.toThrow(/دسترسی به فروشگاه/)
  })
})

describe('fetchCategories', () => {
  it('calls the categories endpoint', async () => {
    fetchMock.mockResolvedValue(['electronics'])
    await expect(fetchCategories()).resolves.toEqual(['electronics'])
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/products/categories')
  })
})

describe('fetchProductsByCategory', () => {
  it('url-encodes category names containing spaces', async () => {
    fetchMock.mockResolvedValue([])
    await fetchProductsByCategory("men's clothing")
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/products/category/men's%20clothing"
    )
  })
})

describe('fetchProduct', () => {
  it('returns the normalised product for a valid id', async () => {
    fetchMock.mockResolvedValue(validPayload)
    await expect(fetchProduct(3)).resolves.toEqual(validPayload)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/products/3')
  })

  it('never hits the network for a malformed id', async () => {
    await expect(fetchProduct(Number.NaN)).resolves.toBeNull()
    await expect(fetchProduct(0)).resolves.toBeNull()
    await expect(fetchProduct(-4)).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns null (not an error) when the API 404s', async () => {
    fetchMock.mockRejectedValue({ status: 404 })
    await expect(fetchProduct(9999)).resolves.toBeNull()
  })

  it('returns null when the API responds with an empty body', async () => {
    fetchMock.mockResolvedValue(null)
    await expect(fetchProduct(9999)).resolves.toBeNull()
  })

  it('rethrows genuine server errors so the page can show a retry state', async () => {
    fetchMock.mockRejectedValue({ status: 500 })
    await expect(fetchProduct(1)).rejects.toThrow()
  })
})
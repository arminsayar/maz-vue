import type { Product, ProductCategory } from '~/types/product'
import { apiFetch } from '~/services/api/client'

/**
 * Runtime guards for untrusted API payloads.
 *
 * A public service can return nulls, partial objects or unexpected shapes.
 * Rather than trusting the network blindly — or silently fabricating records —
 * we validate and repair what we can. A single malformed product is dropped so
 * it cannot break the whole grid, and the UI never renders `undefined.toString()`.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function asNumber(value: unknown, fallback: number): number {
  const n = typeof value === 'string' ? Number(value) : value
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

/** Coerce an arbitrary value into a Product, repairing fields where possible. */
export function normaliseProduct(value: unknown): Product | null {
  if (!isRecord(value)) return null

  const id = asNumber(value.id, NaN)
  // A product without a valid id has no usable route — reject it outright.
  if (!Number.isFinite(id)) return null

  const rating = isRecord(value.rating) ? value.rating : {}

  return {
    id,
    title: asString(value.title, 'محصول بدون نام'),
    price: asNumber(value.price, 0),
    description: asString(value.description),
    category: asString(value.category, 'uncategorised'),
    image: asString(value.image),
    rating: {
      rate: asNumber(rating.rate, 0),
      count: asNumber(rating.count, 0)
    }
  }
}

/** Normalise a list, dropping any entries that cannot be repaired. */
export function normaliseProducts(value: unknown): Product[] {
  if (!Array.isArray(value)) return []
  return value
    .map(normaliseProduct)
    .filter((p): p is Product => p !== null)
}

/** Normalise the categories endpoint into a clean string array. */
export function normaliseCategories(value: unknown): ProductCategory[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (c): c is string => typeof c === 'string' && c.trim().length > 0
  )
}

/* ------------------------------------------------------------------ */
/* Endpoints                                                           */
/* ------------------------------------------------------------------ */

/** GET /products — the full catalog. */
export async function fetchProducts(): Promise<Product[]> {
  return normaliseProducts(await apiFetch<unknown>('/products'))
}

/** GET /products/categories — category names. */
export async function fetchCategories(): Promise<ProductCategory[]> {
  return normaliseCategories(await apiFetch<unknown>('/products/categories'))
}

/**
 * GET /products/{id} — a single product.
 * Returns `null` when the endpoint 404s or the payload is unusable, so the
 * detail page can distinguish "not found" from a genuine fetch error.
 */
export async function fetchProduct(id: number): Promise<Product | null> {
  if (!Number.isInteger(id) || id <= 0) return null

  try {
    const data = await apiFetch<unknown>(`/products/${id}`)
    // The API can return an empty body for some invalid ids rather than 404.
    if (data === null || data === undefined) return null
    return normaliseProduct(data)
  } catch (error: unknown) {
    const status =
      typeof error === 'object' && error !== null
        ? (error as { status?: number }).status
        : undefined
    if (status === 404) return null
    throw error
  }
}

/** GET /products/category/{category} — products within one category. */
export async function fetchProductsByCategory(
  category: string
): Promise<Product[]> {
  return normaliseProducts(
    await apiFetch<unknown>(`/products/category/${encodeURIComponent(category)}`)
  )
}
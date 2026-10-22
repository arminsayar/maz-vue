/**
 * Domain types for the storefront.
 *
 * These mirror the Fake Store API response shapes. A single `Product` type is
 * the shared contract between the API layer, composables, components and tests
 * so no layer re-declares its own variation.
 */

export interface ProductRating {
  rate: number
  count: number
}

export interface Product {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: ProductRating
}

/** Category names are dynamic strings from the API, not a fixed union. */
export type ProductCategory = string

/** Server-fetched payload for the product detail page. */
export interface ProductDetail {
  product: Product
  /** Other products in the same category, used for the "related" rail. */
  related: Product[]
}

/** The full catalog plus the category list, fetched once for the listing page. */
export interface CatalogData {
  products: Product[]
  categories: ProductCategory[]
}
import type { Product } from '~/types/product'

/**
 * Deterministic product factory for tests.
 *
 * Only the fields a test cares about are passed in; everything else gets a
 * sensible default so fixtures stay short and readable. Every fixture is a
 * fresh object, so a test can never leak state into another one.
 */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    title: 'Test product',
    price: 10,
    description: 'A product used in tests.',
    category: 'electronics',
    image: 'https://example.test/image.png',
    rating: { rate: 4, count: 10 },
    ...overrides
  }
}

/** Build a list of products with sequential ids, applying `overrides` to each. */
export function makeProducts(
  count: number,
  overrides: (index: number) => Partial<Product> = () => ({})
): Product[] {
  return Array.from({ length: count }, (_, index) =>
    makeProduct({ id: index + 1, title: `Product ${index + 1}`, ...overrides(index) })
  )
}
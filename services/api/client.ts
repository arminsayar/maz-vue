/**
 * Centralised API access.
 *
 * A single configured fetch instance is used across the app so retry policy,
 * error normalisation and the base URL live in one place. Products services
 * import `apiFetch` rather than calling `$fetch` directly, which keeps the
 * endpoint code thin and the cross-cutting concerns centralised.
 *
 * The base URL comes from Nuxt runtime config (overridable via the
 * NUXT_PUBLIC_API_BASE env var) and falls back to the public Fake Store API.
 */

export const DEFAULT_API_BASE = 'https://fakestoreapi.com'

/** Normalised error surfaced to UI states, independent of the fetch library. */
export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function resolveBaseUrl(): string {
  try {
    // Available inside the Nuxt app context (SSR + client).
    const config = useRuntimeConfig()
    return config?.public?.apiBase || DEFAULT_API_BASE
  } catch {
    // Outside Nuxt (unit tests / scripts) fall back to the public API.
    return DEFAULT_API_BASE
  }
}

function statusToMessage(status: number): string {
  if (status === 404) return 'آنچه به دنبالش بودید پیدا نشد.'
  if (status >= 500) return 'فروشگاه در این لحظه دچار مشکل است.'
  return 'هنگام بارگذاری کاتالوگ مشکلی پیش آمد.'
}

/**
 * Fetch JSON from the API with a small retry budget for transient failures.
 * Throws a normalised ApiError so callers never need to know about the
 * underlying fetch implementation.
 */
export async function apiFetch<T>(path: string): Promise<T> {
  const base = resolveBaseUrl()
  try {
    return await $fetch<T>(path, {
      baseURL: base,
      // One retry smooths over transient network/5xx blips without hammering.
      retry: 1,
      retryDelay: 400,
      headers: { Accept: 'application/json' },
      timeout: 12_000
    })
  } catch (error: unknown) {
    const status = extractStatus(error)
    const message =
      status !== undefined
        ? statusToMessage(status)
        : 'دسترسی به فروشگاه ممکن نشد. اتصال خود را بررسی کنید و دوباره تلاش کنید.'
    throw new ApiError(message, status)
  }
}

/** Pull an HTTP status out of the various error shapes ofetch may throw. */
function extractStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null) {
    const candidate = (error as { status?: unknown; statusCode?: unknown })
    if (typeof candidate.status === 'number') return candidate.status
    if (typeof candidate.statusCode === 'number') return candidate.statusCode
  }
  return undefined
}

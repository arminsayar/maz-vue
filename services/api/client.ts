/**
 * Centralised API access.
 *
 * A single configured fetch instance is used across the app so retry policy,
 * error normalisation and the base URL live in one place. Products services
 * import `apiFetch` rather than calling `$fetch` directly, which keeps the
 * endpoint code thin and the cross-cutting concerns centralised.
 *
 * The base URL comes from Nuxt runtime config, which is populated from the
 * `NUXT_PUBLIC_API_BASE` environment variable (see `.env.example`). There is
 * deliberately **no** hard-coded host in this file: the API location is
 * deployment configuration, not code, so it belongs in the environment. A
 * missing value is a misconfiguration and fails loudly (see `resolveBaseUrl`)
 * rather than silently falling back to some baked-in URL.
 *
 * `ApiError.message` carries an i18n key (`errors.*`), not display copy: the
 * service layer stays locale-free and the UI resolves the message with `t()`,
 * so the same error renders in whatever locale is active.
 */

/** Normalised error surfaced to UI states, independent of the fetch library. */
export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** The environment variable that supplies the API base URL. */
export const API_BASE_ENV_KEY = 'NUXT_PUBLIC_API_BASE'

/**
 * Resolve the API base URL from the runtime config.
 *
 * Throws when it is missing: an empty base would make every request hit the
 * app's own origin, which fails in a far more confusing way than an explicit
 * error naming the variable to set.
 */
function resolveBaseUrl(): string {
  let base: string | undefined

  try {
    // Available inside the Nuxt app context (SSR + client).
    base = useRuntimeConfig()?.public?.apiBase
  } catch {
    // Outside Nuxt (unit tests / scripts) there is no runtime config.
    base = undefined
  }

  const trimmed = (base ?? '').trim()
  if (!trimmed) {
    throw new ApiError(
      `Missing API base URL. Set ${API_BASE_ENV_KEY} in your .env file.`
    )
  }

  return trimmed
}

/** i18n key for a given HTTP status; the UI resolves it with `t()`. */
function statusToMessage(status: number): string {
  if (status === 404) return 'errors.notFound'
  if (status >= 500) return 'errors.server'
  return 'errors.request'
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
      status !== undefined ? statusToMessage(status) : 'errors.network'
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

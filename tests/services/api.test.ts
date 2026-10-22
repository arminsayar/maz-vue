import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_ENV_KEY, ApiError, apiFetch } from '~/services/api/client'

/**
 * The API client's job is to turn the base URL into a configured fetch and to
 * normalise every failure into an `ApiError` carrying an i18n *key*.
 *
 * The base URL is deployment configuration (the `NUXT_PUBLIC_API_BASE` env var),
 * never a value baked into the source — so these tests pin that contract: the
 * client uses whatever the environment supplies, and refuses to guess when the
 * environment supplies nothing.
 */
const fetchMock = vi.fn()

/** The stub installed by `tests/setup.ts`, restored after each test. */
const originalUseRuntimeConfig = (globalThis as { useRuntimeConfig?: unknown })
  .useRuntimeConfig

/** Swap the runtime config the client reads, for one test. */
function withApiBase(value: string | undefined): void {
  ;(globalThis as { useRuntimeConfig?: unknown }).useRuntimeConfig = () => ({
    public: { apiBase: value }
  })
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('$fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  // Restore the harness stub so this file's overrides never leak.
  ;(globalThis as { useRuntimeConfig?: unknown }).useRuntimeConfig =
    originalUseRuntimeConfig
})

describe('apiFetch', () => {
  it('calls the configured base URL with the requested path', async () => {
    withApiBase('https://api.example.test')
    fetchMock.mockResolvedValue({ ok: true })

    await expect(apiFetch('/products')).resolves.toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledWith(
      '/products',
      expect.objectContaining({ baseURL: 'https://api.example.test' })
    )
  })

  it('fails loudly when the base URL is not configured', async () => {
    withApiBase(undefined)

    // The error names the variable to set, so the misconfiguration is
    // actionable rather than a silent call to the wrong host.
    await expect(apiFetch('/products')).rejects.toThrow(API_BASE_ENV_KEY)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('treats a blank base URL as missing', async () => {
    withApiBase('   ')

    await expect(apiFetch('/products')).rejects.toThrow(API_BASE_ENV_KEY)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('normalises a server failure into an i18n key', async () => {
    withApiBase('https://api.example.test')
    fetchMock.mockRejectedValue({ status: 503 })

    await expect(apiFetch('/products')).rejects.toThrow('errors.server')
  })

  it('normalises a missing resource into an i18n key', async () => {
    withApiBase('https://api.example.test')
    fetchMock.mockRejectedValue({ status: 404 })

    await expect(apiFetch('/products/1')).rejects.toThrow('errors.notFound')
  })

  it('normalises a client error into an i18n key', async () => {
    withApiBase('https://api.example.test')
    fetchMock.mockRejectedValue({ status: 422 })

    await expect(apiFetch('/products')).rejects.toThrow('errors.request')
  })

  it('reports a connection problem when no status is available', async () => {
    withApiBase('https://api.example.test')
    fetchMock.mockRejectedValue(new Error('socket hang up'))

    await expect(apiFetch('/products')).rejects.toThrow('errors.network')
  })

  it('exposes the HTTP status on the normalised error', async () => {
    withApiBase('https://api.example.test')
    fetchMock.mockRejectedValue({ status: 500 })

    await expect(apiFetch('/products')).rejects.toBeInstanceOf(ApiError)
    await expect(apiFetch('/products')).rejects.toMatchObject({ status: 500 })
  })
})
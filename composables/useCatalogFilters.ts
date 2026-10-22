import { computed, ref, watch } from 'vue'
import type { CatalogFilters, SortKey } from '~/types/catalog'
import { DEFAULT_SORT, SORT_OPTIONS } from '~/constants/catalog'
import {
  buildCatalogQuery,
  hasActiveFilters,
  parseCatalogFilters
} from '~/utils/catalog'

const VALID_SORTS: ReadonlyArray<SortKey> = SORT_OPTIONS.map((o) => o.value)

/**
 * Owns the catalog control state and keeps it in sync with the URL so the
 * current search / category / sort survive a reload or a shared link.
 *
 * Design notes:
 * - Filter state is the source of truth; the URL is a serialised mirror.
 * - The route watcher carries an equality guard so the write-to-URL effect
 *   cannot bounce back and create a loop (back/forward still works).
 */
export function useCatalogFilters() {
  const route = useRoute()
  const router = useRouter()

  const initial = parseCatalogFilters(route.query, VALID_SORTS)

  const search = ref(initial.search)
  const categories = ref<string[]>([...initial.categories])
  const sort = ref<SortKey>(initial.sort)

  const filters = computed<CatalogFilters>(() => ({
    search: search.value,
    categories: categories.value,
    sort: sort.value
  }))

  const isActive = computed(() =>
    hasActiveFilters({ search: search.value, categories: categories.value })
  )

  /** Number of active constraints: the search term counts once, every selected
   *  category counts once. Sort is not a filter, so it is excluded. */
  const activeCount = computed(
    () => (search.value.trim() ? 1 : 0) + categories.value.length
  )

  // Write filter state to the URL. replace (not push) because filters are not
  // discrete history steps the user expects to walk back through one-by-one.
  watch(filters, (next) => {
    const query = buildCatalogQuery(next)
    if (router.resolve({ query }).href === route.fullPath) return
    void router.replace({ query })
  })

  // Reflect external URL changes (back/forward, shared link) into state.
  watch(
    () => route.query,
    (q) => {
      const parsed = parseCatalogFilters(q as Record<string, unknown>, VALID_SORTS)
      if (parsed.search !== search.value) search.value = parsed.search
      if (parsed.categories.join('\u0000') !== categories.value.join('\u0000')) {
        categories.value = [...parsed.categories]
      }
      if (parsed.sort !== sort.value) sort.value = parsed.sort
    }
  )

  function setSearch(value: string): void {
    search.value = value
  }

  /** Replace the whole selection (used by the checkbox group's v-model). */
  function setCategories(values: ReadonlyArray<string>): void {
    categories.value = [...values]
  }

  /** Add or remove one category, keeping the selection order stable. */
  function toggleCategory(value: string): void {
    const trimmed = value.trim()
    if (!trimmed) return
    categories.value = categories.value.includes(trimmed)
      ? categories.value.filter((category) => category !== trimmed)
      : [...categories.value, trimmed]
  }

  function setSort(value: SortKey): void {
    sort.value = value
  }

  /** Reset every filter (including sort) back to its default. */
  function clearAll(): void {
    search.value = ''
    categories.value = []
    sort.value = DEFAULT_SORT
  }

  return {
    search,
    categories,
    sort,
    filters,
    isActive,
    activeCount,
    setSearch,
    setCategories,
    toggleCategory,
    setSort,
    clearAll
  }
}
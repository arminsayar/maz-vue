/**
 * i18n catalogue check.
 *
 * Verifies that the `fa` and `en` catalogues hold exactly the same set of
 * message keys, and that every key the source can reach actually exists.
 *
 * A message key reaches the translator in several ways, and all of them are
 * collected here:
 *   1. a literal call — `t('catalog.h1')`;
 *   2. a constant — `labelKey: 'header.links.products'` in `constants/`, which
 *      the component then passes to `t()`;
 *   3. a conditional expression — `count === 1 ? 'catalog.resultsOne' : …`;
 *   4. a returned value — the API client returns `'errors.server'` as the
 *      message of an `ApiError`, and the UI resolves it with `t()`;
 *   5. a template literal — `t(\`social.${icon}\`)`, which resolves to a whole
 *      *namespace*: every key under the `social.` prefix counts as used.
 *
 * Cases 1–4 are all "a dotted string literal somewhere in the source", so the
 * scan collects every such literal and matches it against the catalogue. To
 * keep that from flagging unrelated dotted strings (file paths, CSS classes),
 * a literal is only treated as a message key when its first segment matches a
 * namespace the catalogue actually defines.
 *
 * Run with `npm run i18n:check`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const LOCALES_DIR = join(ROOT, 'i18n', 'locales')
const SCAN_DIRS = ['components', 'composables', 'pages', 'layouts', 'utils', 'services', 'constants']
const ROOT_FILES = ['app.vue', 'error.vue']
const SCAN_EXT = new Set(['.vue', '.ts'])

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  )
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, files)
    else files.push(full)
  }
  return files
}

const fa = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, 'fa.json'), 'utf8')))
const en = flatten(JSON.parse(readFileSync(join(LOCALES_DIR, 'en.json'), 'utf8')))

const faSet = new Set(fa)
const enSet = new Set(en)
const missingInEn = fa.filter((key) => !enSet.has(key))
const missingInFa = en.filter((key) => !faSet.has(key))

// The top-level namespaces the catalogue defines — the first segment of a key.
const namespaces = new Set(fa.map((key) => key.split('.')[0]))

const sources = []
for (const dir of SCAN_DIRS) {
  const full = join(ROOT, dir)
  try {
    for (const file of walk(full)) {
      if (SCAN_EXT.has(file.slice(file.lastIndexOf('.')))) sources.push(file)
    }
  } catch {
    // The directory does not exist in this project layout — skip it.
  }
}
for (const file of ROOT_FILES) sources.push(join(ROOT, file))

// Every dotted string literal in the source, plus the dynamically-built
// namespaces (`t(\`social.${icon}\`)`).
const literals = new Set()
const dynamicNamespaces = new Set()

for (const file of sources) {
  const source = readFileSync(file, 'utf8')

  // A dotted, lowercase-initial literal: 'catalog.h1', 'catalog.resultsOne',
  // 'catalog.sortOptions.price-asc', 'errors.server'.
  for (const match of source.matchAll(/'([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9-]+)+)'/g)) {
    literals.add(match[1])
  }

  // Template literals resolve a whole namespace at runtime.
  for (const match of source.matchAll(/\bt\(\s*`([a-zA-Z0-9_]*)\.\$\{/g)) {
    dynamicNamespaces.add(match[1])
  }
}

// A literal only counts as a message key when its first segment is a namespace
// the catalogue defines — that filters out file paths and CSS class names.
const referenced = [...literals].filter((key) => namespaces.has(key.split('.')[0]))

const unknown = referenced.filter((key) => !faSet.has(key)).sort()

// A catalogue key counts as used if the source mentions it literally, or if it
// falls under a namespace that is resolved dynamically.
const isUsed = (key) =>
  literals.has(key) || [...dynamicNamespaces].some((ns) => key.startsWith(`${ns}.`))
const unused = fa.filter((key) => !isUsed(key)).sort()

let failed = false
const report = (label, items) => {
  if (!items.length) return
  failed = true
  console.error(`\n${label} (${items.length}):`)
  for (const item of items) console.error(`  - ${item}`)
}

console.log(
  `fa: ${fa.length} keys | en: ${en.length} keys | referenced: ${referenced.length} | dynamic namespaces: ${[...dynamicNamespaces].join(', ') || 'none'}`
)
report('Keys present in fa but missing in en', missingInEn)
report('Keys present in en but missing in fa', missingInFa)
report('Referenced keys that do not exist in the catalogue', unknown)
report('Catalogue keys never referenced from the source', unused)

if (failed) {
  console.error('\ni18n check FAILED')
  process.exit(1)
}
console.log('\ni18n check passed')

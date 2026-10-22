# maz-vue

A **Persian-first (RTL)** product browsing experience (listing + detail) built with **Nuxt 3 / Vue 3 / TypeScript** against a public product API (Fake Store).

The app is server-rendered, keyboard- and screen-reader-friendly, resilient to malformed API payloads, and covered by unit + component tests.

---

## Localisation (Persian / RTL)

The storefront ships in Persian only. It is not a translation layer bolted on top — RTL is the primary direction the layout is authored for:

- **Document direction** — `htmlAttrs: { lang: 'fa', dir: 'rtl' }` in `nuxt.config.ts`, so the whole document resolves to `dir="rtl"`.
- **Logical CSS properties** — every directional rule uses `inset-inline-start` / `inset-inline-end` / `padding-inline` / `margin-inline-start` instead of `left` / `right`. The drawer, search affordances, sort chevron, category badge and skip link all mirror automatically with no duplicated rules.
- **Mirrored directional icons** — forward chevrons point left and the "back to shop" arrow points right, because those are the correct directions in RTL.
- **Typography** — the design specifies **Yekan Bakh**, a licensed (paid) font family. It is not self-hosted or fetched from a public CDN without a licence. `--font-sans` / `--font-display` therefore resolve as `'Yekan Bakh'` (used when licensed font files are provided) → `'Yekan'` (the foundry's free sibling, loaded from the Persian webfont CDN) → `'Vazirmatn'` (the open fallback that also covers the 500/600 weights that Yekan does not ship) → system UI fonts. All four are Persian-first families with matching Latin glyphs, so mixed strings keep a consistent rhythm. Because Arabic-script text is cursive, both tracking tokens (`--ls-tight`, `--ls-wide`) are set to `0` and the line-height scale is loosened to accommodate Persian typography.
- **Persian numerals** — `Intl.NumberFormat('fa-IR')` renders Persian digits (`۰–۹`), the Persian decimal separator (`٫`) and the Persian thousands separator (`٬`) for prices, ratings and counts.
- **Localised category labels** — API category slugs are mapped to Persian labels for display, while the raw slug remains in the URL and is used for filtering. Presentation is localised; source data is not modified.

## What it does

### Listing page (`/`)

- Full catalog in a responsive card grid, with the first row eager-loaded for a fast Largest Contentful Paint (LCP).
- Search by title, filter by category, and sort by price (ascending/descending), rating or name.
- Filter state is mirrored into the URL (`?q=&category=&sort=`), so reloads, shared links and browser back/forward navigation restore the same view.
- Explicit states: loading skeletons, error with retry, empty catalog, and no matches for the current filters with a clear-all action.
- The result count is announced through `aria-live="polite"`.

### Product detail (`/products/:id`)

- Product data is fetched by ID, so direct visits, refreshes and shared links work.
- The category badge links back to the catalog pre-filtered by that category.
- A "More like this" rail shows up to four other products from the same category.
- Distinct loading, error and not-found states; a genuinely missing product also sets an HTTP 404 status for crawlers.

### Cross-cutting

- Responsive from 320px up: the catalog toolbar collapses into a search field and a Filters button that opens an accessible slide-over drawer.
- Dark-ready design tokens, `prefers-reduced-motion` support, visible focus rings, a skip link and semantic landmarks.

## Site footer

The footer is mounted once by `layouts/default.vue`, so every routed page includes it consistently.

The footer is implemented based on the supplied Figma footer specification (1440px frame). Its visual styling is intentionally scoped to `.footer`, including the design's separate pink accent (`#E20054`), so these styles do not leak into the storefront's primary design tokens.

### Structure

The footer consists of a white main band with a `16px 16px 0 0` radius, a subtle `0 -2px 2px rgba(0,0,0,.04)` shadow and a 36px top inset. It contains three regions:

| Region | Contents |
| --- | --- |
| Link columns (inline start) | Three columns, 24px apart, with 20px/700 `#253343` headings and 13px/500 `#30445B` links on a 12px rhythm |
| Centre | A strapline (13px/24, `#445A74`) above an 184×24 social row containing five 24px icons with 16px gaps, styled in `#F180A9` with the highlighted tile in `#E20054` |
| Trust badges (inline end) | Two 72×72 tiles with a 6px radius and 16px spacing, displaying local e-namad and samandehi artwork with `object-fit: contain` |

The footer sits above a `#F8F9FC` bottom bar with a `16px 16px 0 0` radius. The copyright content follows the design's inline-end alignment, preserving the specified 416px combined width (264px + 152px).

### Responsive behavior

- At widths of 1023px and below, the three regions stack, the link columns become an auto-fitting grid, and fixed heights are removed.
- At widths of 639px and below, the footer becomes a centered single-column layout with a two-column link grid, 60px trust badges, a 12px radius and a compact bottom bar.
- The layout adapts to narrow viewports to prevent content collisions, including at 320px.

### Accessibility

- The footer uses the semantic `<footer>` contentinfo landmark.
- Link columns are grouped in a labelled `<nav>`.
- Icon-only social links include a text alternative (for example, `در تلگرام`) and use `rel="noopener noreferrer"`.
- Trust-badge images use `alt=""` when decorative, while their enclosing links provide accessible names.
- The copyright year uses the Solar Hijri calendar and Persian digits.

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Nuxt 3.21 (SSR), Vue 3.5 |
| Language | TypeScript 5.7, `strict: true`, no `any` |
| Styling | Hand-written CSS with custom properties (design tokens), no CSS framework |
| Data | `$fetch` through a thin service layer (`services/`) |
| Tests | Vitest 3 + `@vue/test-utils` + `happy-dom` |
| Lint | ESLint 9 flat config through `@nuxt/eslint` |
| Type check | `nuxt typecheck` (`vue-tsc`) |

## Getting started

Requires Node.js 20 or later. The project was developed with Node.js 24.

```bash
npm install
cp .env.example .env
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

Configure the API base URL and any social-link overrides in `.env` as needed.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot module replacement |
| `npm run build` | Create a production Nitro build |
| `npm run preview` | Serve the production build locally |
| `npm run generate` | Generate a statically pre-rendered version |
| `npm test` | Run unit and component tests with Vitest |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run typecheck` | Run `nuxt typecheck` with strict TypeScript checking |
| `npm run lint` | Run ESLint over the project |
| `npm run i18n:check` | Verify that the Persian and English catalogues are in sync |

## API configuration

The API base URL is configuration, not application code. It is read from the `NUXT_PUBLIC_API_BASE` environment variable and exposed through Nuxt runtime config. No API host is hard-coded in the source, so the same build can target a different backend or a local mock without code changes.

Example `.env`:

```dotenv
NUXT_PUBLIC_API_BASE=https://fakestoreapi.com
```

If the variable is missing, the application fails clearly on the first request and identifies the environment variable that needs to be configured, rather than silently calling an unintended host.

### Offline development with the mock API

A small stand-in API is included in `scripts/mock-api.mjs` for offline development:

```bash
node scripts/mock-api.mjs
```

The mock server listens on port `4100`. In a separate terminal, configure the application to use it and start Nuxt:

```bash
NUXT_PUBLIC_API_BASE=http://127.0.0.1:4100 npm run dev
```

On Windows PowerShell, set the environment variable for the current session before starting Nuxt:

```powershell
$env:NUXT_PUBLIC_API_BASE = "http://127.0.0.1:4100"
npm run dev
```

## Localisation checks

The `npm run i18n:check` script compares the Persian (`fa`) and English (`en`) catalogues. It verifies that:

- Both catalogues define exactly the same set of keys.
- Every translation key referenced in the source exists.
- No translation key is left unused.

The checker understands three ways a key can be referenced: a literal `t('…')` call, a `labelKey` / `titleKey` constant, and a template literal that resolves a complete namespace, such as `t(\`social.${icon}\`)`.

## Design implementation

The storefront and footer were implemented based on the supplied [Front-Test Figma design](https://www.figma.com/design/2vwsqBfz6b8RD5394y9oIJ/Front-Test?node-id=1-2&t=Yi3SBXH9uz7xCBMD-1).

The implementation follows the design's intended visual language, layout, typography, color palette, spacing and component structure, with responsive adaptations for smaller screens and RTL-specific adjustments for the Persian-first experience. Where necessary, adjustments were made for accessibility, responsive behavior and functional requirements while preserving the intended visual direction.

Shared storefront design tokens are centralized in `assets/css/tokens.css`, with component-specific styles used where the design requires independent treatment, such as the footer's separate accent color.

## Assumptions and implementation decisions

- **Figma design** — The UI was implemented based on the provided Figma design. Responsive behavior and RTL-specific adaptations were applied for the Persian-first storefront while preserving the intended visual direction.
- **Currency** — Product prices come from the Fake Store API in USD and are not converted. The figures remain faithful to the source data and are presented using Persian-localised formatting.
- **Brand names** — Brand names remain in Latin characters because they are proper names; the surrounding interface copy is Persian.
- **Footer copy** — The supplied footer specification includes repeated placeholder text, including `فروشگاه` in the first column, `ثبت نام` in the account column, repeated social labels and overlapping copyright strings. These were treated as placeholders: the columns use distinct labels, the two copyright strings are consolidated into a strapline and a copyright line, and links point to meaningful routes (the catalog or a category-filtered catalog) instead of dead `#` anchors.
- **Footer positioning** — Some absolute x/y positions in the footer specification overlap between link columns and trust-badge tiles. The implementation preserves the specified visual tokens while arranging the three regions according to RTL layout conventions: link columns at inline start, the strapline and social links centered, and trust badges at inline end.
- **Component name resolution** — Nuxt's default `pathPrefix` behavior can expose nested components under folder-prefixed names (for example, `components/layout/SiteHeader.vue` as `LayoutSiteHeader` and `components/ui/AppIcon.vue` as `UiAppIcon`). The templates use flat component names, so `nuxt.config.ts` sets `components: [{ path: '~/components', pathPrefix: false }]` to ensure the header, footer and icons resolve as intended.

## Project structure

```text
.
├── assets/
│   └── css/
│       └── tokens.css
├── components/
│   ├── catalog/
│   ├── layout/
│   ├── product/
│   └── ui/
├── composables/
├── layouts/
├── pages/
├── services/
├── types/
├── utils/
├── scripts/
│   └── mock-api.mjs
├── tests/
├── nuxt.config.ts
├── package.json
└── README.md
```

## License

This project was created as a technical assessment. Check the repository's license and the assessment instructions before reusing or redistributing its code.
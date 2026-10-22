# maz-vue

## Aurora — product browsing storefront

A **Persian-first (RTL)** product browsing experience (listing + detail) built
with **Nuxt 3 / Vue 3 / TypeScript** against the public
[Fake Store API](https://fakestoreapi.com).

The app is server-rendered, keyboard- and screen-reader-friendly, resilient to
malformed API payloads, and covered by unit + component tests.

---

## Localisation (Persian / RTL)

The storefront ships in Persian only. It is not a translation layer bolted on top
— RTL is the primary direction the layout is authored for:

- **Document direction** — `htmlAttrs: { lang: 'fa', dir: 'rtl' }` in
  `nuxt.config.ts`, so the whole document resolves to `dir="rtl"`.
- **Logical CSS properties** — every directional rule uses `inset-inline-start` /
  `inset-inline-end` / `padding-inline` / `margin-inline-start` instead of
  `left` / `right`. The drawer, search affordances, sort chevron, category badge
  and skip link all mirror automatically with no duplicated rules.
- **Mirrored directional icons** — "forward" chevrons point left and the
  "back to shop" arrow points right, because those are the correct directions in
  RTL.
- **Typography** — the design specifies **Yekan Bakh**, which is a licensed
  (paid) family and so cannot be self-hosted or fetched from a public CDN without
  a licence. `--font-sans`/`--font-display` therefore resolve as
  `'Yekan Bakh'` (used the moment licensed files are dropped in) → `'Yekan'`
  (the foundry's free sibling, loaded from the Persian webfont CDN) →
  `'Vazirmatn'` (the open fallback that also covers the 500/600 weights `Yekan`
  does not ship) → system UI fonts. All four are Persian-first families with
  matching Latin glyphs, so mixed strings keep one rhythm. Because Arabic-script
  text is cursive, both tracking tokens (`--ls-tight`, `--ls-wide`) are set to
  `0` and the line-height scale is loosened, since Persian needs more leading
  than Latin.
- **Persian numerals** — `Intl.NumberFormat('fa-IR')` renders the extended
  Arabic-Indic digits (`۰–۹`), the Persian decimal separator (`٫`) and the Persian
  thousands separator (`٬`) for prices, ratings and counts.
- **Localised category labels** — the API's category *slugs* are mapped to
  Persian labels for display, while the raw slug is still what travels in the
  URL and what the filter matches on. Presentation is localised; data is not.

## What it does

**Listing page (`/`)**

- Full catalog in a responsive card grid, with the first row eager-loaded for a
  fast LCP.
- Search by title, filter by category, and sort by price (asc/desc), rating or
  name.
- Filter state is mirrored into the URL (`?q=&category=&sort=`), so a reload, a
  shared link or back/forward restores exactly the same view.
- Explicit states: loading skeletons, error (with retry), empty catalog, and
  "no matches for these filters" (with clear-all).
- The result count is announced through `aria-live="polite"`.

**Product detail (`/products/:id`)**

- Fetched by id, so direct visits, refreshes and shared links all work.
- Category badge links back to the catalog pre-filtered by that category.
- "More like this" rail: up to four other products from the same category.
- Distinct loading / error / not-found states; a genuinely missing product also
  sets an HTTP 404 status for crawlers.

**Cross-cutting**

- Responsive from 320px up: the catalog toolbar collapses into a search field +
  "Filters" button that opens an accessible slide-over drawer.
- Dark-ready design tokens, `prefers-reduced-motion` support, visible focus
  rings, skip link and semantic landmarks.

## Site footer

The footer is mounted once by `layouts/default.vue`, so **every routed page**
carries it — no page opts in, and no page can forget to. It is built from the
Figma footer spec (1440 frame) rather than from the app's own tokens, because the
design deliberately gives the footer its own accent (`#E20054`) instead of the
storefront's green; those values are scoped to `.footer` so they cannot leak.

**Structure** — a white main band (`#FFFFFF`, `16px 16px 0 0` radius,
`0 -2px 2px rgba(0,0,0,.04)` shadow, 36px top inset) holding three regions:

| Region                    | Contents                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| Link columns (inline start) | Three columns, 24px apart, 20px/700 `#253343` headings, 13px/500 `#30445B` links on a 12px rhythm |
| Centre                    | One strapline (13/24, `#445A74`) above the 184×24 social row (5 × 24px icons, 16px gaps; `#F180A9`, with the highlighted tile in `#E20054`) |
| Trust badges (inline end) | Two 72×72 tiles, 6px radius, 16px apart, showing the local e-namad/samandehi artwork with `object-fit: contain` |

…sitting on a `#F8F9FC` bottom bar with a `16px 16px 0 0` radius and the
copyright at the inline end (264 + 152 = the design's 416px total).

**Responsive** — at ≤1023px the three regions stack, the link columns become an
auto-fitting grid and the bands give up their fixed heights; at ≤639px it is a
single centred stack with a 2-up link grid, 60px badges, a 12px radius and a
compact bottom bar, so nothing collides at 320px.

**Accessibility** — the footer is a `<footer>` (contentinfo) landmark, the link
columns are a labelled `<nav>`, the icon-only social links carry a text
alternative (`Aurora در تلگرام`) plus `rel="noopener noreferrer"`, the badge
images are decorative (`alt=""`) because their anchor already carries the name,
and the copyright year is the *Persian* (Solar Hijri) year in Persian digits.

## Tech stack

| Concern    | Choice                                                            |
| ---------- | ----------------------------------------------------------------- |
| Framework  | Nuxt 3.21 (SSR), Vue 3.5                                          |
| Language   | TypeScript 5.7, `strict: true`, no `any`                          |
| Styling    | Hand-written CSS with custom properties (design tokens), no framework |
| Data       | `$fetch` via a thin service layer (`services/`)                    |
| Tests      | Vitest 3 + `@vue/test-utils` + `happy-dom`                         |
| Lint       | ESLint 9 flat config via `@nuxt/eslint`                            |
| Type check | `nuxt typecheck` (vue-tsc)                                         |

## Getting started

Requires Node.js 20+ (developed on Node 24).

```bash
npm install       # installs deps and runs `nuxt prepare`
npm run dev       # http://localhost:3000
```

## Scripts

| Script               | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Dev server with HMR                            |
| `npm run build`      | Production (Nitro) build                       |
| `npm run preview`    | Serve the production build locally             |
| `npm run generate`   | Static pre-render                              |
| `npm test`           | Vitest run (unit + component)                  |
| `npm run test:watch` | Vitest in watch mode                           |
| `npm run typecheck`  | `nuxt typecheck` (vue-tsc, strict)             |
| `npm run lint`       | ESLint over the project                        |

The API base URL is read from Nuxt runtime config and can be pointed elsewhere
without code changes:

```bash
NUXT_PUBLIC_API_BASE=https://fakestoreapi.com npm run dev
```

## Assumptions

- **Figma** — the referenced Figma file
  ([Front-Test](https://www.figma.com/design/2vwsqBfz6b8RD5394y9oIJ/Front-Test))
  is not machine-readable from this environment: it is an auth-gated SPA and no
  Figma MCP server or API token was available, so the frames could not be
  inspected. The visual language was therefore authored deliberately to be
  cohesive and premium rather than to match specific frames. Everything visual
  is funnelled through the design tokens in `assets/css/tokens.css`, so re-skinning
  the app to match the Figma file is a change to that one file (plus ad-hoc
  component styles where the frames differ structurally).
- **Currency** — prices come from the Fake Store API in USD and are deliberately
  *not* converted. They are only presented in Persian, so the figures stay
  truthful to the source data.
- **Brand name** — "Aurora" is left as-is (Latin) since brand names are not
  normally transliterated; all surrounding UI copy is Persian.
- **Footer copy** — the supplied footer spec carries untranslated Figma
  placeholders: `فروشگاه` twice in the first column, `ثبت نام` three times in the
  account column, repeated social labels, and two overlapping copyright strings.
  They are treated as placeholders: each column keeps distinct labels, the two
  copyright strings collapse into one strapline plus one `©` line, and every link
  points at a real route (`/` or a catalog query) instead of a dead `#` anchor.
  The spec's absolute x/y coordinates are also mutually inconsistent (the link
  columns' x-positions overlap the badge tiles), so the footer reproduces every
  colour, size, spacing and radius token exactly while the three regions are
  placed by RTL convention: link columns at the inline start, strapline + social
  centred, trust badges at the inline end.
- **Component name resolution** — Nuxt's default `pathPrefix` exposes nested
  components under their folder name (`components/layout/SiteHeader.vue` →
  `<LayoutSiteHeader>`, `components/ui/AppIcon.vue` → `<UiAppIcon>`), while every
  template in this codebase refers to components by their file name alone. Before
  this change those references resolved to nothing, so the header, the footer and
  every icon were silently dropped from the rendered page. `nuxt.config.ts` now
  sets `components: [{ path: '~/components', pathPrefix: false }]`, which
  registers exactly the flat names the templates already use.
<script setup lang="ts">
import { computed } from 'vue'

/**
 * Inline SVG icon set.
 *
 * A single icon component guarantees consistent viewBox geometry, stroke width,
 * cap/join style and alignment across the whole UI — the brief asks for
 * consistent icon sizing/alignment rather than ad-hoc SVGs scattered around.
 * Social brand marks live here too (see the note above them) so the footer's
 * icon row is drawn from the same set as the rest of the app.
 *
 * The PATHS map contains static, developer-authored markup (never user input),
 * so binding it with v-html is safe. Icons use `currentColor`, so they inherit
 * text colour and therefore respect contrast and focus states automatically.
 */
type IconName =
  | 'search'
  | 'close'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'home'
  | 'zoom-in'
  | 'menu'
  | 'arrow-left'
  | 'arrow-right'
  | 'star'
  | 'sliders'
  | 'check'
  | 'alert'
  | 'package'
  | 'refresh'
  | 'telegram'
  | 'instagram'
  | 'twitter'
  | 'youtube'
  | 'linkedin'
  | 'grid'
  | 'book'
  | 'question'
  | 'phone'

const PATHS: Record<IconName, string> = {
  search:
    '<circle cx="11" cy="11" r="7"/><line x1="16.7" y1="16.7" x2="21" y2="21"/>',
  close:
    '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
  /* RTL mirroring is explicit: "next" points left and "previous" points right,
     so components pick the glyph that reads correctly rather than flipping one. */
  'chevron-left': '<polyline points="15 6 9 12 15 18"/>',
  'chevron-right': '<polyline points="9 6 15 12 9 18"/>',
  home: '<path d="M3.6 11.2 12 4.2l8.4 7"/><path d="M6.2 9.9v9.5h11.6V9.9"/>',
  'zoom-in':
    '<circle cx="11" cy="11" r="7"/><line x1="16.7" y1="16.7" x2="21" y2="21"/><line x1="11" y1="8.2" x2="11" y2="13.8"/><line x1="8.2" y1="11" x2="13.8" y2="11"/>',
  menu: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>',
  'arrow-left':
    '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  'arrow-right':
    '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  star: '<path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.53l-5.81 3.05L7.3 14.1 2.6 9.5l6.5-.95z"/>',
  sliders:
    '<line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="9" cy="8" r="2.6"/><circle cx="15" cy="16" r="2.6"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  alert:
    '<circle cx="12" cy="12" r="9"/><line x1="12" y1="7.5" x2="12" y2="13"/><line x1="12" y1="16.4" x2="12" y2="16.5"/>',
  package:
    '<path d="M12 3l9 5v8l-9 5-9-5V8z"/><path d="M3.3 7.8L12 12.5l8.7-4.7"/><line x1="12" y1="12.5" x2="12" y2="21"/>',
  refresh:
    '<polyline points="21 5 21 10 16 10"/><path d="M20.5 13a8.5 8.5 0 1 1-2.1-8.9L21 5"/>',

  /*
   * Social brand marks. These are solid logos, so they are drawn with `filled`
   * (below) — a 1.75px stroke would turn them into outlines and lose the
   * letterforms. They keep the same 24×24 viewBox as the stroke icons so the
   * footer's 184×24 row lines up on one optical grid.
   */
  telegram:
    'M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  instagram:
    'M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm7.846-10.405a1.441 1.441 0 01-2.88 0 1.44 1.44 0 012.88 0z',
  twitter:
    'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
  youtube:
    'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',

  /*
   * Header line icons, authored on the design's 16×16 grid (see COMPACT_ICONS
   * below). The strokes carry their own widths and inherit `currentColor`, so one
   * glyph serves both the navy nav items and the white button. `phone` is a solid
   * mark: it is a fill-tracing of the handset outline, not a stroked outline.
   */
  grid:
    '<rect x="1.6" y="1.6" width="5.4" height="5.4" rx="1.4"/><rect x="9" y="1.6" width="5.4" height="5.4" rx="1.4"/><rect x="1.6" y="9" width="5.4" height="5.4" rx="1.4"/><rect x="9" y="9" width="5.4" height="5.4" rx="1.4"/>',
  book:
    '<path d="M14.6666 11.16V3.11336C14.6666 2.31336 14.0133 1.72002 13.2199 1.78669H13.1799C11.7799 1.90669 9.65325 2.62002 8.46659 3.36669L8.35325 3.44002C8.15992 3.56002 7.83992 3.56002 7.64659 3.44002L7.47992 3.34002C6.29325 2.60002 4.17325 1.89336 2.77325 1.78002C1.97992 1.71336 1.33325 2.31336 1.33325 3.10669V11.16C1.33325 11.8 1.85325 12.4 2.49325 12.48L2.68659 12.5067C4.13325 12.7 6.36659 13.4334 7.64659 14.1334L7.67325 14.1467C7.85325 14.2467 8.13992 14.2467 8.31325 14.1467C9.59325 13.44 11.8333 12.7 13.2866 12.5067L13.5066 12.48C14.1466 12.4 14.6666 11.8 14.6666 11.16Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 3.65997V13.66" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.16675 5.65997H3.66675" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.66675 7.65997H3.66675" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
  question:
    '<path d="M11.3333 12.2867H8.66659L5.69991 14.26C5.25991 14.5533 4.66659 14.24 4.66659 13.7067V12.2867C2.66659 12.2867 1.33325 10.9534 1.33325 8.95337V4.95333C1.33325 2.95333 2.66659 1.62 4.66659 1.62H11.3333C13.3333 1.62 14.6666 2.95333 14.6666 4.95333V8.95337C14.6666 10.9534 13.3333 12.2867 11.3333 12.2867Z" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.99996 7.5733V7.43333C7.99996 6.98 8.27998 6.73998 8.55998 6.54665C8.83331 6.35998 9.10661 6.11999 9.10661 5.67999C9.10661 5.06666 8.61329 4.5733 7.99996 4.5733C7.38663 4.5733 6.89331 5.06666 6.89331 5.67999" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.99708 9.16665H8.00308" stroke-width="1.2" stroke-linecap="square" stroke-linejoin="round"/>',
  phone: '<path d="M12.94 8.67a10.5 10.5 0 0 1-1.32-.34 1.33 1.33 0 0 0-1.65.66l-.15.31a9.6 9.6 0 0 1-3.12-3.12l.31-.15a1.33 1.33 0 0 0 .66-1.65 10.5 10.5 0 0 1-.34-1.32 1.33 1.33 0 0 0-1.32-1.12H3.33a1.33 1.33 0 0 0-1.32 1.52 13.33 13.33 0 0 0 12 12 1.33 1.33 0 0 0 1.52-1.32v-2.67a1.33 1.33 0 0 0-1.12-1.32z" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.33 1.33a5.33 5.33 0 0 1 5.34 5.34M9.33 4a2.67 2.67 0 0 1 2.67 2.67" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>'
}
const props = withDefaults(
  defineProps<{ name: IconName; size?: number; filled?: boolean }>(),
  { size: 20, filled: false }
)

/**
 * Icons drawn on the design's 16×16 grid rather than the UI set's 24×24 box.
 * Their paths carry their own stroke widths, so they render exactly as authored;
 * every other icon keeps the 24×24 geometry and 1.75px stroke.
 */
const COMPACT_ICONS: ReadonlySet<IconName> = new Set<IconName>([
  'grid',
  'book',
  'question',
  'phone'
])

const inner = computed(() => PATHS[props.name])
const isCompact = computed(() => COMPACT_ICONS.has(props.name))
const viewBox = computed(() => (isCompact.value ? '0 0 16 16' : '0 0 24 24'))
const strokeWidth = computed(() => (isCompact.value ? 1.2 : 1.75))
</script>

<template>
  <!--
    v-html is safe here: PATHS holds developer-authored, static SVG markup and
    no user input ever reaches this directive. Scoped to this one element.
  -->
  <!-- eslint-disable vue/no-v-html -->
  <svg
    class="icon"
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :fill="filled ? 'currentColor' : 'none'"
    :stroke="filled ? 'none' : 'currentColor'"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    v-html="inner"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
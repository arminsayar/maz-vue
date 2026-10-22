import { useI18n } from 'vue-i18n'
import {
  SOCIAL_LINKS,
  SOCIAL_LINK_DEFAULTS,
  type SocialIconName
} from '~/constants/site'

/** A social profile, fully resolved for rendering: mark, label and target. */
export interface SocialLink {
  icon: SocialIconName
  /** Locale-resolved brand name, e.g. «تلگرام» / «Telegram». */
  label: string
  /** Profile URL — env-overridable, falling back to the shipped defaults. */
  href: string
  /** Marks the single badge the design accents (#E20054). */
  accent?: boolean
}

/**
 * Social profiles for the footer, resolving each entry's label from i18n and
 * its URL from runtime config (`NUXT_PUBLIC_SOCIAL_<NAME>`, defaulting to
 * `SOCIAL_LINK_DEFAULTS`).
 *
 * `useRuntimeConfig` only exists inside the Nuxt app context; outside it (the
 * standalone Vitest harness stubs it globally, but any other plain mount does
 * not) the call throws and the shipped defaults apply — the same fallback
 * pattern `services/api/client.ts` uses for the API base URL.
 */
export function useSocialLinks(): SocialLink[] {
  const { t } = useI18n()

  let social: Partial<Record<SocialIconName, string>> = {}
  try {
    social = useRuntimeConfig().public.social ?? {}
  } catch {
    social = SOCIAL_LINK_DEFAULTS
  }

  return SOCIAL_LINKS.map(({ icon, accent }) => ({
    icon,
    accent,
    label: t(`social.${icon}`),
    href: social[icon] ?? SOCIAL_LINK_DEFAULTS[icon]
  }))
}

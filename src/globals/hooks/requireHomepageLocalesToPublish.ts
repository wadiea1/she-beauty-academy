import type { GlobalBeforeChangeHook } from 'payload'
import { locales } from '@/i18n/config'
import { activeLocaleOf, fetchExistingGlobal, isEmptyValue, publishBlockedError } from './localeGuard'

/**
 * Only the fields that would leave the public homepage visibly broken or
 * incomplete if missing — section headings and intro copy. Deliberately
 * does NOT reach into array sub-fields (whySHE.pillars[].title,
 * whatYouLeaveWith.points[].text, instructor.bio[].paragraph): those are
 * "less complete" if short a row, not "visibly broken" the way a missing
 * hero heading would be. Dot-paths reference each named tab's fields.
 */
const REQUIRED_PATHS = [
  'hero.eyebrow',
  'hero.heading',
  'hero.lead',
  'manifesto.eyebrow',
  'manifesto.heading',
  'manifesto.body',
  'whySHE.eyebrow',
  'whySHE.heading',
  'coursesIntro.eyebrow',
  'coursesIntro.heading',
  'coursesIntro.intro',
  'insideAcademy.eyebrow',
  'insideAcademy.heading',
  'insideAcademy.body',
  'whatYouLeaveWith.eyebrow',
  'whatYouLeaveWith.heading',
  'instructor.eyebrow',
  'instructor.heading',
  'instructor.role',
  'faqIntro.eyebrow',
  'faqIntro.heading',
  'apply.eyebrow',
  'apply.heading',
  'apply.body',
] as const

export const requireHomepageLocalesToPublish: GlobalBeforeChangeHook = async ({ data, req }) => {
  if (data?._status !== 'published') return data

  const activeLocale = activeLocaleOf(req)
  const existing = (await fetchExistingGlobal(req, 'homepage')) as Record<string, unknown> | null

  const missing: string[] = []
  for (const path of REQUIRED_PATHS) {
    const [section, field] = path.split('.') as [string, string]

    const incomingSection = (data as Record<string, unknown>)?.[section] as Record<string, unknown> | undefined
    const incoming = incomingSection?.[field]

    const existingSection = existing?.[section] as Record<string, unknown> | undefined
    const existingField = existingSection?.[field] as Record<string, unknown> | undefined

    for (const locale of locales) {
      const value = activeLocale === locale ? (incoming ?? existingField?.[locale]) : existingField?.[locale]
      if (isEmptyValue(value)) missing.push(`${path} (${locale})`)
    }
  }

  if (missing.length > 0) throw publishBlockedError(missing)
  return data
}

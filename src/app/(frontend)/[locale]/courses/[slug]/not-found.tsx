'use client'

import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { locales, defaultLocale, type Locale } from '@/i18n/config'

/**
 * `not-found.js` files receive no props at all (verified against this
 * Next version's own docs — node_modules/next/dist/docs/01-app/
 * 03-api-reference/03-file-conventions/not-found.md), so `params` isn't
 * available here the way it is in a page/layout. The docs' own
 * recommended workaround for path-dependent content is a Client
 * Component reading `usePathname()`, which is what this does — the
 * enclosing `[locale]` layout has already rendered `<html lang dir>`
 * and Nav/Footer correctly by the time this renders inside it, so only
 * this component's own text needs the locale.
 *
 * A small inline copy table, not the full `getDictionary` — that's
 * `server-only` and can't be imported into a Client Component, and this
 * is only 3 strings.
 *
 * Placed at this exact segment (`courses/[slug]/not-found.tsx`), not a
 * shared one higher up — this is what `courses/[slug]/page.tsx`'s
 * `notFound()` call actually resolves to; confirmed by real-browser
 * testing (curl on the raw SSR response is unreliable for this
 * specific error-boundary path — it streams, so the rendered content
 * isn't present verbatim in the initial HTML the way an ordinary page's
 * is; a real browser session reading the hydrated DOM is what actually
 * proves it).
 */
const copy: Record<Locale, { heading: string; body: string; cta: string }> = {
  ar: {
    heading: 'الدورة غير موجودة',
    body: 'من المحتمل أن هذه الدورة تغيّر مكانها أو لم تعد متاحة.',
    cta: 'العودة إلى الصفحة الرئيسية',
  },
  he: {
    heading: 'הקורס לא נמצא',
    body: 'ייתכן שהקורס הזה הוסר או שאינו זמין עוד.',
    cta: 'חזרה לדף הבית',
  },
  en: {
    heading: 'Course not found',
    body: 'This course may have moved or is no longer available.',
    cta: 'Back to homepage',
  },
}

function localeFromPathname(pathname: string): Locale {
  const match = pathname.match(/^\/(ar|he|en)(?:\/|$)/)
  const candidate = match?.[1]
  return candidate && (locales as readonly string[]).includes(candidate) ? (candidate as Locale) : defaultLocale
}

export default function NotFound() {
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const t = copy[locale]

  return (
    <Section tone="porcelain" spacing="lg">
      <Container width="reading" className="text-center">
        <Heading as="h1" size="xl" className="mb-4">
          {t.heading}
        </Heading>
        <Text size="lg" tone="muted" className="mx-auto mb-8 max-w-md">
          {t.body}
        </Text>
        <Button href={`/${locale}`} size="lg">
          {t.cta}
        </Button>
      </Container>
    </Section>
  )
}

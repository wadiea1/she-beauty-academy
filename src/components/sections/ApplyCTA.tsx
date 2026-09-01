import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { ApplicationForm } from '@/components/apply/ApplicationForm'
import { whatsappHref } from '@/lib/links'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/types'

interface ApplyCTAProps {
  copy: { eyebrow: string; heading: string; body: string }
  ctaLabel: string
  whatsappLabel: string
  whatsappNumber: string | null
  locale: Locale
  courses: { slug: string; title: string }[]
  /** Set on a course page — preselects that course in the form. */
  preselectedCourseSlug?: string | null
  applyFormDict: Dictionary['applyForm']
}

/**
 * Reused as-is on course detail pages (Milestone H) and now hosts the
 * real lead form (Milestone I) — `copy` only needs to structurally
 * match `{ eyebrow, heading, body }`, so a course page can pass its
 * own contextual text without this component knowing anything about
 * Payload's Course type.
 *
 * The section's former primary button (a self-referencing `#apply`
 * placeholder, since no real submission flow existed) is now the form
 * itself. WhatsApp stays as an independent, always-available
 * alternative contact method below it — unrelated to form submission.
 */
export function ApplyCTA({
  copy,
  ctaLabel,
  whatsappLabel,
  whatsappNumber,
  locale,
  courses,
  preselectedCourseSlug,
  applyFormDict,
}: ApplyCTAProps) {
  const whatsapp = whatsappHref(whatsappNumber)

  return (
    <Section id="apply" tone="ink" spacing="lg">
      <Container width="reading" className="text-center">
        <Reveal y={0}>
          <Eyebrow mark={false} className="justify-center text-champagne">
            {copy.eyebrow}
          </Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <Heading as="h2" size="xl" className="mt-4 mb-6">
            {copy.heading}
          </Heading>
        </Reveal>
        <Reveal delay={0.1} y={12}>
          <Text size="lg" className="mx-auto mb-10 max-w-md text-blush">
            {copy.body}
          </Text>
        </Reveal>

        <Reveal delay={0.15}>
          <ApplicationForm
            locale={locale}
            courses={courses}
            preselectedCourseSlug={preselectedCourseSlug}
            dict={applyFormDict}
            submitLabel={ctaLabel}
          />
        </Reveal>

        {whatsapp && (
          <Reveal delay={0.2}>
            <div className="mt-8">
              <Button href={whatsapp} target="_blank" rel="noopener noreferrer" variant="outline-inverse" size="md">
                {whatsappLabel}
              </Button>
            </div>
          </Reveal>
        )}
      </Container>
    </Section>
  )
}

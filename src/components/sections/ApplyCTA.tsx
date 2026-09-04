import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/motion/Parallax'
import { ApplicationForm } from '@/components/apply/ApplicationForm'
import { isPublicLeadIntakeEnabled } from '@/lib/config/runtime'
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
    <Section id="apply" tone="ink" spacing="lg" className="relative overflow-x-clip">
      {/*
        * Depth on a dark ground has to come from light, not from grain:
        * `mix-blend-mode: multiply` over ink is invisible, so the section
        * gets a champagne bloom and two drifting outline rings instead.
        * They echo the hero's furthest plane, which is what ties the top
        * and bottom of the page together as one composition.
        */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(60%_60%_at_50%_0%,rgb(200_174_164/0.22)_0%,transparent_70%)]"
      />
      <Parallax speed={40} className="pointer-events-none absolute -top-10 -start-24 hidden lg:block">
        <div aria-hidden="true" className="h-72 w-72 rounded-full border border-champagne/20" />
      </Parallax>
      <Parallax speed={-30} className="pointer-events-none absolute bottom-0 -end-16 hidden lg:block">
        <div aria-hidden="true" className="h-56 w-56 rounded-full border border-champagne/15" />
      </Parallax>

      <Container width="reading" className="relative text-center">
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
          {/* The launch gate is evaluated here, in a Server
            * Component, so a disabled form is never even rendered —
            * the visitor can't fill in fields that would only be
            * rejected. The API route enforces the same gate
            * independently; this is the UX half, not the boundary.
            * The message is deliberately neutral: no internal reason,
            * no promised response time. */}
          {isPublicLeadIntakeEnabled() ? (
            <ApplicationForm
              locale={locale}
              courses={courses}
              preselectedCourseSlug={preselectedCourseSlug}
              dict={applyFormDict}
              submitLabel={ctaLabel}
            />
          ) : (
            <div className="mx-auto max-w-lg rounded-[var(--radius-card)] border border-porcelain/20 bg-porcelain/[0.07] p-8 text-center shadow-[var(--shadow-e3)] backdrop-blur-[2px]">
              <Text size="lg" className="mb-2 font-medium text-champagne">
                {applyFormDict.unavailableHeading}
              </Text>
              <Text className="text-blush">{applyFormDict.unavailableBody}</Text>
            </div>
          )}
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

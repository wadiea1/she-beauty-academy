import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/motion/Reveal'
import { CourseBreadcrumb } from './CourseBreadcrumb'
import type { ImageRef } from '@/lib/payload/queries'
import type { Locale } from '@/i18n/config'

interface CourseHeroProps {
  locale: Locale
  title: string
  shortDescription: string
  heroImage: ImageRef
  ctaLabel: string
  /** Set only for closed/comingSoon/full — 'open' (the common case)
   * shows no badge at all, matching "don't over-decorate the default
   * state." */
  statusBadge: string | null
  breadcrumbNavLabel: string
  breadcrumbHomeLabel: string
  breadcrumbCoursesLabel: string
}

/**
 * Mirrors the homepage Hero's asymmetric layout (copy carries the
 * section, a supporting portrait frame alongside) for visual
 * consistency, with a breadcrumb standing in for Hero's eyebrow — it
 * already gives the page its context, so a second, separate eyebrow
 * line would be redundant here.
 */
export function CourseHero({
  locale,
  title,
  shortDescription,
  heroImage,
  ctaLabel,
  statusBadge,
  breadcrumbNavLabel,
  breadcrumbHomeLabel,
  breadcrumbCoursesLabel,
}: CourseHeroProps) {
  return (
    <Section tone="porcelain" spacing="lg">
      <Container width="editorial">
        <CourseBreadcrumb
          locale={locale}
          navLabel={breadcrumbNavLabel}
          homeLabel={breadcrumbHomeLabel}
          coursesLabel={breadcrumbCoursesLabel}
          courseTitle={title}
        />

        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal y={0}>
              <Heading as="h1" size="display" className="max-w-2xl">
                {title}
              </Heading>
            </Reveal>
            <Reveal delay={0.1}>
              <Text size="lg" className="mt-6 max-w-lg">
                {shortDescription}
              </Text>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button href="#apply" size="lg">
                  {ctaLabel}
                </Button>
                {statusBadge && (
                  <Text size="sm" tone="muted" className="font-medium">
                    {statusBadge}
                  </Text>
                )}
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <ImageFrame
              ratio="portrait"
              src={heroImage.src}
              alt={heroImage.alt}
              priority
              revealDelay={0.15}
              className="max-w-sm lg:ms-auto"
            />
          </div>
        </div>
      </Container>
    </Section>
  )
}

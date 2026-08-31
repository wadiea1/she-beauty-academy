import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CourseCard } from '@/components/ui/CourseCard'
import type { CourseContent, HomepageContent } from '@/lib/payload/queries'
import type { Locale } from '@/i18n/config'

interface CoursesProps {
  copy: HomepageContent['coursesIntro']
  courses: CourseContent[]
  /** Site-wide default CTA label; a course's own `ctaLabel` (set in
   * Payload) overrides it when present. */
  ctaLabel: string
  locale: Locale
}

export function Courses({ copy, courses, ctaLabel, locale }: CoursesProps) {
  return (
    <Section id="courses" tone="shell" spacing="md">
      <Container width="editorial">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <Heading as="h2" size="lg" className="mt-4 mb-4 max-w-xl">
          {copy.heading}
        </Heading>
        <Text size="lg" tone="muted" className="mb-12 max-w-xl">
          {copy.intro}
        </Text>

        <div className="grid gap-8 sm:grid-cols-3">
          {courses.map((course, i) => (
            <CourseCard
              key={course.slug}
              index={i + 1}
              title={course.title}
              description={course.description}
              href={`/${locale}#apply`}
              ctaLabel={course.ctaLabel ?? ctaLabel}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}

import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CourseCard } from '@/components/ui/CourseCard'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
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
    <Section id="courses" tone="shell" spacing="md" grain>
      <Container width="editorial">
        <Reveal y={0}>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <Heading as="h2" size="lg" className="mt-4 mb-4 max-w-xl">
            {copy.heading}
          </Heading>
        </Reveal>
        <Reveal delay={0.1} y={12}>
          <Text size="lg" tone="muted" className="mb-12 max-w-xl">
            {copy.intro}
          </Text>
        </Reveal>

        <StaggerGroup className="grid gap-8 sm:grid-cols-3">
          {courses.map((course, i) => (
            <StaggerItem key={course.slug} className="h-full">
              <CourseCard
                index={i + 1}
                title={course.title}
                description={course.description}
                href={`/${locale}/courses/${course.slug}`}
                ctaLabel={course.ctaLabel ?? ctaLabel}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}

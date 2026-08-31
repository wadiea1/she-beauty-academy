import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { CourseCard } from '@/components/ui/CourseCard'
import type { HomepageCopy } from '@/content/homepage'
import type { Locale } from '@/i18n/config'

interface CoursesProps {
  copy: HomepageCopy['courses']
  ctaLabel: string
  locale: Locale
}

export function Courses({ copy, ctaLabel, locale }: CoursesProps) {
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
          {copy.items.map((course, i) => (
            <CourseCard
              key={course.slug}
              index={i + 1}
              title={course.title}
              description={course.description}
              href={`/${locale}#apply`}
              ctaLabel={ctaLabel}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}

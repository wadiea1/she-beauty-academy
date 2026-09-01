import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Reveal } from '@/components/motion/Reveal'

interface CourseOverviewProps {
  description: string | null
  audience: string | null
  overviewHeading: string
  audienceHeading: string
  /** Computed by the page based on which sections actually render for
   * this course, so porcelain/shell keeps alternating correctly no
   * matter which optional sections are present. */
  tone: 'porcelain' | 'shell'
}

/**
 * Both blocks are independently optional — today, most courses only
 * have `shortDescription` (already used in the hero), not the longer
 * `description`/`audience` fields. Renders null rather than an empty
 * heading when neither is set.
 */
export function CourseOverview({ description, audience, overviewHeading, audienceHeading, tone }: CourseOverviewProps) {
  if (!description && !audience) return null

  return (
    <Section tone={tone} spacing="md">
      <Container width="reading">
        {description && (
          <div>
            <Reveal y={0}>
              <Heading as="h2" size="lg" className="mb-4">
                {overviewHeading}
              </Heading>
            </Reveal>
            <Reveal delay={0.05} y={12}>
              <Text size="lg" tone="muted">
                {description}
              </Text>
            </Reveal>
          </div>
        )}

        {audience && (
          <div className={description ? 'mt-10' : undefined}>
            <Reveal y={0}>
              <Heading as="h2" size="lg" className="mb-4">
                {audienceHeading}
              </Heading>
            </Reveal>
            <Reveal delay={0.05} y={12}>
              <Text size="lg" tone="muted">
                {audience}
              </Text>
            </Reveal>
          </div>
        )}
      </Container>
    </Section>
  )
}

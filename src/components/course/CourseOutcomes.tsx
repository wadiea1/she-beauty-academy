import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'

interface CourseOutcomesProps {
  outcomes: string[]
  heading: string
  tone: 'porcelain' | 'shell'
}

/** Same visual treatment as the homepage's WhatYouLeaveWith. Renders
 * nothing when empty — no outcome is ever invented to fill the list. */
export function CourseOutcomes({ outcomes, heading, tone }: CourseOutcomesProps) {
  if (outcomes.length === 0) return null

  return (
    <Section tone={tone} spacing="md">
      <Container width="reading">
        <Reveal y={0}>
          <Heading as="h2" size="lg" className="mb-10">
            {heading}
          </Heading>
        </Reveal>

        <StaggerGroup as="ul" staggerDelay={0.07} className="flex flex-col gap-6">
          {outcomes.map((point) => (
            <StaggerItem as="li" key={point} y={12} className="flex gap-4">
              <span aria-hidden="true" className="mt-3 h-px w-8 shrink-0 bg-rosewood" />
              <Text size="lg">{point}</Text>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}

import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import type { HomepageContent } from '@/lib/payload/queries'

interface WhatYouLeaveWithProps {
  copy: HomepageContent['whatYouLeaveWith']
}

export function WhatYouLeaveWith({ copy }: WhatYouLeaveWithProps) {
  return (
    <Section tone="shell" spacing="md" grain>
      <Container width="reading">
        <Reveal y={0}>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <Heading as="h2" size="lg" className="mt-4 mb-10">
            {copy.heading}
          </Heading>
        </Reveal>

        <StaggerGroup as="ul" staggerDelay={0.07} className="flex flex-col gap-6">
          {copy.points.map((point) => (
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

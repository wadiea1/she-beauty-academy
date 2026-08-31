import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { HomepageContent } from '@/lib/payload/queries'

interface WhatYouLeaveWithProps {
  copy: HomepageContent['whatYouLeaveWith']
}

export function WhatYouLeaveWith({ copy }: WhatYouLeaveWithProps) {
  return (
    <Section tone="shell" spacing="md">
      <Container width="reading">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <Heading as="h2" size="lg" className="mt-4 mb-10">
          {copy.heading}
        </Heading>

        <ul className="flex flex-col gap-6">
          {copy.points.map((point) => (
            <li key={point} className="flex gap-4">
              <span aria-hidden="true" className="mt-3 h-px w-8 shrink-0 bg-rosewood" />
              <Text size="lg">{point}</Text>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}

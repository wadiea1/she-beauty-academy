import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Rule } from '@/components/ui/Rule'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import type { HomepageContent } from '@/lib/payload/queries'

interface WhySHEProps {
  copy: HomepageContent['whySHE']
}

export function WhySHE({ copy }: WhySHEProps) {
  return (
    <Section id="academy" tone="porcelain" spacing="md">
      <Container width="editorial">
        <Reveal y={0}>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <Heading as="h2" size="lg" className="mt-4 mb-12 max-w-xl">
            {copy.heading}
          </Heading>
        </Reveal>

        <StaggerGroup className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {copy.pillars.map((pillar) => (
            <StaggerItem key={pillar.title}>
              <Rule tone="champagne" className="mb-6 w-10" />
              <Heading as="h3" size="sm" className="mb-3">
                {pillar.title}
              </Heading>
              <Text tone="muted">{pillar.body}</Text>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}

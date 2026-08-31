import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Rule } from '@/components/ui/Rule'
import type { HomepageCopy } from '@/content/homepage'

interface WhySHEProps {
  copy: HomepageCopy['whySHE']
}

export function WhySHE({ copy }: WhySHEProps) {
  return (
    <Section id="academy" tone="porcelain" spacing="md">
      <Container width="editorial">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <Heading as="h2" size="lg" className="mt-4 mb-12 max-w-xl">
          {copy.heading}
        </Heading>

        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {copy.pillars.map((pillar) => (
            <div key={pillar.title}>
              <Rule tone="champagne" className="mb-6 w-10" />
              <Heading as="h3" size="sm" className="mb-3">
                {pillar.title}
              </Heading>
              <Text tone="muted">{pillar.body}</Text>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

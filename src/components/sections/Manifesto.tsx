import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import type { HomepageCopy } from '@/content/homepage'

interface ManifestoProps {
  copy: HomepageCopy['manifesto']
}

export function Manifesto({ copy }: ManifestoProps) {
  return (
    <Section tone="shell" spacing="md">
      <Container width="reading" className="text-center">
        <Eyebrow mark={false} className="justify-center">
          {copy.eyebrow}
        </Eyebrow>
        <Heading as="h2" size="lg" className="mt-4 mb-6">
          {copy.heading}
        </Heading>
        <Text size="lg">{copy.body}</Text>
      </Container>
    </Section>
  )
}

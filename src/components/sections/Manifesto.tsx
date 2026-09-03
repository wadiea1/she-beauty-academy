import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import type { HomepageContent } from '@/lib/payload/queries'

interface ManifestoProps {
  copy: HomepageContent['manifesto']
}

export function Manifesto({ copy }: ManifestoProps) {
  return (
    <Section tone="blush" spacing="md" grain>
      <Container width="reading" className="text-center">
        <Reveal y={0}>
          <Eyebrow mark={false} className="justify-center">
            {copy.eyebrow}
          </Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <Heading as="h2" size="lg" className="mt-4 mb-6">
            {copy.heading}
          </Heading>
        </Reveal>
        <Reveal delay={0.1} y={12}>
          <Text size="lg">{copy.body}</Text>
        </Reveal>
      </Container>
    </Section>
  )
}

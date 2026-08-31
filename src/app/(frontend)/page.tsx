import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'

export default function Home() {
  return (
    <>
      <Section tone="porcelain" spacing="md">
        <Container width="reading">
          <Text size="sm" tone="muted" className="mb-4">
            Text · typography test
          </Text>

          <Heading as="h1" size="xl" className="mb-6">
            Beauty education, elevated.
          </Heading>

          <Text size="lg" className="mb-6">
            A larger lead paragraph draws the reader in. SHE Beauty Academy is
            a considered space for women who take their craft seriously.
          </Text>

          <Text className="mb-4">
            Body text at the default base size. It uses comfortable line
            spacing for longer reading and inherits its colour naturally from
            the surrounding section.
          </Text>

          <Text size="sm" tone="muted">
            Smaller supporting copy can recede without becoming difficult to
            read.
          </Text>
        </Container>
      </Section>

      <Section tone="ink" spacing="md">
        <Container width="reading">
          <Text size="sm" className="mb-4 text-champagne">
            Text · inheritance on ink
          </Text>

          <Heading as="h2" size="lg" className="mb-6">
            Colour inheritance in action.
          </Heading>

          <Text>
            This paragraph has the default Text tone, so it adds no colour
            class of its own. It inherits porcelain directly from the ink
            Section.
          </Text>
        </Container>
      </Section>
    </>
  )
}
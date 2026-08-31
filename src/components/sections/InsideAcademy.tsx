import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ImageFrame } from '@/components/ui/ImageFrame'
import type { HomepageContent } from '@/lib/payload/queries'

interface InsideAcademyProps {
  copy: HomepageContent['insideAcademy']
}

export function InsideAcademy({ copy }: InsideAcademyProps) {
  return (
    <Section tone="porcelain" spacing="md">
      <Container width="editorial">
        <div className="max-w-xl">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <Heading as="h2" size="lg" className="mt-4 mb-6">
            {copy.heading}
          </Heading>
          <Text size="lg" tone="muted">
            {copy.body}
          </Text>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6">
          {copy.images.map((image, i) => (
            <ImageFrame
              key={image.alt}
              src={image.src}
              alt={image.alt}
              ratio={i % 2 === 0 ? 'square' : 'portrait'}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}

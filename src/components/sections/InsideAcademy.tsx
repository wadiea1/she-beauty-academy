import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import type { HomepageContent } from '@/lib/payload/queries'

interface InsideAcademyProps {
  copy: HomepageContent['insideAcademy']
}

export function InsideAcademy({ copy }: InsideAcademyProps) {
  return (
    <Section tone="porcelain" spacing="md">
      <Container width="editorial">
        <div className="max-w-xl">
          <Reveal y={0}>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <Heading as="h2" size="lg" className="mt-4 mb-6">
              {copy.heading}
            </Heading>
          </Reveal>
          <Reveal delay={0.1} y={12}>
            <Text size="lg" tone="muted">
              {copy.body}
            </Text>
          </Reveal>
        </div>

        <StaggerGroup className="mt-12 grid grid-cols-2 gap-4 sm:gap-6">
          {copy.images.map((image, i) => (
            <StaggerItem key={image.alt}>
              <ImageFrame src={image.src} alt={image.alt} motifSeed={i} elevation="e1" ratio={i % 2 === 0 ? "square" : "portrait"} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}

import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import type { ImageRef } from '@/lib/payload/queries'

interface CourseGalleryProps {
  images: ImageRef[]
  heading: string
  tone: 'porcelain' | 'shell'
}

/** Renders nothing when the gallery array is empty — true for every
 * real course today, since no photography has been uploaded yet. No
 * stock imagery or placeholder tiles are added to fill the grid. */
export function CourseGallery({ images, heading, tone }: CourseGalleryProps) {
  if (images.length === 0) return null

  return (
    <Section tone={tone} spacing="md">
      <Container width="editorial">
        <Reveal y={0}>
          <Heading as="h2" size="lg" className="mb-10">
            {heading}
          </Heading>
        </Reveal>

        <StaggerGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {images.map((image, i) => (
            <StaggerItem key={`${image.alt}-${i}`}>
              <ImageFrame src={image.src} alt={image.alt} motifSeed={i} elevation="e1" ratio={i % 3 === 1 ? "portrait" : "square"} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}

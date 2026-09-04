import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/motion/Reveal'
import type { HomepageContent } from '@/lib/payload/queries'

interface InstructorCredibilityProps {
  copy: HomepageContent['instructor']
}

/**
 * Replaces the graduate testimonials we don't have yet (SHE is too new
 * for legitimate ones) with the instructor's actual, verifiable prior
 * experience — see AGENTS.md §11: that track record belongs to her, not
 * to SHE itself, and the copy in Payload's Homepage global (seeded from
 * src/seed/) is written to keep that distinction explicit.
 */
export function InstructorCredibility({ copy }: InstructorCredibilityProps) {
  return (
    <Section tone="porcelain" spacing="md">
      <Container width="editorial">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <ImageFrame ratio="portrait" src={copy.image.src} alt={copy.image.alt} motif="contour" elevation="e2" className="max-w-sm" />
          </div>

          <div className="lg:col-span-7">
            <Reveal y={0}>
              <Eyebrow>{copy.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <Heading as="h2" size="lg" className="mt-4 mb-2 max-w-lg">
                {copy.heading}
              </Heading>
            </Reveal>
            <Reveal delay={0.1}>
              <Text size="sm" tone="muted" className="mb-6 font-medium">
                {copy.role}
              </Text>
            </Reveal>
            <Reveal delay={0.15} y={12}>
              <div className="flex flex-col gap-4">
                {copy.bio.map((paragraph) => (
                  <Text key={paragraph} size="lg">
                    {paragraph}
                  </Text>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  )
}

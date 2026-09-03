import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/motion/Parallax'
import type { HomepageContent } from '@/lib/payload/queries'

interface InsideAcademyProps {
  copy: HomepageContent['insideAcademy']
}

/**
 * The studio mosaic — the section carrying the most real photography
 * once it exists, so it earns the most compositional attention.
 *
 * Was an even 2-column grid of equal tiles, which reads as a contact
 * sheet rather than as art direction. Now an asymmetric editorial
 * arrangement: a tall lead image spanning both rows on the inline-start
 * side, with the remaining tiles stacked beside it and offset
 * vertically. Each tile drifts at a slightly different parallax rate, so
 * the group moves as separate planes rather than as one block.
 *
 * Layout is intentionally driven by index rather than by a fixed number
 * of images: the CMS array is editor-controlled and may hold any count.
 * The first image leads; everything after it fills the stack.
 */
export function InsideAcademy({ copy }: InsideAcademyProps) {
  const [lead, ...rest] = copy.images

  return (
    <Section tone="porcelain" spacing="md" className="overflow-x-clip">
      <Container width="editorial">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-5">
            <Reveal y={0}>
              <Eyebrow>{copy.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <Heading as="h2" size="lg" className="mt-4 mb-6">
                {copy.heading}
              </Heading>
            </Reveal>
            <Reveal delay={0.1} y={12}>
              <Text size="lg" tone="muted" className="max-w-md">
                {copy.body}
              </Text>
            </Reveal>
          </div>

          {lead && (
            <div className="lg:col-span-7">
              <Parallax speed={-18}>
                <ImageFrame
                  src={lead.src}
                  alt={lead.alt}
                  ratio="landscape"
                  motifSeed={0}
                  elevation="e2"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
              </Parallax>
            </div>
          )}
        </div>

        {rest.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
            {rest.map((image, i) => (
              <Parallax
                key={image.alt}
                speed={i % 2 === 0 ? 26 : -12}
                // Every second tile is nudged down, so the row reads as a
                // composed arrangement rather than a strip of equals.
                className={i % 2 === 1 ? 'lg:mt-12' : undefined}
              >
                <ImageFrame
                  src={image.src}
                  alt={image.alt}
                  ratio={i % 2 === 0 ? 'portrait' : 'square'}
                  motifSeed={i + 1}
                  elevation="e1"
                  sizes="(min-width: 1024px) 30vw, 50vw"
                />
              </Parallax>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}

import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { ImageFrame } from '@/components/ui/ImageFrame'
import type { HomepageContent } from '@/lib/payload/queries'

interface HeroProps {
  copy: HomepageContent['hero']
  /** "Book a Consultation" — interface vocabulary (src/i18n dictionaries),
   * not CMS content: the same label is reused verbatim as the site's one
   * recurring CTA action, not per-section editorial copy. */
  ctaLabel: string
}

/**
 * Editorial asymmetry rather than centered-text-plus-stock-photo: the copy
 * carries the section (7/12 on large screens), with a supporting portrait
 * frame rather than a dominant image — so the hero still reads strongly
 * before real photography exists.
 */
export function Hero({ copy, ctaLabel }: HeroProps) {
  return (
    <Section tone="porcelain" spacing="lg">
      <Container width="editorial">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <Heading as="h1" size="display" className="mt-6 max-w-2xl">
              {copy.heading}
            </Heading>
            <Text size="lg" className="mt-6 max-w-lg">
              {copy.lead}
            </Text>
            <Button href="#apply" size="lg" className="mt-8">
              {ctaLabel}
            </Button>
          </div>

          <div className="lg:col-span-5">
            <ImageFrame
              ratio="portrait"
              src={copy.image.src}
              alt={copy.image.alt}
              priority
              className="max-w-sm lg:ms-auto"
            />
          </div>
        </div>
      </Container>
    </Section>
  )
}

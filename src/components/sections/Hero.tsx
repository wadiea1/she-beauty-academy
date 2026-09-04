import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { HeroArt } from '@/components/sections/HeroArt'
import type { HomepageContent } from '@/lib/payload/queries'

interface HeroProps {
  copy: HomepageContent['hero']
  /** "Book a Consultation" — interface vocabulary (src/i18n dictionaries),
   * not CMS content: the same label is reused verbatim as the site's one
   * recurring CTA action, not per-section editorial copy. */
  ctaLabel: string
  secondaryCtaLabel: string
}

/**
 * Editorial asymmetry, now with real depth.
 *
 * The previous hero placed copy at 7/12 against a small portrait and
 * left roughly half the viewport empty at 1440px — sparse rather than
 * confident, and on mobile the placeholder dominated the fold. This
 * version tightens the copy column to 6/12 so the line length actually
 * suits display type, and gives the remaining space to a layered
 * three-plane composition (see HeroArt).
 *
 * `overflow-x-clip` rather than `overflow-hidden`: the composition
 * deliberately bleeds past the container, and `overflow-hidden` on the
 * block axis would also clip the parallax travel at the section's top
 * and bottom edges. `clip` on one axis leaves the other visible.
 */
export function Hero({ copy, ctaLabel, secondaryCtaLabel }: HeroProps) {
  return (
    <Section tone="porcelain" spacing="hero" glow grain className="overflow-x-clip">
      <Container width="editorial">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <Reveal delay={0}>
              <Eyebrow>{copy.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <Heading as="h1" size="display" className="mt-6">
                {copy.heading}
              </Heading>
            </Reveal>
            <Reveal delay={0.2}>
              <Text size="lg" className="mt-6 max-w-md">
                {copy.lead}
              </Text>
            </Reveal>
            <Reveal delay={0.3}>
              {/* Two tiers, not two equal buttons: one filled primary
                * plus a quiet outlined secondary. `flex-wrap` with
                * `w-full sm:w-auto` keeps them stacked and full-width at
                * 320px, where side-by-side buttons would each be too
                * narrow to read comfortably. */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button href="#apply" size="lg" className="w-full sm:w-auto">
                  {ctaLabel}
                </Button>
                <Button href="#courses" variant="secondary" size="lg" className="w-full sm:w-auto">
                  {secondaryCtaLabel}
                </Button>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <div className="mx-auto max-w-[17rem] sm:max-w-xs lg:me-0 lg:ms-auto lg:max-w-[22rem] lg:ps-8">
              <HeroArt src={copy.image.src} alt={copy.image.alt} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

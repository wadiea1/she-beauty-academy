import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { whatsappHref } from '@/lib/links'

interface ApplyCTAProps {
  copy: { eyebrow: string; heading: string; body: string }
  ctaLabel: string
  whatsappLabel: string
  whatsappNumber: string | null
}

/** Reused as-is on course detail pages (Milestone H) — `copy` only
 * needs to structurally match `{ eyebrow, heading, body }`, so a
 * course page can pass its own contextual text without this component
 * knowing anything about Payload's Course type. */
export function ApplyCTA({ copy, ctaLabel, whatsappLabel, whatsappNumber }: ApplyCTAProps) {
  const whatsapp = whatsappHref(whatsappNumber)

  return (
    <Section id="apply" tone="ink" spacing="lg">
      <Container width="reading" className="text-center">
        <Reveal y={0}>
          <Eyebrow mark={false} className="justify-center text-champagne">
            {copy.eyebrow}
          </Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <Heading as="h2" size="xl" className="mt-4 mb-6">
            {copy.heading}
          </Heading>
        </Reveal>
        <Reveal delay={0.1} y={12}>
          <Text size="lg" className="mx-auto mb-10 max-w-md text-blush">
            {copy.body}
          </Text>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {/* A same-page anchor, not a locale-prefixed path — this
             * component is reused on course pages (Milestone H) too, and
             * a `/${locale}#apply` href would navigate *away* to the
             * homepage from anywhere else instead of staying put. There's
             * no real application flow yet (Milestone I) — this is an
             * honest placeholder, not a fabricated one. */}
            <Button href="#apply" variant="inverse" size="lg">
              {ctaLabel}
            </Button>
            {whatsapp && (
              <Button
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline-inverse"
                size="lg"
              >
                {whatsappLabel}
              </Button>
            )}
          </div>
        </Reveal>
      </Container>
    </Section>
  )
}

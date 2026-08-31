import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/motion/Reveal'
import { whatsappHref } from '@/lib/links'
import type { HomepageContent } from '@/lib/payload/queries'
import type { Locale } from '@/i18n/config'

interface ApplyCTAProps {
  copy: HomepageContent['apply']
  ctaLabel: string
  whatsappLabel: string
  whatsappNumber: string | null
  locale: Locale
}

export function ApplyCTA({ copy, ctaLabel, whatsappLabel, whatsappNumber, locale }: ApplyCTAProps) {
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
            <Button href={`/${locale}#apply`} variant="inverse" size="lg">
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

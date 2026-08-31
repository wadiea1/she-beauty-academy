import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { whatsappHref } from '@/config/site'
import type { HomepageCopy } from '@/content/homepage'
import type { Locale } from '@/i18n/config'

interface ApplyCTAProps {
  copy: HomepageCopy['apply']
  whatsappLabel: string
  locale: Locale
}

export function ApplyCTA({ copy, whatsappLabel, locale }: ApplyCTAProps) {
  const whatsapp = whatsappHref()

  return (
    <Section id="apply" tone="ink" spacing="lg">
      <Container width="reading" className="text-center">
        <Eyebrow mark={false} className="justify-center text-champagne">
          {copy.eyebrow}
        </Eyebrow>
        <Heading as="h2" size="xl" className="mt-4 mb-6">
          {copy.heading}
        </Heading>
        <Text size="lg" className="mx-auto mb-10 max-w-md text-blush">
          {copy.body}
        </Text>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button href={`/${locale}#apply`} variant="inverse" size="lg">
            {copy.cta}
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
      </Container>
    </Section>
  )
}

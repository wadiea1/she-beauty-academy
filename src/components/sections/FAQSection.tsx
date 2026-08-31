import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Rule } from '@/components/ui/Rule'
import type { FaqContent, HomepageContent } from '@/lib/payload/queries'

interface FAQSectionProps {
  copy: HomepageContent['faqIntro']
  items: FaqContent[]
}

/** Native <details>/<summary> — a fully accessible, keyboard-operable
 * accordion with zero client JS. */
export function FAQSection({ copy, items }: FAQSectionProps) {
  return (
    <Section id="faq" tone="shell" spacing="md">
      <Container width="reading">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <Heading as="h2" size="lg" className="mt-4 mb-10">
          {copy.heading}
        </Heading>

        <div>
          {items.map((item, i) => (
            <div key={item.question}>
              {i > 0 && <Rule tone="champagne" className="opacity-60" />}
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body text-lg text-ink [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-2xl font-light text-rosewood-ink transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <Text tone="muted" className="mt-4 max-w-lg">
                  {item.answer}
                </Text>
              </details>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}

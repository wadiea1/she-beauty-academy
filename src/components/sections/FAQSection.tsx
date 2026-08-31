import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Rule } from '@/components/ui/Rule'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import type { FaqContent, HomepageContent } from '@/lib/payload/queries'

interface FAQSectionProps {
  copy: HomepageContent['faqIntro']
  items: FaqContent[]
}

/** Native <details>/<summary> — a fully accessible, keyboard-operable
 * accordion with zero client JS. The entrance reveal only touches each
 * row's arrival on scroll; open/close stays the browser's native,
 * instant behavior — deliberately not animated (a robust height
 * transition for <details> isn't worth the complexity/accessibility
 * risk for an optional flourish). */
export function FAQSection({ copy, items }: FAQSectionProps) {
  return (
    <Section id="faq" tone="shell" spacing="md">
      <Container width="reading">
        <Reveal y={0}>
          <Eyebrow>{copy.eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <Heading as="h2" size="lg" className="mt-4 mb-10">
            {copy.heading}
          </Heading>
        </Reveal>

        <StaggerGroup staggerDelay={0.06}>
          {items.map((item, i) => (
            <StaggerItem key={item.question} y={12}>
              {i > 0 && <Rule tone="champagne" className="opacity-60" />}
              <details className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-body text-lg text-ink transition-colors duration-200 hover:text-rosewood-ink [&::-webkit-details-marker]:hidden">
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
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}

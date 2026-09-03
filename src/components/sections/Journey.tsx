import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { JourneyPath } from '@/components/motion/JourneyPath'
import { StepArrow } from '@/components/ui/StepArrow'
import type { Dictionary } from '@/i18n/dictionaries/types'

interface JourneyProps {
  copy: Dictionary['journey']
}

/**
 * The customer path, told visually rather than as another paragraph.
 *
 * This section exists to break the page's one repeated rhythm — eyebrow,
 * heading, paragraph, grid, nine times over — and to answer "what
 * actually happens if I fill this in?", which the site never showed.
 *
 * Composition rather than boxes: a scroll-drawn curve threads the steps
 * together, numerals sit in the display face as folio marks, and
 * hairline chevrons carry the direction of travel. No cards, no borders.
 *
 * The curve runs horizontally from `md` and vertically below it, because
 * five steps side by side at 390px would be unreadable. Both orientations
 * are rendered and toggled with `hidden`/`md:block` rather than measured
 * in JS — a viewport check would need an effect, would flash the wrong
 * one on first paint, and would not survive SSR.
 *
 * The copy is deliberately truthful about what this flow is NOT: step 3
 * says no payment and no commitment, step 5 says enrolment is arranged
 * in person. There is no online payment and no automated enrolment.
 */
export function Journey({ copy }: JourneyProps) {
  return (
    <Section id="journey" tone="porcelain" spacing="md" className="overflow-x-clip">
      <Container width="editorial">
        <div className="max-w-xl">
          <Reveal y={0}>
            <Eyebrow>{copy.eyebrow}</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <Heading as="h2" size="lg" className="mt-4">
              {copy.heading}
            </Heading>
          </Reveal>
        </div>

        {/* ---- md and up: horizontal flow ---- */}
        <div className="relative mt-20 hidden md:block">
          {/* The curve sits behind the steps and spans only the band
            * between the numerals, so it reads as connecting them rather
            * than as a rule under the whole section. */}
          <div className="absolute inset-x-0 top-4 h-24">
            <JourneyPath orientation="horizontal" />
          </div>

          <StaggerGroup as="ol" staggerDelay={0.09} className="relative grid grid-cols-5 gap-6">
            {copy.steps.map((step, i) => (
              <StaggerItem as="li" key={step.title} className="relative flex flex-col items-center text-center">
                {/* The numeral needs an opaque disc behind it so the
                  * curve passes behind rather than through it. */}
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-champagne/60 bg-porcelain font-display text-xl leading-none text-rosewood-ink shadow-[var(--shadow-rim),var(--shadow-e1)]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                {i < copy.steps.length - 1 && (
                  <StepArrow className="absolute top-4 -end-3 hidden lg:block" />
                )}

                <Heading as="h3" size="sm" className="mt-8">
                  {step.title}
                </Heading>
                <Text size="sm" tone="muted" className="mt-3 max-w-[22ch]">
                  {step.body}
                </Text>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>

        {/* ---- below md: vertical flow ---- */}
        <div className="relative mt-14 md:hidden">
          <div className="absolute inset-y-0 start-0 w-14">
            <JourneyPath orientation="vertical" />
          </div>

          <StaggerGroup as="ol" staggerDelay={0.09} className="relative flex flex-col gap-10">
            {copy.steps.map((step, i) => (
              <StaggerItem as="li" key={step.title} className="flex gap-5">
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne/60 bg-porcelain font-display text-base leading-none text-rosewood-ink shadow-[var(--shadow-rim),var(--shadow-e1)]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="pt-1">
                  <Heading as="h3" size="sm">
                    {step.title}
                  </Heading>
                  <Text size="sm" tone="muted" className="mt-2">
                    {step.body}
                  </Text>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </Container>
    </Section>
  )
}

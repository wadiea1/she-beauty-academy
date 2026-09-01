import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Rule } from '@/components/ui/Rule'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { formatCoursePrice } from '@/lib/coursePricing'
import type { CourseDetail } from '@/lib/payload/queries'

interface CoursePracticalInfoProps {
  duration: string | null
  scheduleInfo: string | null
  pricing: CourseDetail['pricing']
  heading: string
  durationLabel: string
  scheduleLabel: string
  priceLabel: string
  certificationLabel: string
  certificationText: string
  pricingOnRequest: string
  pricingStartingFrom: string
  tone: 'porcelain' | 'shell'
}

/**
 * Duration, schedule, and pricing are each independently optional and
 * omitted when unset — no "Duration: —" placeholder rows. Certification
 * always renders: it's the one approved, universal claim, true for
 * every course regardless of what's been entered in Payload yet, so
 * this block is never left with nothing to say.
 */
export function CoursePracticalInfo({
  duration,
  scheduleInfo,
  pricing,
  heading,
  durationLabel,
  scheduleLabel,
  priceLabel,
  certificationLabel,
  certificationText,
  pricingOnRequest,
  pricingStartingFrom,
  tone,
}: CoursePracticalInfoProps) {
  const formattedPrice = formatCoursePrice(pricing, pricingStartingFrom)
  const priceValue = formattedPrice ?? (pricing.type === 'onRequest' ? pricingOnRequest : null)
  const showPriceRow = pricing.type !== 'hidden' && priceValue !== null

  const rows: { label: string; value: string }[] = [
    ...(duration ? [{ label: durationLabel, value: duration }] : []),
    ...(scheduleInfo ? [{ label: scheduleLabel, value: scheduleInfo }] : []),
    ...(showPriceRow && priceValue ? [{ label: priceLabel, value: priceValue }] : []),
    { label: certificationLabel, value: certificationText },
  ]

  return (
    <Section tone={tone} spacing="md">
      <Container width="reading">
        <Reveal y={0}>
          <Heading as="h2" size="lg" className="mb-10">
            {heading}
          </Heading>
        </Reveal>

        <StaggerGroup as="ul" staggerDelay={0.06} className="flex flex-col">
          {rows.map((row, i) => (
            <StaggerItem as="li" key={row.label} y={12}>
              {i > 0 && <Rule tone="champagne" className="opacity-60" />}
              <div className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <Text size="sm" tone="muted" className="font-medium">
                  {row.label}
                </Text>
                <Text size="lg" className="sm:text-end">
                  {row.value}
                </Text>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}

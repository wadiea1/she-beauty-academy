import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Rule } from '@/components/ui/Rule'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { formatCoursePrice, courseHasPriceRow } from '@/lib/coursePricing'
import type { CourseDetail } from '@/lib/payload/queries'

interface CoursePracticalInfoProps {
  duration: string | null
  scheduleInfo: string | null
  pricing: CourseDetail['pricing']
  /** A fact about the course, decided per-course in Payload — not
   * inferred from the existence of approved wording. 'none' (the
   * default, and what every current course has) hides the row
   * entirely; only an explicit 'professionalDiploma' shows it. */
  certificationType: CourseDetail['certificationType']
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
 * Duration, schedule, pricing, and certification are each independently
 * optional and omitted when unset/'none' — no "Duration: —" rows, no
 * certification claim without a confirmed certificationType. Renders
 * nothing at all if every row would be empty (possible once pricing
 * can be 'hidden' with no duration/schedule/certification set either —
 * not the case for any of the 3 real courses today, all 'onRequest',
 * but the section must still degrade gracefully rather than show a
 * bare heading).
 */
export function CoursePracticalInfo({
  duration,
  scheduleInfo,
  pricing,
  certificationType,
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
  const showPriceRow = courseHasPriceRow(pricing)
  const showCertificationRow = certificationType === 'professionalDiploma'

  const rows: { label: string; value: string }[] = [
    ...(duration ? [{ label: durationLabel, value: duration }] : []),
    ...(scheduleInfo ? [{ label: scheduleLabel, value: scheduleInfo }] : []),
    ...(showPriceRow && priceValue ? [{ label: priceLabel, value: priceValue }] : []),
    ...(showCertificationRow ? [{ label: certificationLabel, value: certificationText }] : []),
  ]

  if (rows.length === 0) return null

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

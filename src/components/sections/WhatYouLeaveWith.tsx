import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { PlaceholderArt } from '@/components/ui/PlaceholderArt'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/motion/Parallax'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import type { HomepageContent } from '@/lib/payload/queries'

interface WhatYouLeaveWithProps {
  copy: HomepageContent['whatYouLeaveWith']
}

/**
 * Asymmetric: the list holds the inline-start column while a decorative
 * plate anchors the other, breaking a run of full-width centred blocks.
 *
 * The plate is line-art and `aria-hidden`, NOT an image slot. There is
 * no Payload field behind this section, and an empty slot here would
 * imply a photograph is missing rather than that none was ever intended
 * — the same call made for the hero's foreground plate.
 *
 * Each point keeps its hairline lead-in rule, which does the work a
 * bullet would without importing list-marker styling that behaves
 * differently across the three scripts.
 */
export function WhatYouLeaveWith({ copy }: WhatYouLeaveWithProps) {
  return (
    <Section tone="shell" spacing="md" grain className="overflow-x-clip">
      <Container width="editorial">
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal y={0}>
              <Eyebrow>{copy.eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={0.05}>
              <Heading as="h2" size="lg" className="mt-4 mb-10 max-w-lg">
                {copy.heading}
              </Heading>
            </Reveal>

            <StaggerGroup as="ul" staggerDelay={0.07} className="flex flex-col gap-6">
              {copy.points.map((point) => (
                <StaggerItem as="li" key={point} y={12} className="flex gap-4">
                  <span aria-hidden="true" className="mt-3 h-px w-8 shrink-0 bg-rosewood" />
                  <Text size="lg">{point}</Text>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>

          <div className="lg:col-span-5">
            <Parallax speed={-24} className="mx-auto max-w-xs lg:ms-auto lg:me-0">
              <div
                aria-hidden="true"
                className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-frame)] bg-[image:var(--gradient-blush)] shadow-[var(--shadow-rim),var(--shadow-e3)]"
              >
                <div className="absolute inset-0 bg-[image:var(--gradient-veil)]" />
                <PlaceholderArt motif="bloom" />
                <div className="grain absolute inset-0" />
              </div>
            </Parallax>
          </div>
        </div>
      </Container>
    </Section>
  )
}

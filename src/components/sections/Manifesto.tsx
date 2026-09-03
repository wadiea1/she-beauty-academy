import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import { Parallax } from '@/components/motion/Parallax'
import type { HomepageContent } from '@/lib/payload/queries'

interface ManifestoProps {
  copy: HomepageContent['manifesto']
}

/**
 * The philosophy statement, set as an editorial pull quote.
 *
 * Was centred reading-width text — correct but anonymous, and the third
 * of three consecutive centred text blocks. Offsetting it and hanging a
 * champagne rule off the inline-start edge gives the page a different
 * shape at this point without adding another card.
 *
 * The rule is a bare bordered element rather than a quotation glyph on
 * purpose: `"` and `«` sit and mirror differently across Arabic, Hebrew
 * and Latin, and a decorative mark that has to be right in three scripts
 * is a liability for no gain.
 */
export function Manifesto({ copy }: ManifestoProps) {
  return (
    <Section tone="blush" spacing="md" grain className="overflow-x-clip">
      <Container width="editorial">
        <div className="relative grid gap-10 lg:grid-cols-12">
          {/* Drifting outline ring, echoing the hero's furthest plane so
            * the two sections read as one visual system. */}
          <Parallax speed={44} className="pointer-events-none absolute -top-24 -end-16 hidden lg:block">
            <div aria-hidden="true" className="h-64 w-64 rounded-full border border-porcelain/60" />
          </Parallax>

          <div className="lg:col-span-3">
            <Reveal y={0}>
              <Eyebrow>{copy.eyebrow}</Eyebrow>
            </Reveal>
          </div>

          <div className="relative lg:col-span-9">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 start-0 hidden w-px bg-rosewood/30 lg:block"
            />
            <div className="lg:ps-10">
              <Reveal delay={0.05}>
                <Heading as="h2" size="xl" className="text-balance">
                  {copy.heading}
                </Heading>
              </Reveal>
              <Reveal delay={0.12} y={12}>
                <Text size="lg" className="mt-8 max-w-2xl">
                  {copy.body}
                </Text>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}

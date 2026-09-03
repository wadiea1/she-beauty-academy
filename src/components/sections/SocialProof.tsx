import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Reveal } from '@/components/motion/Reveal'
import { StaggerGroup } from '@/components/motion/StaggerGroup'
import { StaggerItem } from '@/components/motion/StaggerItem'
import { instagramHref } from '@/lib/links'

interface SocialProofProps {
  eyebrow: string
  heading: string
  instagramHandle: string | null
  brandName: string
}

/** Renders nothing until Payload's Site Settings global has a real
 * Instagram handle — no "coming soon" placeholder ships to real
 * visitors; this stays inert plumbing until there's a real account to
 * link. */
export function SocialProof({ eyebrow, heading, instagramHandle, brandName }: SocialProofProps) {
  const href = instagramHref(instagramHandle)
  if (!href) return null

  return (
    <Section tone="shell" spacing="md">
      <Container width="editorial">
        <Reveal y={0}>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
            <Heading as="h2" size="lg" className="transition-colors hover:text-rosewood-ink">
              {heading}
            </Heading>
          </a>
        </Reveal>
        <StaggerGroup className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <StaggerItem key={i}>
              <ImageFrame ratio="square" alt={`${brandName} on Instagram`} motifSeed={i} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  )
}

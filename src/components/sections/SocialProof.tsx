import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { instagramHref, siteConfig } from '@/config/site'

interface SocialProofProps {
  eyebrow: string
  heading: string
}

/** Renders nothing until `siteConfig.instagramHandle` is set (see
 * src/config/site.ts) — no "coming soon" placeholder ships to real
 * visitors; this stays inert plumbing until there's a real account to
 * link. */
export function SocialProof({ eyebrow, heading }: SocialProofProps) {
  const href = instagramHref()
  if (!href) return null

  return (
    <Section tone="shell" spacing="md">
      <Container width="editorial">
        <Eyebrow>{eyebrow}</Eyebrow>
        <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
          <Heading as="h2" size="lg" className="transition-colors hover:text-rosewood-ink">
            {heading}
          </Heading>
        </a>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ImageFrame key={i} ratio="square" alt={`${siteConfig.name} on Instagram`} />
          ))}
        </div>
      </Container>
    </Section>
  )
}

import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ImageFrame } from '@/components/ui/ImageFrame'
import { Surface } from '@/components/ui/Surface'

interface CourseCardProps {
  index: number
  title: string
  description: string
  href: string
  ctaLabel: string
}

export function CourseCard({ index, title, description, href, ctaLabel }: CourseCardProps) {
  return (
    <Surface
      as="article"
      elevation="e1"
      radius="card"
      rim
      interactive
      className="group flex h-full flex-col overflow-hidden border border-champagne/50 bg-porcelain"
    >
      <ImageFrame ratio="landscape" alt={title} />

      <div className="flex flex-1 flex-col gap-3 p-6">
        {/* The index sits in the display face now. Bodoni and Amiri both
          * draw genuinely beautiful numerals, and at this size the
          * figure reads as an editorial folio mark rather than as UI
          * metadata — a small change that does a lot of the work of
          * making the card feel composed rather than generated. */}
        <span className="font-display text-lg leading-none text-champagne" aria-hidden="true">
          {String(index).padStart(2, '0')}
        </span>
        <Heading as="h3" size="sm">
          {title}
        </Heading>
        <Text tone="muted" className="flex-1">
          {description}
        </Text>
        <Button href={href} variant="ghost" size="sm" className="mt-2 self-start">
          {ctaLabel}
        </Button>
      </div>
    </Surface>
  )
}

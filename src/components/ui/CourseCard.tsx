import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { ImageFrame } from '@/components/ui/ImageFrame'

interface CourseCardProps {
  index: number
  title: string
  description: string
  href: string
  ctaLabel: string
}

export function CourseCard({ index, title, description, href, ctaLabel }: CourseCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-panel)] border border-champagne/60 bg-porcelain transition-shadow duration-300 hover:shadow-[0_24px_48px_-28px_rgba(36,27,22,0.28)]">
      <ImageFrame ratio="landscape" alt={title} />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <Text size="sm" tone="muted" className="font-medium">
          {String(index).padStart(2, '0')}
        </Text>
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
    </article>
  )
}

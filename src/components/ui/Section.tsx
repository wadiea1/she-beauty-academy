import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type As = 'section' | 'article' | 'div' | 'aside' | 'footer'
type Tone = 'porcelain' | 'shell' | 'ink' | 'transparent'
type Spacing = 'sm' | 'md' | 'lg'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: As
  tone?: Tone
  spacing?: Spacing
}

const toneClass: Record<Tone, string> = {
  porcelain: 'bg-porcelain text-cocoa',
  shell: 'bg-shell text-cocoa',
  ink: 'bg-ink text-porcelain',
  transparent: '',
}

const spacingClass: Record<Spacing, string> = {
  sm: 'py-[var(--spacing-section-sm)]',
  md: 'py-[var(--spacing-section)]',
  lg: 'py-[var(--spacing-section-lg)]',
}

export function Section({
  as: Tag = 'section',
  tone = 'transparent',
  spacing = 'md',
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <Tag
      className={cn(
        toneClass[tone],
        spacingClass[spacing],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type Orientation = 'horizontal' | 'vertical'
type Tone = 'champagne' | 'blush' | 'porcelain'

interface RuleProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  tone?: Tone
  /** Decorative rules (the default) are hidden from assistive tech. Set to
   * `false` for a rule that actually separates distinct sections of content. */
  decorative?: boolean
}

const toneClass: Record<Tone, string> = {
  champagne: 'bg-champagne',
  blush: 'bg-blush',
  porcelain: 'bg-porcelain/40',
}

export function Rule({
  orientation = 'horizontal',
  tone = 'champagne',
  decorative = true,
  className,
  ...rest
}: RuleProps) {
  return (
    <div
      role={decorative ? undefined : 'separator'}
      aria-hidden={decorative ? true : undefined}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        toneClass[tone],
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...rest}
    />
  )
}

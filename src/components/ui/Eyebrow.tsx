import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type As = 'p' | 'div' | 'span'

interface EyebrowProps extends HTMLAttributes<HTMLElement> {
  as?: As
  /**
   * Short champagne mark preceding the label. A quiet nod to the brand's
   * continuous-line mark — never animated here, just a still accent.
   */
  mark?: boolean
}

/**
 * A small kicker label above a heading (e.g. "OUR PHILOSOPHY").
 *
 * Deliberately has no text-transform/letter-spacing baked in: Arabic and
 * Hebrew have no concept of uppercase casing, and tracking damages
 * connected Arabic script. Distinction comes from color, size, and the
 * optional leading mark instead.
 */
export function Eyebrow({
  as: Tag = 'p',
  mark = true,
  className,
  children,
  ...rest
}: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'flex items-center gap-3 font-body text-sm font-medium text-rosewood-ink',
        className,
      )}
      {...rest}
    >
      {mark && <span aria-hidden="true" className="h-px w-6 shrink-0 bg-champagne" />}
      {children}
    </Tag>
  )
}

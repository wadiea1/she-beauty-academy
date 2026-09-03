import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type As = 'section' | 'article' | 'div' | 'aside' | 'footer'
type Tone = 'porcelain' | 'shell' | 'ink' | 'blush' | 'transparent'
type Spacing = 'sm' | 'md' | 'lg'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: As
  tone?: Tone
  spacing?: Spacing
  /** Soft champagne bloom from the top edge. Reads as light falling
   * into the section rather than as a coloured band. */
  glow?: boolean
  /** Film grain over the section's own background. */
  grain?: boolean
}

const toneClass: Record<Tone, string> = {
  porcelain: 'bg-porcelain text-cocoa',
  shell: 'bg-shell text-cocoa',
  ink: 'bg-ink text-porcelain',
  // A material rather than a flat fill — shell through blush into
  // champagne, on a diagonal so it never reads as a horizontal band.
  blush: 'bg-[image:var(--gradient-blush)] text-cocoa',
  transparent: '',
}

const spacingClass: Record<Spacing, string> = {
  sm: 'py-[var(--spacing-section-sm)]',
  md: 'py-[var(--spacing-section)]',
  lg: 'py-[var(--spacing-section-lg)]',
}

/**
 * Sections previously alternated two flat fills, which is why the page
 * read as one plane no matter what sat on it. `glow` and `grain` add
 * depth to the *ground* so raised elements have something to be raised
 * from — layering only works if the background is a surface too.
 *
 * Both are opt-in. A blend mode or a stacking context on every section
 * would create containing blocks the sticky header and fixed drawer
 * would then resolve against, which is a real bug rather than a
 * theoretical one (see Navigation.tsx's note on backdrop-filter).
 */
export function Section({
  as: Tag = 'section',
  tone = 'transparent',
  spacing = 'md',
  glow = false,
  grain = false,
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <Tag
      className={cn(
        toneClass[tone],
        spacingClass[spacing],
        (glow || grain) && 'relative',
        grain && 'grain',
        className,
      )}
      {...rest}
    >
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[45vh] bg-[image:var(--gradient-glow)]"
        />
      )}
      {children}
    </Tag>
  )
}

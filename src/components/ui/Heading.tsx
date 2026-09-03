import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type As = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type Size = 'display' | 'xl' | 'lg' | 'md' | 'sm'

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: As
  size?: Size
}

/**
 * Sizes and leading both come from CSS custom properties rather than
 * literal values, because the right numbers differ per script and this
 * component renders all three.
 *
 * Arabic headings in Amiri need ~1.36 leading for harakat clearance
 * where Latin in Bodoni wants 1.08, and Arabic needs a small optical
 * size bump on top. Hardcoding one set here — as this previously did
 * with `leading-[1.1]` — meant Arabic silently inherited Latin metrics
 * and its diacritics collided. All of that tuning now lives in the
 * `:lang()` blocks in globals.css, so this component stays
 * script-agnostic and no call site has to know which locale it is in.
 */
const sizeClass: Record<Size, string> = {
  display: 'text-[length:var(--heading-display-size)] leading-[var(--heading-display-leading)]',
  xl: 'text-[length:var(--heading-xl-size)] leading-[var(--heading-xl-leading)]',
  lg: 'text-[length:var(--heading-lg-size)] leading-[var(--heading-lg-leading)]',
  md: 'text-[length:var(--heading-md-size)] leading-[var(--heading-md-leading)]',
  sm: 'text-[length:var(--heading-sm-size)] leading-[var(--heading-sm-leading)]',
}

export function Heading({
  as: Tag = 'h2',
  size = 'md',
  className,
  children,
  ...rest
}: HeadingProps) {
  return (
    <Tag
      className={cn(
        // No tracking anywhere, in any script. Arabic is a connected
        // script — letter-spacing literally breaks the joins between
        // letters — and Hebrew gains nothing from it either.
        'font-display font-normal text-balance',
        sizeClass[size],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

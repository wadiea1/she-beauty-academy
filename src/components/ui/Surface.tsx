import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

type Elevation = 'flat' | 'e1' | 'e2' | 'e3' | 'e4'
type Radius = 'panel' | 'card' | 'frame' | 'none'
type Sheen = 'none' | 'surface' | 'veil'

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'article' | 'section' | 'aside' | 'li'
  elevation?: Elevation
  radius?: Radius
  /** Hairline top-edge highlight — the "lit from above" half of the
   * depth illusion. Only meaningful on a light surface. */
  rim?: boolean
  sheen?: Sheen
  /** Raises to the next elevation on hover. Pure CSS, so this works
   * inside Server Components and needs no client boundary. */
  interactive?: boolean
  grain?: boolean
}

const elevationClass: Record<Elevation, string> = {
  flat: '',
  e1: 'shadow-[var(--shadow-e1)]',
  e2: 'shadow-[var(--shadow-e2)]',
  e3: 'shadow-[var(--shadow-e3)]',
  e4: 'shadow-[var(--shadow-e4)]',
}

/**
 * The rim is an `inset` shadow, so it cannot be a second class — CSS
 * takes one `box-shadow` list per element and the later declaration
 * would replace the elevation rather than add to it. These are the
 * merged pairs.
 *
 * Written out literally rather than interpolated. Tailwind extracts
 * class names by scanning source text, so a template literal like
 * `shadow-[var(--shadow-${elevation})]` is invisible to it and the
 * utility is simply never generated — the class lands in the DOM and
 * does nothing.
 */
const rimElevationClass: Record<Elevation, string> = {
  flat: 'shadow-[var(--shadow-rim)]',
  e1: 'shadow-[var(--shadow-rim),var(--shadow-e1)]',
  e2: 'shadow-[var(--shadow-rim),var(--shadow-e2)]',
  e3: 'shadow-[var(--shadow-rim),var(--shadow-e3)]',
  e4: 'shadow-[var(--shadow-rim),var(--shadow-e4)]',
}

/** Hover target one step up the same scale, so raising a card never
 * needs a bespoke shadow value at the call site. */
const hoverElevationClass: Record<Elevation, string> = {
  flat: 'hover:shadow-[var(--shadow-e1)]',
  e1: 'hover:shadow-[var(--shadow-e2)]',
  e2: 'hover:shadow-[var(--shadow-e3)]',
  e3: 'hover:shadow-[var(--shadow-e4)]',
  e4: 'hover:shadow-[var(--shadow-e4)]',
}

const radiusClass: Record<Radius, string> = {
  none: '',
  panel: 'rounded-[var(--radius-panel)]',
  card: 'rounded-[var(--radius-card)]',
  frame: 'rounded-[var(--radius-frame)]',
}

const sheenClass: Record<Sheen, string> = {
  none: '',
  surface: 'before:absolute before:inset-0 before:bg-[image:var(--gradient-surface)] before:pointer-events-none',
  veil: 'before:absolute before:inset-0 before:bg-[image:var(--gradient-veil)] before:pointer-events-none',
}

/**
 * A raised surface: elevation, radius, edge lighting and an optional
 * sheen, composed in one place.
 *
 * Exists because depth applied ad-hoc drifts. Before this, the one card
 * in the codebase carried a hand-written
 * `hover:shadow-[0_24px_48px_-28px_rgba(36,27,22,0.28)]` — a reasonable
 * value, but one nothing else could match, so every new raised element
 * would have invented its own. Routing all of it through a five-step
 * scale keeps the whole page lit from the same imaginary light source,
 * which is what makes layered depth read as one scene rather than as
 * unrelated boxes with drop shadows.
 *
 * The sheen and grain layers use ::before/::after, which is why callers
 * get `relative` unconditionally — a positioned pseudo-element with no
 * positioned ancestor would escape to the nearest one and cover the
 * wrong box.
 */
export function Surface({
  as: Tag = 'div',
  elevation = 'e1',
  radius = 'card',
  rim = false,
  sheen = 'none',
  interactive = false,
  grain = false,
  className,
  children,
  ...rest
}: SurfaceProps) {
  return (
    <Tag
      className={cn(
        'relative isolate',
        radiusClass[radius],
        rim ? rimElevationClass[elevation] : elevationClass[elevation],
        interactive && [
          hoverElevationClass[elevation],
          // Only the shadow and the lift transition. Never `all` —
          // that would animate colour and layout changes too, which is
          // what makes hover states feel mushy instead of crisp.
          'transition-[box-shadow,transform] duration-500 [transition-timing-function:var(--ease-settle)]',
          'hover:-translate-y-1 motion-reduce:!translate-y-0',
        ],
        sheen !== 'none' && ['overflow-hidden', sheenClass[sheen]],
        grain && 'grain',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

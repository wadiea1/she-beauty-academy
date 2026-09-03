'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

/**
 * The connector threading the journey steps together.
 *
 * Geometry is in normalized viewBox units with `preserveAspectRatio="none"`,
 * so the curve stretches to whatever width the row actually renders at
 * and nothing here has to know real pixel positions — the same approach
 * as Thread.tsx, and for the same reason: step titles wrap differently
 * in Arabic, Hebrew and English, so any pixel-pinned geometry would be
 * wrong in at least two locales.
 *
 * `pathLength={1}` normalises the path's own length, so the draw
 * animation is a plain 0-1 value with no `getTotalLength()` measurement.
 *
 * Reduced motion is handled by the `.thread-path` rule in globals.css,
 * which forces `stroke-dashoffset: 0` — the line simply appears fully
 * drawn. As in Thread.tsx and Parallax.tsx, the `style` binding is
 * unconditional and never branches on `useReducedMotion()`.
 */

/** Five gentle crests, one per step, on a 1000x100 field. */
const HORIZONTAL =
  'M 0,60 C 60,20 140,20 200,60 C 260,100 340,100 400,60 C 460,20 540,20 600,60 C 660,100 740,100 800,60 C 860,20 940,20 1000,60'

/** Mobile runs the same idea vertically down a 100x1000 field. */
const VERTICAL =
  'M 50,0 C 90,60 10,140 50,200 C 90,260 10,340 50,400 C 90,460 10,540 50,600 C 90,660 10,740 50,800 C 90,860 10,940 50,1000'

export function JourneyPath({ orientation }: { orientation: 'horizontal' | 'vertical' }) {
  // The ref lives on a wrapper div, not the <svg>: Motion's useScroll
  // target is typed for HTMLElement, and an SVGSVGElement is not one.
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 85%', 'end 40%'],
  })
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])

  const horizontal = orientation === 'horizontal'

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={horizontal ? '0 0 1000 100' : '0 0 100 1000'}
      preserveAspectRatio="none"
      className="h-full w-full text-champagne"
    >
      <motion.path
        className="thread-path"
        d={horizontal ? HORIZONTAL : VERTICAL}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        style={{ pathLength }}
      />
    </svg>
    </div>
  )
}

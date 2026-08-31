'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import type { RefObject } from 'react'

/**
 * Geometry lives in normalized SVG viewBox units, not document pixels —
 * `preserveAspectRatio="none"` stretches this to whatever height the
 * actual (CMS-length-dependent) content renders at, so nothing here
 * needs to know or assume real pixel dimensions. Four gentle S-curve
 * waves read as "one continuous winding gesture" without being pinned
 * to specific section boundaries, which would break the moment a
 * heading wraps an extra line in Arabic vs. English.
 *
 * Desktop swings wider (8–32 of a 0–40 width); mobile is a narrower,
 * simpler version of the same shape (6–18 of a 0–24 width) so it never
 * needs more than the container's own padding gutter to sit in.
 */
const DESKTOP_PATH =
  'M 20,0 C 32,80 8,160 20,240 C 32,320 8,400 20,480 C 32,560 8,640 20,720 C 30,800 10,880 20,960 C 24,985 18,995 20,1000'
const MOBILE_PATH =
  'M 12,0 C 18,80 6,160 12,240 C 18,320 6,400 12,480 C 18,560 6,640 12,720 C 16,800 8,880 12,960 C 14,985 10,995 12,1000'

interface ThreadProps {
  containerRef: RefObject<HTMLDivElement | null>
}

/**
 * The signature scroll-drawn line. Lives in the padding gutter at the
 * inline-start edge of the content column (never over text, never
 * blocking clicks — `aria-hidden` + `pointer-events-none`), spanning
 * from Hero through the Apply CTA.
 *
 * Draw progress comes from `useScroll` + `useTransform`, bound to the
 * path via the `style` prop — Motion updates this outside React's
 * render cycle, so scrolling never triggers a `setState`/re-render.
 * The path declares `pathLength={1}` (SVG's own length-normalization
 * attribute) so `strokeDasharray`/`strokeDashoffset` are plain 0–1
 * values regardless of the path's actual geometric length — no
 * `getTotalLength()` measurement/effect needed. `vector-effect:
 * non-scaling-stroke` keeps the line a true ~1px even though the
 * viewBox itself is stretched non-uniformly.
 *
 * The `style` binding below is unconditional — it never branches on
 * `useReducedMotion()` (see Reveal.tsx for why that specific value is
 * unsafe to branch style/shape on between SSR and hydration). Reduced-
 * motion correctness instead comes entirely from the `.thread-path`
 * CSS rule in globals.css, which forces `stroke-dashoffset: 0
 * !important` — a stylesheet override that always wins over this
 * inline style and applies before any JS runs.
 */
export function Thread({ containerRef }: ThreadProps) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  const dashoffset = useTransform(scrollYProgress, [0, 1], [1, 0])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Mirrors Container's own max-width + padding exactly, so the
       * thread sits in the content column's gutter at every viewport
       * width — anchored near the actual text, not drifting to the raw
       * browser edge on wide screens where the editorial container is
       * far narrower than the viewport. */}
      <div className="relative mx-auto h-full max-w-[var(--container-editorial)] px-6 sm:px-8 lg:px-12">
        <svg
          viewBox="0 0 40 1000"
          preserveAspectRatio="none"
          className="absolute inset-y-0 start-0 hidden h-full w-8 lg:block"
        >
          <motion.path
            className="thread-path"
            d={DESKTOP_PATH}
            pathLength={1}
            fill="none"
            stroke="var(--color-rosewood)"
            strokeOpacity={0.55}
            strokeWidth={1}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ strokeDasharray: 1, strokeDashoffset: dashoffset }}
          />
        </svg>
        <svg
          viewBox="0 0 24 1000"
          preserveAspectRatio="none"
          className="absolute inset-y-0 start-0 h-full w-4 lg:hidden"
        >
          <motion.path
            className="thread-path"
            d={MOBILE_PATH}
            pathLength={1}
            fill="none"
            stroke="var(--color-rosewood)"
            strokeOpacity={0.55}
            strokeWidth={1}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ strokeDasharray: 1, strokeDashoffset: dashoffset }}
          />
        </svg>
      </div>
    </div>
  )
}

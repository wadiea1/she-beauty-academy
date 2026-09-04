'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { ReactNode } from 'react'

interface ParallaxProps {
  /** Total vertical travel in px across the element's full pass through
   * the viewport. Positive drifts down (element lags the scroll, reads
   * as further away); negative drifts up (leads the scroll, reads as
   * nearer). Keep these small — 20-70px is the range where it registers
   * as depth rather than as an effect. */
  speed?: number
  className?: string
  children: ReactNode
}

/**
 * Scroll-linked vertical drift, used to separate foreground from
 * background in layered compositions.
 *
 * Two structural details, both learned from Thread.tsx and Reveal.tsx:
 *
 * The `style` binding is UNCONDITIONAL — it never branches on
 * `useReducedMotion()`. That value reads `null` during SSR (there is no
 * matchMedia on the server) and the real preference on hydration, so
 * branching a baked-in style or the element shape on it produces a
 * genuine hydration mismatch. Reduced-motion correctness comes from the
 * `.parallax-layer` rule in globals.css instead, which forces
 * `transform: none !important` — a stylesheet declaration outranks the
 * inline style Motion writes, and applies before any JS runs.
 *
 * The measured element and the transformed element are deliberately
 * different nodes. `useScroll` measures the outer div's position; if the
 * same node also carried the transform, its own displacement would feed
 * back into the measurement and the motion would compound.
 *
 * Motion writes the transform outside React's render cycle, so scrolling
 * triggers no re-render.
 */
export function Parallax({ speed = 40, className, children }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed])

  return (
    <div ref={ref} className={className}>
      <motion.div className="parallax-layer" style={{ y }}>
        {children}
      </motion.div>
    </div>
  )
}

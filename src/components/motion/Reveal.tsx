'use client'

import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Stagger offset in seconds — e.g. Hero sequencing eyebrow → heading →
   * lead → CTA. Not used for scroll-triggered sections (each element
   * animates independently as it enters the viewport). */
  delay?: number
  /** Travel distance in pixels, along the block axis only — never the
   * inline axis, so this never needs an RTL/LTR-aware sign flip. */
  y?: number
  /** false lets a repeat scroll re-trigger the reveal; every current call
   * site wants the default (once). */
  once?: boolean
}

/**
 * The base entrance treatment: fade + small translate-Y, premium
 * "expo-out" easing. Used directly for singular elements (an eyebrow, a
 * heading, a lead paragraph) and as the building block `StaggerItem`
 * wraps for grouped/staggered content.
 *
 * IMPORTANT: this always renders `motion.div` with the *same* `initial`
 * value regardless of `useReducedMotion()` — never branch element type
 * or `initial`/`style` prop values on it. `useReducedMotion()` reads
 * `null` server-side (no matchMedia on the server) and only resolves to
 * the real client value during hydration, so anything that changes
 * *shape* or *baked-in style* based on it differs between the SSR HTML
 * and the first client render — a genuine React hydration-mismatch
 * error, reproduced for real with prefers-reduced-motion forced on via
 * CDP (see docs/IMPLEMENTATION_PLAN.md, Milestone E) with an earlier
 * version of this component that swapped between `<div>` and
 * `motion.div`. Only `transition.duration` varies here — that's a pure
 * JS animation-timing parameter, never reflected in the server-rendered
 * `style` attribute, so it can safely differ without a mismatch.
 * Reduced-motion correctness for the pre-hydration paint itself comes
 * from the CSS `motion-reduce:` utilities below (a stylesheet rule,
 * evaluated before any JS runs); once hydrated, `duration: 0.01` makes
 * the animation functionally instant too.
 */
export function Reveal({ children, className, delay = 0, y = 16, once = true }: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={cn(className, 'motion-reduce:!transform-none motion-reduce:!opacity-100')}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: reduceMotion ? 0.01 : 0.6, delay: reduceMotion ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { HTMLAttributes, ReactNode } from 'react'

// Motion's `motion.*` components redefine onDrag/onDragStart/onDragEnd/
// onAnimationStart/onAnimationEnd with Motion-specific signatures that
// collide with React's native DOM event types of the same name — omit
// them from the spreadable prop surface since no call site uses any of
// them (only `className` and React's `key` are ever passed through).
type SafeHTMLAttributes = Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'
>

interface StaggerGroupProps extends SafeHTMLAttributes {
  children: ReactNode
  /** Seconds between each direct `StaggerItem` child's entrance. */
  staggerDelay?: number
  /** 'ul' when wrapping a semantic list (WhatYouLeaveWith's points, FAQ
   * rows) so the reveal wrapper doesn't break list-item enumeration for
   * assistive tech — pair with `StaggerItem`'s `as="li"`. */
  as?: 'div' | 'ul'
}

/**
 * Orchestrates a group of `StaggerItem` children so they reveal in a
 * gentle cascade instead of all at once — course cards, WhySHE pillars,
 * WhatYouLeaveWith points, FAQ rows. Motion propagates `initial`/
 * `whileInView` down to any descendant `motion` component that declares
 * matching `variants` without its own explicit animation state, which is
 * exactly what `StaggerItem` relies on.
 *
 * IMPORTANT: always renders the same `motion.*` element with the same
 * `initial`/`variants` shape regardless of `useReducedMotion()` — see
 * Reveal.tsx for why branching element type or baked-in style values on
 * that (server-vs-client-divergent) value causes a real hydration
 * mismatch, reproduced and fixed during Milestone E. Only
 * `staggerChildren`'s timing varies (a JS-only parameter, never part of
 * the server-rendered HTML), collapsed to 0 under reduced motion so a
 * group of many `StaggerItem`s doesn't still take a cumulative
 * fraction-of-a-second to finish revealing.
 */
export function StaggerGroup({
  children,
  className,
  staggerDelay = 0.09,
  as = 'div',
  ...rest
}: StaggerGroupProps) {
  const reduceMotion = useReducedMotion()
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : staggerDelay } },
  }

  if (as === 'ul') {
    return (
      <motion.ul
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
        {...rest}
      >
        {children}
      </motion.ul>
    )
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={containerVariants}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

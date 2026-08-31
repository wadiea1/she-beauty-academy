'use client'

import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import type { HTMLAttributes, ReactNode } from 'react'

// See StaggerGroup.tsx for why these handlers are excluded — Motion's
// motion.* components redefine them with incompatible signatures, and
// no call site here passes any of them.
type SafeHTMLAttributes = Omit<
  HTMLAttributes<HTMLElement>,
  'children' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd'
>

interface StaggerItemProps extends SafeHTMLAttributes {
  children: ReactNode
  y?: number
  as?: 'div' | 'li'
}

// See Reveal.tsx for why this CSS-level override — not a client-side
// branch on useReducedMotion() — is the mechanism for reduced-motion
// correctness here: it's a stylesheet rule that applies before any JS
// runs, so it's correct on the very first paint, and it never causes
// the element-type/style-value divergence between SSR and hydration
// that a JS branch on this specific value does.
const reducedMotionSafety = 'motion-reduce:!transform-none motion-reduce:!opacity-100'

/**
 * One entry in a `StaggerGroup` — declares `variants` only, no
 * `initial`/`whileInView` of its own, so it inherits its animation state
 * from the parent group's orchestration. Always renders the same
 * `motion.*` element with the same `variants` shape regardless of
 * reduced-motion; only `transition.duration` (a JS-only timing
 * parameter) varies.
 */
export function StaggerItem({ children, className, y = 16, as = 'div', ...rest }: StaggerItemProps) {
  const reduceMotion = useReducedMotion()
  const itemVariants = {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  }

  if (as === 'li') {
    return (
      <motion.li className={cn(className, reducedMotionSafety)} variants={itemVariants} {...rest}>
        {children}
      </motion.li>
    )
  }

  return (
    <motion.div className={cn(className, reducedMotionSafety)} variants={itemVariants} {...rest}>
      {children}
    </motion.div>
  )
}

'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { cn } from '@/lib/cn'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

interface TiltCardProps {
  /** Maximum rotation in degrees at the card's corners. Small on
   * purpose — past about 8deg this stops reading as a lit surface and
   * starts reading as a gimmick. */
  max?: number
  className?: string
  children: ReactNode
}

/**
 * Pointer-tracked perspective tilt.
 *
 * The "3D" here comes from perspective and lighting rather than from
 * WebGL: the card rotates a few degrees toward the cursor while its
 * existing elevation shadow stays put, which is what sells it as a
 * physical object catching light.
 *
 * Three deliberate constraints:
 *
 * Mouse only. `event.pointerType` is checked so touch and pen never
 * trigger it — on a touch device the tilt would fire on tap, leave the
 * card rotated with no pointer to reset it, and fight scrolling.
 *
 * Springs, not raw values. Mapping cursor position straight to rotation
 * tracks the mouse exactly and feels mechanical; the spring adds the
 * slight lag that reads as weight.
 *
 * The transform is written by Motion outside React's render cycle, so
 * pointer movement triggers no re-render. Reduced-motion is handled by
 * the `.tilt-target` rule in globals.css forcing `transform: none`,
 * matching Parallax and Thread — never by branching on
 * `useReducedMotion()`, whose SSR value differs from its hydrated one.
 */
export function TiltCard({ max = 6, className, children }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  // -0.5 .. 0.5, the pointer's offset from the card's centre.
  const px = useMotionValue(0)
  const py = useMotionValue(0)

  const spring = { stiffness: 150, damping: 18, mass: 0.4 }
  const sx = useSpring(px, spring)
  const sy = useSpring(py, spring)

  // Y offset drives rotateX and inverts: pointer above centre should
  // tip the top edge away, not toward.
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max])

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    px.set((event.clientX - rect.left) / rect.width - 0.5)
    py.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  function reset() {
    px.set(0)
    py.set(0)
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      // Perspective must live on the parent of the rotating element,
      // not on the element itself — on the element it would apply to its
      // own children instead and the card would stay flat.
      className={cn('perspective h-full', className)}
    >
      <motion.div
        className="tilt-target h-full [transform-style:preserve-3d]"
        style={{ rotateX, rotateY }}
      >
        {children}
      </motion.div>
    </div>
  )
}

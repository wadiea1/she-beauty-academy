'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

type Ratio = 'portrait' | 'landscape' | 'square' | 'wide'

interface ImageFrameProps {
  /** Omit until real photography lands — renders an elegant placeholder
   * instead of a broken image. See docs/PHOTOGRAPHY_BRIEF.md. */
  src?: string | null
  alt: string
  ratio?: Ratio
  className?: string
  priority?: boolean
  sizes?: string
  /** Positions the reveal within a larger entrance sequence (e.g. Hero's
   * eyebrow → heading → lead → CTA → image). 0 for every other call
   * site, which is the default. */
  revealDelay?: number
}

const ratioClass: Record<Ratio, string> = {
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[3/2]',
  square: 'aspect-square',
  wide: 'aspect-[16/9]',
}

/**
 * Client Component: the entrance reveal (opacity + a subtle settle-in
 * scale) needs viewport-intersection detection, a browser-only concern.
 * Every call site — Hero, CourseCard, InsideAcademy's mosaic, instructor
 * portrait — gets the same treatment automatically, on both today's
 * placeholder and whatever real Payload Media replaces it later; nothing
 * about the reveal depends on `src` being set.
 */
export function ImageFrame({
  src,
  alt,
  ratio = 'landscape',
  className,
  priority,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  revealDelay = 0,
}: ImageFrameProps) {
  const reduceMotion = useReducedMotion()

  const frameClass = cn(
    'relative overflow-hidden rounded-[var(--radius-panel)]',
    ratioClass[ratio],
    !src && 'bg-gradient-to-br from-shell via-blush/50 to-champagne/40',
    className,
  )

  const content = src ? (
    <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
  ) : (
    <div className="absolute inset-0 flex items-center justify-center p-6" role="img" aria-label={alt}>
      <span className="max-w-[16rem] text-center font-body text-xs text-rosewood-ink/60">{alt}</span>
    </div>
  )

  // IMPORTANT: always renders motion.div with the same `initial` value —
  // never branches element type or that value on useReducedMotion(). See
  // Reveal.tsx: that value differs between the SSR pass (always null,
  // no matchMedia on the server) and the client's hydration pass,  and
  // branching structure/baked-in style on it caused a real, reproduced
  // hydration mismatch. `transition.duration` and `whileHover` are safe
  // to vary — duration is a JS-only timing parameter never reflected in
  // the server-rendered `style`, and `whileHover` only ever activates on
  // an actual hover event, which can't happen during hydration.
  return (
    <motion.div
      className={cn(frameClass, 'motion-reduce:!transform-none motion-reduce:!opacity-100')}
      initial={{ opacity: 0, scale: 1.04 }}
      whileInView={{ opacity: 1, scale: 1 }}
      // A hover state, not a size change on click — deliberately tiny
      // (1.02) so it reads as "the frame gently leans in" rather than a
      // jump. Layered on top of whileInView via Motion's own state
      // resolution (not a competing CSS transform), so it never fights
      // the entrance animation above.
      whileHover={reduceMotion ? undefined : { scale: 1.02 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration: reduceMotion ? 0.01 : 0.7,
        delay: reduceMotion ? 0 : revealDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {content}
    </motion.div>
  )
}

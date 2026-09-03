'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { PlaceholderArt, motifFor, type Motif } from '@/components/ui/PlaceholderArt'

type Ratio = 'portrait' | 'landscape' | 'square' | 'wide' | 'tall'
type Elevation = 'flat' | 'e1' | 'e2' | 'e3' | 'e4'

interface ImageFrameProps {
  /** Omit until real photography lands. The slot then renders an
   * art-directed plate rather than a broken-looking rectangle — the API
   * is unchanged, so swapping in Payload Media later is only ever
   * passing `src`. See docs/PHOTOGRAPHY_BRIEF.md. */
  src?: string | null
  alt: string
  ratio?: Ratio
  className?: string
  priority?: boolean
  sizes?: string
  /** Positions the reveal within a larger entrance sequence (e.g. Hero's
   * eyebrow → heading → lead → CTA → image). 0 for most call sites. */
  revealDelay?: number
  /** Chooses the placeholder motif deterministically. Pass the item's
   * index so a grid of empty slots varies instead of repeating. */
  motifSeed?: number
  motif?: Motif
  elevation?: Elevation
  /** Art-direction note shown on the empty state — what this slot is
   * *for*. Falls back to `alt`. Never rendered once `src` exists. */
  caption?: string
  /** Set false where a foreground layer overlaps the frame's bottom edge
   * and would half-cover the slug, which reads as a mistake rather than
   * as depth. The slot's art direction still lives in
   * docs/PHOTOGRAPHY_BRIEF.md, and `alt` still describes it to assistive
   * tech either way. */
  showCaption?: boolean
}

const ratioClass: Record<Ratio, string> = {
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[3/2]',
  square: 'aspect-square',
  wide: 'aspect-[16/9]',
  tall: 'aspect-[3/4]',
}

const elevationClass: Record<Elevation, string> = {
  flat: '',
  e1: 'shadow-[var(--shadow-e1)]',
  e2: 'shadow-[var(--shadow-e2)]',
  e3: 'shadow-[var(--shadow-e3)]',
  e4: 'shadow-[var(--shadow-e4)]',
}

/**
 * Client Component: the entrance reveal needs viewport-intersection
 * detection, a browser-only concern. Every call site gets the same
 * treatment on both today's placeholder and whatever Payload Media
 * replaces it later; nothing about the reveal depends on `src`.
 */
export function ImageFrame({
  src,
  alt,
  ratio = 'landscape',
  className,
  priority,
  sizes = '(min-width: 1024px) 50vw, 100vw',
  revealDelay = 0,
  motifSeed = 0,
  motif,
  elevation = 'flat',
  caption,
  showCaption = true,
}: ImageFrameProps) {
  const reduceMotion = useReducedMotion()

  const frameClass = cn(
    'relative isolate overflow-hidden rounded-[var(--radius-frame)]',
    ratioClass[ratio],
    elevationClass[elevation],
    className,
  )

  const content = src ? (
    <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
  ) : (
    <div className="absolute inset-0" role="img" aria-label={alt}>
      {/* Three stacked layers, not one flat fill: a diagonal blush
        * gradient as the material, a white veil to give it a light
        * direction consistent with the elevation shadows, then the
        * line-art plate. */}
      <div className="absolute inset-0 bg-[image:var(--gradient-blush)]" />
      <div className="absolute inset-0 bg-[image:var(--gradient-veil)]" />
      <PlaceholderArt motif={motif ?? motifFor(motifSeed)} />
      <div className="grain absolute inset-0" />

      {/* Reads as an art-direction slug on a contact sheet — a hairline
        * rule and a small caption pinned to the bottom edge — rather
        * than as an error message centred in an empty box. */}
      {showCaption && (
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-4 sm:p-5">
          <span aria-hidden="true" className="h-px w-6 shrink-0 bg-rosewood-ink/40" />
          <span className="font-body text-[0.6875rem] leading-snug text-rosewood-ink/70">
            {caption ?? alt}
          </span>
        </div>
      )}
    </div>
  )

  // IMPORTANT: always renders motion.div with the same `initial` value —
  // never branches element type or that value on useReducedMotion(). See
  // Reveal.tsx: that value differs between the SSR pass (always null, no
  // matchMedia on the server) and the client's hydration pass, and
  // branching structure/baked-in style on it caused a real, reproduced
  // hydration mismatch. `transition.duration` and `whileHover` are safe
  // to vary — duration is a JS-only timing parameter never reflected in
  // the server-rendered `style`, and `whileHover` only ever activates on
  // an actual hover event, which cannot happen during hydration.
  return (
    <motion.div
      className={cn(frameClass, 'motion-reduce:!transform-none motion-reduce:!opacity-100')}
      initial={{ opacity: 0, scale: 1.04 }}
      whileInView={{ opacity: 1, scale: 1 }}
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

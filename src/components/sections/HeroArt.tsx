import { ImageFrame } from '@/components/ui/ImageFrame'
import { PlaceholderArt } from '@/components/ui/PlaceholderArt'
import { Parallax } from '@/components/motion/Parallax'

interface HeroArtProps {
  src?: string | null
  alt: string
}

/**
 * The hero's layered image composition.
 *
 * Three planes drifting at different rates is what produces the depth:
 * a ring accent furthest back, the portrait in the middle, and a small
 * plate in front overlapping its corner. Overlap is doing the real work
 * — a single centred frame reads as flat no matter how large the shadow
 * on it is, because nothing occludes anything.
 *
 * All positioning uses logical properties (`start`/`end`), so the whole
 * composition mirrors correctly between the RTL and LTR locales rather
 * than needing a second hand-built arrangement.
 *
 * The small front plate is deliberately NOT a second image slot. It is
 * decorative line-art and `aria-hidden`, because a second empty slot
 * would imply a missing photograph the CMS has no field for. It can be
 * promoted to a real slot later if the academy wants one there.
 */
export function HeroArt({ src, alt }: HeroArtProps) {
  return (
    <div className="relative">
      {/* Furthest plane: an outline ring bleeding past the frame. Drifts
        * WITH the scroll (positive speed) so it lags and reads as
        * distant.
        *
        * `z-0`, not `-z-10`. A negative z-index child paints behind its
        * parent's background whenever no ancestor between them creates a
        * stacking context — and Section is only `relative`, so the ring
        * disappeared entirely behind the porcelain fill. Explicit
        * ascending z-indexes across the three planes are also simply
        * easier to reason about than relying on paint order, since the
        * middle plane is static and the outer two are positioned. */}
      <Parallax speed={54} className="pointer-events-none absolute -top-12 -end-14 z-0 hidden sm:block">
        <div
          aria-hidden="true"
          className="h-48 w-48 rounded-full border border-champagne/60 lg:h-64 lg:w-64"
        />
      </Parallax>

      {/* Middle plane: the real image slot. Nearly still, so it anchors
        * the composition. */}
      <Parallax speed={-14} className="relative z-10">
        <ImageFrame
          ratio="portrait"
          src={src}
          alt={alt}
          motif="contour"
          elevation="e4"
          priority
          revealDelay={0.15}
          showCaption={false}
          sizes="(min-width: 1024px) 40vw, 80vw"
        />
      </Parallax>

      {/* Nearest plane: overlaps the portrait's lower inline-start
        * corner and drifts against the scroll, so it passes in front. */}
      <Parallax
        speed={-46}
        className="pointer-events-none absolute -bottom-12 -start-8 z-20 w-32 sm:-start-14 sm:w-40 lg:w-44"
      >
        <div
          aria-hidden="true"
          className="relative aspect-square overflow-hidden rounded-[var(--radius-frame)] border border-porcelain/70 bg-[image:var(--gradient-blush)] shadow-[var(--shadow-rim),var(--shadow-e3)]"
        >
          <div className="absolute inset-0 bg-[image:var(--gradient-veil)]" />
          <PlaceholderArt motif="petal" />
          <div className="grain absolute inset-0" />
        </div>
      </Parallax>
    </div>
  )
}

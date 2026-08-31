import Image from 'next/image'
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
}

const ratioClass: Record<Ratio, string> = {
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[3/2]',
  square: 'aspect-square',
  wide: 'aspect-[16/9]',
}

export function ImageFrame({
  src,
  alt,
  ratio = 'landscape',
  className,
  priority,
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: ImageFrameProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-panel)]',
        ratioClass[ratio],
        !src && 'bg-gradient-to-br from-shell via-blush/50 to-champagne/40',
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6" role="img" aria-label={alt}>
          <span className="max-w-[16rem] text-center font-body text-xs text-rosewood-ink/60">
            {alt}
          </span>
        </div>
      )}
    </div>
  )
}

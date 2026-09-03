import { cn } from '@/lib/cn'

export type Motif = 'arc' | 'petal' | 'bloom' | 'contour'

/** Stable, deterministic motif choice. Never random: the same slot must
 * pick the same motif on the server and on the client, or hydration
 * mismatches — and the whole point is that a page of placeholders looks
 * art-directed rather than repetitive. */
const MOTIFS: readonly Motif[] = ['arc', 'petal', 'bloom', 'contour']

export function motifFor(index: number): Motif {
  return MOTIFS[Math.abs(index) % MOTIFS.length]!
}

interface PlaceholderArtProps {
  motif?: Motif
  className?: string
}

/**
 * Brand line-art for image slots that have no photograph yet.
 *
 * The academy has zero media in the CMS today — every image slot on the
 * site was rendering a flat pink rectangle with alt text centred in it,
 * which read as a broken image rather than as pending art direction.
 * That was the single most damaging visual element on the page and the
 * literal cause of "the site is too text-heavy".
 *
 * These are drawn large and deliberately cropped by their frame, the way
 * a real editorial image would be — so a slot reads as a composed
 * abstract plate, not as a missing asset. Stroke-only, in champagne over
 * the warm gradient, at low opacity: present enough to be a picture,
 * quiet enough never to compete with the type beside it.
 *
 * Pure inline SVG: no request, no decode, no layout cost, and it scales
 * to any frame ratio. `vectorEffect="non-scaling-stroke"` keeps the line
 * weight a true hairline regardless of how the viewBox is stretched.
 */
export function PlaceholderArt({ motif = 'arc', className }: PlaceholderArtProps) {
  const stroke = 'currentColor'
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 1,
    vectorEffect: 'non-scaling-stroke' as const,
  }

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      className={cn('absolute inset-0 h-full w-full text-champagne', className)}
    >
      {motif === 'arc' && (
        // Concentric arcs sweeping from one corner — the geometry of a
        // compact opening, and the calmest of the four.
        <g {...common} opacity="0.55">
          {[38, 62, 86, 110, 134, 158].map((r) => (
            <path key={r} d={`M ${200 - r} 200 A ${r} ${r} 0 0 0 200 ${200 - r}`} />
          ))}
          <circle cx="58" cy="52" r="26" opacity="0.7" />
        </g>
      )}

      {motif === 'petal' && (
        // Four rotated ellipses reading as overlapping petals. Rotation
        // is applied per-shape rather than to the group so each keeps its
        // own centre and they interleave instead of nesting.
        <g {...common} opacity="0.5">
          {[0, 45, 90, 135].map((deg) => (
            <ellipse key={deg} cx="100" cy="100" rx="34" ry="86" transform={`rotate(${deg} 100 100)`} />
          ))}
          <circle cx="100" cy="100" r="7" opacity="0.8" />
        </g>
      )}

      {motif === 'bloom' && (
        // A light source: fine rays out of a low point, with two rings.
        <g {...common} opacity="0.45">
          {Array.from({ length: 18 }, (_, i) => {
            const a = (Math.PI / 17) * i - Math.PI
            return (
              <line
                key={i}
                x1="100"
                y1="176"
                x2={100 + Math.cos(a) * 150}
                y2={176 + Math.sin(a) * 150}
              />
            )
          })}
          <circle cx="100" cy="176" r="48" opacity="0.9" />
          <circle cx="100" cy="176" r="84" opacity="0.6" />
        </g>
      )}

      {motif === 'contour' && (
        // Soft topographic contours — the most "material" of the four,
        // good behind portraits where a strong motif would compete.
        <g {...common} opacity="0.5">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M -10 ${34 + i * 26} C 45 ${10 + i * 26}, 90 ${64 + i * 26}, 145 ${34 + i * 26} S 210 ${8 + i * 26}, 215 ${30 + i * 26}`}
            />
          ))}
        </g>
      )}
    </svg>
  )
}

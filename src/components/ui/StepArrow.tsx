import { cn } from '@/lib/cn'

/**
 * A hairline chevron marking direction of travel between journey steps.
 *
 * Drawn pointing inline-end and flipped by the RTL rule below rather
 * than by branching on locale, so one component serves all three. A
 * left-pointing arrow in an Arabic layout is not a detail — it reverses
 * the meaning of the whole sequence.
 */
export function StepArrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 16"
      className={cn('h-4 w-6 text-champagne rtl:-scale-x-100', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      vectorEffect="non-scaling-stroke"
    >
      <path d="M0 8 H21" strokeLinecap="round" />
      <path d="M15 2 L21 8 L15 14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

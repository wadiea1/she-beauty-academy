import type { SVGAttributes } from 'react'

/** Generic message-bubble glyph for the WhatsApp CTA — deliberately not a
 * reproduction of the WhatsApp logotype, and rendered in brand ink/porcelain
 * rather than WhatsApp green so it never fights the palette. */
export function WhatsAppIcon(props: SVGAttributes<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3a9 9 0 0 0-7.75 13.5L3 21l4.7-1.23A9 9 0 1 0 12 3Z" />
      <path d="M8.5 9.5c0 3 2 5 5 5" />
    </svg>
  )
}

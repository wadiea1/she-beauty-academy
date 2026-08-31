'use client'

import { useRef, type ReactNode } from 'react'
import { Thread } from './Thread'

/**
 * Thin positioning boundary for The Thread: wraps the Server Component
 * section tree (Hero through ApplyCTA) in a `position: relative` div so
 * the Thread's SVG can be absolutely positioned against it and stretch
 * to the tree's actual, CMS-content-dependent height — no separate
 * height measurement needed, no hardcoded pixel span. Passing Server
 * Component output through `children` like this keeps every section
 * itself server-rendered; only this thin wrapper and the Thread's own
 * scroll-tracking need a client boundary.
 *
 * The Thread is rendered *after* `children` in DOM order deliberately —
 * each Section sets its own opaque background, so painting the thread
 * last keeps it visible on top of every section's fill rather than
 * hidden behind it.
 */
export function ThreadContainer({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative">
      {children}
      <Thread containerRef={containerRef} />
    </div>
  )
}

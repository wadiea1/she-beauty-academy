import 'server-only'
import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * One Payload instance per request (React's cache() dedupes calls within
 * a single render pass — the standard Next.js Server Component pattern).
 * Never imported by a Client Component: `server-only` enforces that at
 * build time.
 */
export const getCachedPayload = cache(async () => getPayload({ config }))

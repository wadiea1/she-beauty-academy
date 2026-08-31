import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { defaultLocale, locales } from '@/i18n/config'

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (function export named
// `proxy`, Node.js runtime only). This is the App Router's locale-prefix
// redirect: `/` and any unprefixed path get the default locale (`ar`)
// prepended. `/admin`, `/api`, and static assets are excluded via the
// matcher below and never reach this function.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )
  if (hasLocalePrefix) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/((?!admin|api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
}

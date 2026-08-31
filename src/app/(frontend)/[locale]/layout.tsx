import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cn } from '@/lib/cn'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, localeMeta } from '@/i18n/config'
import { allFontVariables } from '@/styles/fonts'
import { getNavigation, getSiteSettings } from '@/lib/payload/queries'
import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import '@/styles/globals.css'

// `[locale]` is the root layout for the public site (owns <html>/<body>),
// matching the Next.js 16 i18n pattern: the dynamic segment folder *is*
// the root layout, so every layout/page below it gets `locale` for free
// via `params`. The (payload) route group keeps its own independent root
// layout for /admin — two root layouts via route groups, by design.
//
// Rendering strategy (Milestone G): time-based caching of the CMS data
// itself, not build-time static generation. This is a CMS-driven
// marketing site — staff expect a Payload publish to go live without a
// redeploy, which build-time-only SSG can't do. generateStaticParams is
// deliberately NOT used here, so nothing is prerendered at build time —
// `next build` needs no live database access as a result, which is a
// side effect of the right choice for this site, not the reason it was
// made.
//
// The actual caching lives in src/lib/payload/queries.ts via
// unstable_cache, NOT in this file's `revalidate` export below. Found
// this the hard way: this export alone did nothing measurable — a
// production-server test showed a request immediately after a Payload
// publish already reflected the new value, zero delay. Per Next.js's
// docs (Caching and Revalidating, Previous Model — the model this
// project is on, not the newer opt-in Cache Components), the route
// segment `revalidate` config governs `fetch()` caching and ISR for
// routes prerendered via generateStaticParams; neither applies here,
// since Payload's Local API isn't `fetch()` and this route has no
// generateStaticParams. Left as a harmless, documented declaration of
// intent for the route segment; do not rely on it for actual caching.
export const revalidate = 60

export async function generateMetadata({
  params,
}: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const dict = await getDictionary(locale)
  return {
    title: {
      default: `${dict.common.brandMark} ${dict.common.brandSubtitle}`,
      template: `%s · ${dict.common.brandMark}`,
    },
    description: dict.common.tagline,
  }
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const [dict, navItems, siteSettings] = await Promise.all([
    getDictionary(locale),
    getNavigation(locale),
    getSiteSettings(locale),
  ])
  const { dir } = localeMeta[locale]

  return (
    <html lang={locale} dir={dir} className={cn('h-full antialiased', allFontVariables)}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-panel)] focus:bg-ink focus:px-4 focus:py-2 focus:text-porcelain"
        >
          {dict.nav.skipToContent}
        </a>

        <Navigation locale={locale} dict={dict} navItems={navItems} />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <Footer locale={locale} dict={dict} navItems={navItems} siteSettings={siteSettings} />
      </body>
    </html>
  )
}

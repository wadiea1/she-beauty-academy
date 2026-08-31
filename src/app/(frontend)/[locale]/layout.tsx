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
// Rendering strategy (Milestone G): ISR via `revalidate`, not build-time
// static generation. This is a CMS-driven marketing site — staff expect
// a Payload publish to go live without a redeploy, which build-time-only
// SSG can't do. Full per-request dynamic rendering would work too, but
// pays a database round-trip for every visitor for content that changes
// at a human editing pace; ISR gets both a cached, fast response and
// content that reflects a publish within the revalidate window.
// generateStaticParams is deliberately NOT used here, so nothing is
// prerendered at build time — `next build` still needs no live database
// access as a result, but that's a side effect of the right choice for
// this site, not the reason it was made.
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

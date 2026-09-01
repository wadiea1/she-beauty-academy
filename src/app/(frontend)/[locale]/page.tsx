import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/getDictionary'
import { getHomepage, getPublishedCourses, getPublishedFAQs, getSiteSettings } from '@/lib/payload/queries'
import { absoluteUrl, getRobotsMetadata } from '@/lib/seo/baseUrl'
import { ogLocaleFor, resolveOgImage } from '@/lib/seo/metadata'
import { Hero } from '@/components/sections/Hero'
import { Manifesto } from '@/components/sections/Manifesto'
import { WhySHE } from '@/components/sections/WhySHE'
import { Courses } from '@/components/sections/Courses'
import { InsideAcademy } from '@/components/sections/InsideAcademy'
import { WhatYouLeaveWith } from '@/components/sections/WhatYouLeaveWith'
import { InstructorCredibility } from '@/components/sections/InstructorCredibility'
import { FAQSection } from '@/components/sections/FAQSection'
import { ApplyCTA } from '@/components/sections/ApplyCTA'
import { SocialProof } from '@/components/sections/SocialProof'
import { ThreadContainer } from '@/components/motion/ThreadContainer'

/**
 * Homepage-specific metadata — canonical, hreflang alternates, and
 * openGraph/twitter — deliberately live HERE, not in the shared
 * [locale]/layout.tsx, even though this route inherits that layout's
 * title/description/robots defaults just fine. A canonical or OG url
 * is only correct for the homepage itself; putting it in the layout
 * previously leaked it onto every route below, including a fake
 * course slug's 404 page (a real, verified bug — see
 * [locale]/layout.tsx's own comment).
 */
export async function generateMetadata({
  params,
}: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}

  const [dict, siteSettings] = await Promise.all([getDictionary(locale), getSiteSettings(locale)])

  const brandTitle = `${dict.common.brandMark} ${dict.common.brandSubtitle}`
  const title = siteSettings.defaultSeo.metaTitle || brandTitle
  const description = siteSettings.defaultSeo.metaDescription || dict.common.tagline
  const path = `/${locale}`
  const url = absoluteUrl(path)
  const ogImages = resolveOgImage(siteSettings.defaultSeo.ogImage)

  return {
    // Only present as a key at all when there's a real CMS override
    // — `title: undefined` is NOT the same as omitting the key
    // entirely. A real, verified bug: setting it unconditionally to
    // `undefined` suppressed the layout's `title.default` inheritance
    // completely, producing a homepage with no <title> element at
    // all. Spreading it in conditionally is what actually falls
    // through correctly when there's no override.
    //
    // Not re-declaring `title` as a plain string when there IS an
    // override, either — that would run it through the layout's
    // `%s · SHE` template (the Milestone H bug pattern). `title.absolute`
    // applies it without the template suffix, matching intent (a full
    // override, not a suffixable segment title).
    ...(siteSettings.defaultSeo.metaTitle ? { title: { absolute: title } } : {}),
    description,
    alternates: {
      canonical: path,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}`])),
        // `/` truthfully redirects to the default locale (src/proxy.ts)
        // — x-default reflects that real routing behavior rather than
        // inventing a separate landing page.
        'x-default': '/ar',
      },
    },
    openGraph: {
      type: 'website',
      siteName: brandTitle,
      locale: ogLocaleFor(locale),
      url,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: ogImages ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImages,
    },
    robots: getRobotsMetadata(),
  }
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const [dict, homepage, courses, faqs, siteSettings] = await Promise.all([
    getDictionary(locale),
    getHomepage(locale),
    getPublishedCourses(locale),
    getPublishedFAQs(locale),
    getSiteSettings(locale),
  ])

  return (
    <>
      <ThreadContainer>
        <Hero copy={homepage.hero} ctaLabel={dict.nav.apply} />
        <Manifesto copy={homepage.manifesto} />
        <WhySHE copy={homepage.whySHE} />
        <Courses
          copy={homepage.coursesIntro}
          courses={courses}
          ctaLabel={dict.nav.apply}
          locale={locale}
        />
        <InsideAcademy copy={homepage.insideAcademy} />
        <WhatYouLeaveWith copy={homepage.whatYouLeaveWith} />
        <InstructorCredibility copy={homepage.instructor} />
        <FAQSection copy={homepage.faqIntro} items={faqs} />
        <ApplyCTA
          copy={homepage.apply}
          ctaLabel={dict.nav.apply}
          whatsappLabel={dict.footer.whatsapp}
          whatsappNumber={siteSettings.whatsappNumber}
          locale={locale}
          courses={courses}
          applyFormDict={dict.applyForm}
        />
      </ThreadContainer>
      <SocialProof
        eyebrow={dict.footer.connect}
        heading={dict.footer.instagram}
        instagramHandle={siteSettings.instagramHandle}
        brandName={`${dict.common.brandMark} ${dict.common.brandSubtitle}`}
      />
    </>
  )
}

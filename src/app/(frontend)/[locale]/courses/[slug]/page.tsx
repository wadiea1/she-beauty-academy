import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale, locales } from '@/i18n/config'
import { getDictionary } from '@/i18n/getDictionary'
import {
  getPublishedCourseBySlug,
  getPublishedCourses,
  getPublishedFAQsForCourse,
  getSiteSettings,
  type CourseDetail,
} from '@/lib/payload/queries'
import { absoluteUrl, getRobotsMetadata } from '@/lib/seo/baseUrl'
import { ogLocaleFor, resolveOgImage } from '@/lib/seo/metadata'
import { buildBreadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo/structuredData'
import { CourseHero } from '@/components/course/CourseHero'
import { CourseOverview } from '@/components/course/CourseOverview'
import { CourseOutcomes } from '@/components/course/CourseOutcomes'
import { CourseCurriculum } from '@/components/course/CourseCurriculum'
import { CourseGallery } from '@/components/course/CourseGallery'
import { CoursePracticalInfo } from '@/components/course/CoursePracticalInfo'
import { FAQSection } from '@/components/sections/FAQSection'
import { ApplyCTA } from '@/components/sections/ApplyCTA'
import { courseHasPriceRow } from '@/lib/coursePricing'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/courses/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}

  const [course, siteSettings] = await Promise.all([
    getPublishedCourseBySlug(locale, slug),
    getSiteSettings(locale),
  ])
  // Deliberately not distinguishing "no such slug" from "matches an
  // unpublished course" here either (see the same reasoning below, in
  // the page component) — no title/description/canonical/openGraph is
  // emitted for a 404, so nothing here can leak a draft's existence.
  // A plain {}, not an explicit `robots: noindex` — verified that it
  // wouldn't matter either way: when notFound() actually fires, Next
  // renders courses/[slug]/not-found.tsx instead of this page, and
  // that boundary does NOT inherit this page's own generateMetadata
  // (only the ancestor layouts'), so anything returned here for the
  // 404 case is never actually used. Next's own auto-injected
  // `noindex` for the 404 response, plus the ancestor layouts having
  // no `robots` default of their own to leak (see [locale]/layout.tsx),
  // are what actually keep this case clean.
  if (!course) return {}

  // Plain string, not `${course.title} · ${brandMark}` — the root
  // layout's generateMetadata already sets a `title.template`
  // ('%s · SHE'), which Next applies to any plain-string child title.
  // Appending the brand suffix here too produced a real, verified bug:
  // "Cosmetics 1 · SHE · SHE".
  const title = course.metaTitle || course.title
  const description =
    course.metaDescription || siteSettings.defaultSeo.metaDescription || course.shortDescription

  // metadataBase is set once in the root [locale]/layout.tsx (from
  // NEXT_PUBLIC_SERVER_URL — see src/lib/seo/baseUrl.ts) and applies
  // to every relative URL-based field below, including these; no
  // production domain is guessed here.
  const path = `/${locale}/courses/${slug}`
  const url = absoluteUrl(path)
  const ogImages = resolveOgImage(course.heroImage, siteSettings.defaultSeo.ogImage)

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}/courses/${slug}`])),
        // Same real-routing-behavior rationale as the homepage's
        // x-default (see [locale]/layout.tsx).
        'x-default': `/ar/courses/${slug}`,
      },
    },
    openGraph: {
      type: 'website',
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

/** Copy that varies by which optional fields the course actually has,
 * computed once so tones can alternate correctly regardless of which
 * sections end up rendering — see the section components themselves
 * for why a fixed per-component tone isn't safe here. */
function computeSectionTones(course: CourseDetail, hasFaq: boolean) {
  const hasOverview = Boolean(course.description || course.audience)
  const hasOutcomes = course.outcomes.length > 0
  const hasCurriculum = course.curriculum.length > 0
  const hasGallery = course.gallery.length > 0
  // Mirrors CoursePracticalInfo's own "any row to show" check — kept in
  // sync via the same courseHasPriceRow helper, so the tone computed
  // here and the component's actual decision to render (or return
  // null) can never disagree.
  const hasPracticalInfo =
    Boolean(course.duration) ||
    Boolean(course.scheduleInfo) ||
    courseHasPriceRow(course.pricing) ||
    course.certificationType === 'professionalDiploma'

  let toggle: 'porcelain' | 'shell' = 'shell'
  const next = () => {
    const t = toggle
    toggle = t === 'shell' ? 'porcelain' : 'shell'
    return t
  }

  const overview = hasOverview ? next() : undefined
  const outcomes = hasOutcomes ? next() : undefined
  const curriculum = hasCurriculum ? next() : undefined
  const gallery = hasGallery ? next() : undefined
  let practicalInfo = hasPracticalInfo ? next() : undefined
  // FAQSection (when present) has a fixed tone="shell" of its own, not
  // parametrized like these — avoid handing PracticalInfo the same
  // tone as the section immediately before it.
  if (practicalInfo && hasFaq && practicalInfo === 'shell') practicalInfo = 'porcelain'

  return { overview, outcomes, curriculum, gallery, practicalInfo }
}

export default async function CoursePage({ params }: PageProps<'/[locale]/courses/[slug]'>) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const [dict, course, siteSettings, allCourses] = await Promise.all([
    getDictionary(locale),
    getPublishedCourseBySlug(locale, slug),
    getSiteSettings(locale),
    getPublishedCourses(locale),
  ])

  // Deliberately not distinguishing "no such slug" from "matches an
  // unpublished course" — access.read on Courses already restricts the
  // query above to published documents (see queries.ts), so both cases
  // reach here identically and both produce a plain 404, never a
  // partial/broken render and never a hint that a draft exists.
  if (!course) notFound()

  const faqs = await getPublishedFAQsForCourse(locale, course.id)
  const tones = computeSectionTones(course, faqs.length > 0)

  const c = dict.course
  // 'unspecified' (the safe default — see Courses.ts) shows no badge,
  // same as 'open': neither asserts a claim to the visitor either
  // way. Only a deliberately-set closed/comingSoon/full shows one.
  const statusBadge =
    course.enrollmentState === 'closed'
      ? c.enrollmentClosed
      : course.enrollmentState === 'comingSoon'
        ? c.enrollmentComingSoon
        : course.enrollmentState === 'full'
          ? c.enrollmentFull
          : null

  const courseUrl = absoluteUrl(`/${locale}/courses/${slug}`)
  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription,
    url: courseUrl,
    provider: {
      '@type': 'Organization',
      name: `${dict.common.brandMark} ${dict.common.brandSubtitle}`,
    },
    inLanguage: locale,
    ...(course.heroImage.src ? { image: absoluteUrl(course.heroImage.src) } : {}),
    // No Offer/AggregateRating/Review/CourseInstance/duration, and no
    // certification claim — none of that is truthfully known yet (all
    // 3 real courses currently have certificationType: 'none'). Add a
    // credential property here only once a real course actually has
    // one, not speculatively.
  }

  // Home → course, 2 levels only — deliberately no "Courses" middle
  // step: CourseBreadcrumb's own visual link goes to `/{locale}#courses`
  // (the homepage itself, see that component), not a separate
  // `/courses` page that doesn't exist. A BreadcrumbList step must be
  // a real, distinct page; pretending one exists would misrepresent
  // the site's actual structure.
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: c.breadcrumbHome, url: absoluteUrl(`/${locale}`) },
    { name: course.title, url: courseUrl },
  ])

  return (
    <>
      <script {...jsonLdScriptProps(courseJsonLd)} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />

      <CourseHero
        locale={locale}
        title={course.title}
        shortDescription={course.shortDescription}
        heroImage={course.heroImage}
        ctaLabel={course.ctaLabel ?? dict.nav.apply}
        statusBadge={statusBadge}
        breadcrumbNavLabel={c.breadcrumbNav}
        breadcrumbHomeLabel={c.breadcrumbHome}
        breadcrumbCoursesLabel={c.breadcrumbCourses}
      />

      {tones.overview && (
        <CourseOverview
          description={course.description}
          audience={course.audience}
          overviewHeading={c.overviewHeading}
          audienceHeading={c.audienceHeading}
          tone={tones.overview}
        />
      )}

      {tones.outcomes && (
        <CourseOutcomes outcomes={course.outcomes} heading={c.outcomesHeading} tone={tones.outcomes} />
      )}

      {tones.curriculum && (
        <CourseCurriculum modules={course.curriculum} heading={c.curriculumHeading} tone={tones.curriculum} />
      )}

      {tones.gallery && (
        <CourseGallery images={course.gallery} heading={c.galleryHeading} tone={tones.gallery} />
      )}

      {tones.practicalInfo && (
        <CoursePracticalInfo
          duration={course.duration}
          scheduleInfo={course.scheduleInfo}
          pricing={course.pricing}
          certificationType={course.certificationType}
          heading={c.practicalInfoHeading}
          durationLabel={c.durationLabel}
          scheduleLabel={c.scheduleLabel}
          priceLabel={c.priceLabel}
          certificationLabel={c.certificationLabel}
          certificationText={c.certificationText}
          pricingOnRequest={c.pricingOnRequest}
          pricingStartingFrom={c.pricingStartingFrom}
          tone={tones.practicalInfo}
        />
      )}

      {faqs.length > 0 && (
        <FAQSection copy={{ eyebrow: c.faqEyebrow, heading: c.faqHeading }} items={faqs} />
      )}

      <ApplyCTA
        copy={{ eyebrow: c.applyEyebrow, heading: c.applyHeading, body: c.applyBody }}
        ctaLabel={course.ctaLabel ?? dict.nav.apply}
        whatsappLabel={dict.footer.whatsapp}
        whatsappNumber={siteSettings.whatsappNumber}
        locale={locale}
        courses={allCourses}
        preselectedCourseSlug={course.slug}
        applyFormDict={dict.applyForm}
      />
    </>
  )
}

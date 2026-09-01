import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/getDictionary'
import {
  getPublishedCourseBySlug,
  getPublishedFAQsForCourse,
  getSiteSettings,
  type CourseDetail,
} from '@/lib/payload/queries'
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
  if (!course) return {}

  // Plain string, not `${course.title} · ${brandMark}` — the root
  // layout's generateMetadata already sets a `title.template`
  // ('%s · SHE'), which Next applies to any plain-string child title.
  // Appending the brand suffix here too produced a real, verified bug:
  // "Cosmetics 1 · SHE · SHE".
  const title = course.metaTitle || course.title
  const description =
    course.metaDescription || siteSettings.defaultSeo.metaDescription || course.shortDescription

  // No production domain is configured yet (see docs/IMPLEMENTATION_PLAN.md,
  // Milestone H) — relative paths rather than a fabricated absolute one.
  const path = `/${locale}/courses/${slug}`
  const alternateLocales = ['ar', 'he', 'en'] as const

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: Object.fromEntries(alternateLocales.map((l) => [l, `/${l}/courses/${slug}`])),
    },
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

  const [dict, course, siteSettings] = await Promise.all([
    getDictionary(locale),
    getPublishedCourseBySlug(locale, slug),
    getSiteSettings(locale),
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
  const statusBadge =
    course.enrollmentState === 'open'
      ? null
      : course.enrollmentState === 'closed'
        ? c.enrollmentClosed
        : course.enrollmentState === 'comingSoon'
          ? c.enrollmentComingSoon
          : c.enrollmentFull

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDescription,
    provider: {
      '@type': 'Organization',
      name: `${dict.common.brandMark} ${dict.common.brandSubtitle}`,
    },
    inLanguage: locale,
    ...(course.heroImage.src ? { image: course.heroImage.src } : {}),
  }

  // Escapes `<` so a `</script>` (or similar) inside CMS-entered text
  // (title, shortDescription) can't prematurely close this tag — staff
  // are trusted, but this costs nothing and matches Next's own
  // documented JSON-LD safety guidance.
  const jsonLdString = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />

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
      />
    </>
  )
}

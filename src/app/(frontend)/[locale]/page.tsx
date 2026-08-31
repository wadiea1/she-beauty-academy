import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/getDictionary'
import { getHomepage, getPublishedCourses, getPublishedFAQs, getSiteSettings } from '@/lib/payload/queries'
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
      />
      <SocialProof
        eyebrow={dict.footer.connect}
        heading={dict.footer.instagram}
        instagramHandle={siteSettings.instagramHandle}
        brandName={`${dict.common.brandMark} ${dict.common.brandSubtitle}`}
      />
    </>
  )
}

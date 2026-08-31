import { notFound } from 'next/navigation'
import { isLocale } from '@/i18n/config'
import { getDictionary } from '@/i18n/getDictionary'
import { homepageCopy } from '@/content/homepage'
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

  const dict = await getDictionary(locale)
  const copy = homepageCopy[locale]

  return (
    <>
      <Hero copy={copy.hero} />
      <Manifesto copy={copy.manifesto} />
      <WhySHE copy={copy.whySHE} />
      <Courses copy={copy.courses} ctaLabel={dict.nav.apply} locale={locale} />
      <InsideAcademy copy={copy.insideAcademy} />
      <WhatYouLeaveWith copy={copy.whatYouLeaveWith} />
      <InstructorCredibility copy={copy.instructor} />
      <FAQSection copy={copy.faq} />
      <ApplyCTA copy={copy.apply} whatsappLabel={dict.footer.whatsapp} locale={locale} />
      <SocialProof eyebrow={dict.footer.connect} heading={dict.footer.instagram} />
    </>
  )
}

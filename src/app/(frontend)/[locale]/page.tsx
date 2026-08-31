import { notFound } from 'next/navigation'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { getDictionary } from '@/i18n/getDictionary'
import { isLocale, type Locale } from '@/i18n/config'
import { whatsappHref } from '@/config/site'

// Placeholder homepage for Milestone B/C (i18n routing + navigation).
// The full editorial narrative (manifesto, inside-the-academy imagery,
// instructor credibility, real FAQ copy, etc.) is Milestone D — this
// exists so every nav anchor (#courses / #academy / #faq / #apply)
// resolves to something real today, using only confirmed, non-fabricated
// content (the 3 actual current courses, no invented claims).

const heroCopy: Record<Locale, { eyebrow: string; lead: string }> = {
  ar: {
    eyebrow: 'أكاديمية تعليم تجميل متميزة',
    lead: 'مساحة مدروسة للنساء اللواتي يأخذن حرفتهن على محمل الجد — تعليم تجميل احترافي بمعايير عالمية.',
  },
  he: {
    eyebrow: 'אקדמיה מקצועית ליופי',
    lead: 'מרחב מוקפד לנשים שמתייחסות למקצוע שלהן ברצינות — לימודי קוסמטיקה מקצועיים בסטנדרט בינלאומי.',
  },
  en: {
    eyebrow: 'A premium cosmetics academy',
    lead: 'A considered space for women who take their craft seriously — professional cosmetics education, built to an international standard.',
  },
}

const courseNames: Record<Locale, [string, string, string]> = {
  ar: ['كوزماتيكس 1', 'كوزماتيكس 2', 'العلامة التجارية والذكاء الاصطناعي لأصحاب أعمال التجميل'],
  he: ['קוסמטיקה 1', 'קוסמטיקה 2', 'מיתוג ובינה מלאכותית לעסקי יופי'],
  en: ['Cosmetics 1', 'Cosmetics 2', 'Branding & AI for Beauty Businesses'],
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = await getDictionary(locale)
  const hero = heroCopy[locale]
  const courses = courseNames[locale]

  return (
    <>
      <Section tone="porcelain" spacing="lg">
        <Container width="editorial">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <Heading as="h1" size="display" className="mt-6 max-w-3xl">
            {dict.common.tagline}
          </Heading>
          <Text size="lg" className="mt-6 max-w-xl">
            {hero.lead}
          </Text>
          <Button href="#apply" size="lg" className="mt-8">
            {dict.nav.apply}
          </Button>
        </Container>
      </Section>

      <Section id="courses" tone="shell" spacing="md">
        <Container width="editorial">
          <Eyebrow>{dict.nav.courses}</Eyebrow>
          <Heading as="h2" size="lg" className="mt-4 mb-10">
            {dict.nav.courses}
          </Heading>
          <div className="grid gap-8 sm:grid-cols-3">
            {courses.map((name) => (
              <div
                key={name}
                className="rounded-[var(--radius-panel)] border border-champagne/60 bg-porcelain p-6"
              >
                <Text size="lg" className="font-display">
                  {name}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="academy" tone="porcelain" spacing="md">
        <Container width="reading">
          <Eyebrow>{dict.nav.academy}</Eyebrow>
          <Heading as="h2" size="lg" className="mt-4 mb-6">
            {dict.nav.academy}
          </Heading>
          <Text size="lg">{hero.lead}</Text>
        </Container>
      </Section>

      <Section id="faq" tone="shell" spacing="md">
        <Container width="reading">
          <Eyebrow>{dict.nav.faq}</Eyebrow>
          <Heading as="h2" size="lg" className="mt-4">
            {dict.nav.faq}
          </Heading>
        </Container>
      </Section>

      <Section id="apply" tone="ink" spacing="lg">
        <Container width="reading" className="text-center">
          <Heading as="h2" size="lg" className="mb-6">
            {dict.common.tagline}
          </Heading>
          <Button href={whatsappHref() ?? `/${locale}#apply`} variant="inverse" size="lg">
            {dict.nav.apply}
          </Button>
        </Container>
      </Section>
    </>
  )
}

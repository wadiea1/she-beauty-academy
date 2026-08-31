// Idempotent Payload content seed. Run with:
//   pnpm seed
// (or directly: pnpm exec payload run src/seed/seed.ts)
//
// Migrates the copy already approved and live on the site — originally
// authored in src/content/homepage.ts (Milestone D), extracted verbatim
// into ./content.json so this script owns it independently and stays
// re-runnable even after that file is retired. Not a new copywriting
// pass: every string here is exactly what was already on the page.
//
// Safe to run repeatedly: Courses/FAQs are matched by a stable,
// non-localized key (slug / order) before creating, so re-running never
// duplicates records. Homepage/Navigation are singleton globals —
// re-applying the same values is inherently idempotent — but their
// array sub-fields (pillars, points, bio, images, nav items) need their
// row ids threaded across the three locale-scoped update calls, or each
// locale would create its own duplicate set of rows instead of filling
// in the same one (see attachIds below).
import { getPayload } from 'payload'
import config from '../payload.config'
import content from './content.json'
import { locales, type Locale } from '../i18n/config'

type ContentShape = typeof content
type LocaleContent = ContentShape[Locale]

const navLabels: Record<Locale, { home: string; courses: string; academy: string; faq: string }> = {
  ar: { home: 'الرئيسية', courses: 'الدورات', academy: 'عن الأكاديمية', faq: 'الأسئلة الشائعة' },
  he: { home: 'בית', courses: 'קורסים', academy: 'על האקדמיה', faq: 'שאלות נפוצות' },
  en: { home: 'Home', courses: 'Courses', academy: 'The Academy', faq: 'FAQ' },
}
const navPaths = ['/', '#courses', '#academy', '#faq'] as const
const navKeys = ['home', 'courses', 'academy', 'faq'] as const

/** Zips freshly-mapped row data with existing row ids positionally, so
 * updating locale N+1 fills in the same rows locale N created instead of
 * appending new ones. `existing` should come from the response of the
 * previous locale's update (or the pre-seed fetch, for the first pass). */
function attachIds<T extends object>(items: T[], existing: { id?: string | null }[] | undefined | null): T[] {
  return items.map((item, i) => {
    const id = existing?.[i]?.id
    return id ? ({ ...item, id } as T) : item
  })
}

function mapHomepageData(locale: Locale, existing: Record<string, unknown> | null) {
  const c: LocaleContent = content[locale]
  const ex = (path: string): { id?: string | null }[] | undefined => {
    const parts = path.split('.')
    let cur: unknown = existing
    for (const part of parts) {
      cur = cur && typeof cur === 'object' ? (cur as Record<string, unknown>)[part] : undefined
    }
    return Array.isArray(cur) ? (cur as { id?: string | null }[]) : undefined
  }

  return {
    hero: { eyebrow: c.hero.eyebrow, heading: c.hero.heading, lead: c.hero.lead },
    manifesto: { eyebrow: c.manifesto.eyebrow, heading: c.manifesto.heading, body: c.manifesto.body },
    whySHE: {
      eyebrow: c.whySHE.eyebrow,
      heading: c.whySHE.heading,
      pillars: attachIds(
        c.whySHE.pillars.map((p) => ({ title: p.title, body: p.body })),
        ex('whySHE.pillars'),
      ),
    },
    coursesIntro: { eyebrow: c.courses.eyebrow, heading: c.courses.heading, intro: c.courses.intro },
    insideAcademy: {
      eyebrow: c.insideAcademy.eyebrow,
      heading: c.insideAcademy.heading,
      body: c.insideAcademy.body,
      images: attachIds(
        c.insideAcademy.imageAlts.map((alt) => ({ placeholderLabel: alt })),
        ex('insideAcademy.images'),
      ),
    },
    whatYouLeaveWith: {
      eyebrow: c.whatYouLeaveWith.eyebrow,
      heading: c.whatYouLeaveWith.heading,
      points: attachIds(
        c.whatYouLeaveWith.points.map((text) => ({ text })),
        ex('whatYouLeaveWith.points'),
      ),
    },
    instructor: {
      eyebrow: c.instructor.eyebrow,
      heading: c.instructor.heading,
      role: c.instructor.role,
      bio: attachIds(
        c.instructor.bio.map((paragraph) => ({ paragraph })),
        ex('instructor.bio'),
      ),
      photoAlt: c.instructor.imageAlt,
    },
    faqIntro: { eyebrow: c.faq.eyebrow, heading: c.faq.heading },
    apply: { eyebrow: c.apply.eyebrow, heading: c.apply.heading, body: c.apply.body },
  }
}

async function upsertCourse(payload: Awaited<ReturnType<typeof getPayload>>, index: number) {
  const slug = content.en.courses.items[index].slug
  const dataFor = (locale: Locale) => {
    const item = content[locale].courses.items[index]
    return { title: item.title, shortDescription: item.description }
  }

  const existing = await payload.find({
    collection: 'courses',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  let id: number
  if (existing.totalDocs > 0) {
    id = existing.docs[0]!.id
    console.log(`  Course "${slug}" already exists (id ${id}) — refreshing content.`)
  } else {
    const created = await payload.create({
      collection: 'courses',
      locale: 'ar',
      overrideAccess: true,
      data: {
        slug,
        status: 'draft',
        order: index + 1,
        pricingType: 'onRequest', // no real pricing exists — never fabricated
        enrollmentState: 'open',
        ...dataFor('ar'),
      },
    })
    id = created.id
    console.log(`  Course "${slug}" created (id ${id}).`)
  }

  for (const locale of locales) {
    await payload.update({ collection: 'courses', id, locale, overrideAccess: true, data: dataFor(locale) })
  }
  await payload.update({
    collection: 'courses',
    id,
    locale: 'en',
    overrideAccess: true,
    data: { status: 'published' },
  })
  console.log(`  Course "${slug}" published.`)
}

async function upsertFaq(payload: Awaited<ReturnType<typeof getPayload>>, index: number) {
  const orderValue = index + 1
  const dataFor = (locale: Locale) => {
    const item = content[locale].faq.items[index]
    return { question: item.question, answer: item.answer }
  }

  const existing = await payload.find({
    collection: 'faqs',
    where: { order: { equals: orderValue } },
    limit: 1,
    overrideAccess: true,
  })

  let id: number
  if (existing.totalDocs > 0) {
    id = existing.docs[0]!.id
    console.log(`  FAQ #${orderValue} already exists (id ${id}) — refreshing content.`)
  } else {
    const created = await payload.create({
      collection: 'faqs',
      locale: 'ar',
      overrideAccess: true,
      data: { status: 'draft', order: orderValue, ...dataFor('ar') },
    })
    id = created.id
    console.log(`  FAQ #${orderValue} created (id ${id}).`)
  }

  for (const locale of locales) {
    await payload.update({ collection: 'faqs', id, locale, overrideAccess: true, data: dataFor(locale) })
  }
  await payload.update({ collection: 'faqs', id, locale: 'en', overrideAccess: true, data: { status: 'published' } })
  console.log(`  FAQ #${orderValue} published.`)
}

async function seedHomepage(payload: Awaited<ReturnType<typeof getPayload>>) {
  let existing: Record<string, unknown> | null = (await payload
    .findGlobal({ slug: 'homepage', draft: true, overrideAccess: true })
    .catch(() => null)) as unknown as Record<string, unknown> | null

  for (const locale of locales) {
    const updated = await payload.updateGlobal({
      slug: 'homepage',
      locale,
      draft: true,
      overrideAccess: true,
      data: { ...mapHomepageData(locale, existing), _status: 'draft' },
    })
    existing = updated as unknown as Record<string, unknown>
    console.log(`  Homepage draft saved for locale "${locale}".`)
  }

  await payload.updateGlobal({
    slug: 'homepage',
    locale: 'en',
    overrideAccess: true,
    data: { _status: 'published' },
  })
  console.log('  Homepage published.')
}

async function seedNavigation(payload: Awaited<ReturnType<typeof getPayload>>) {
  let existingItems: { id?: string | null }[] | undefined = (
    await payload.findGlobal({ slug: 'navigation', draft: true, overrideAccess: true }).catch(() => null)
  )?.items ?? undefined

  for (const locale of locales) {
    const items = attachIds(
      navKeys.map((key, i) => ({
        label: navLabels[locale][key],
        path: navPaths[i],
        openInNewTab: false,
      })),
      existingItems,
    )
    const updated = await payload.updateGlobal({
      slug: 'navigation',
      locale,
      draft: true,
      overrideAccess: true,
      data: { items, _status: 'draft' },
    })
    existingItems = updated.items ?? existingItems
    console.log(`  Navigation draft saved for locale "${locale}".`)
  }

  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    overrideAccess: true,
    data: { _status: 'published' },
  })
  console.log('  Navigation published.')
}

async function main() {
  const payload = await getPayload({ config })

  console.log('=== Seeding Courses ===')
  for (let i = 0; i < content.en.courses.items.length; i++) {
    await upsertCourse(payload, i)
  }

  console.log('\n=== Seeding FAQs ===')
  for (let i = 0; i < content.en.faq.items.length; i++) {
    await upsertFaq(payload, i)
  }

  console.log('\n=== Seeding Homepage ===')
  await seedHomepage(payload)

  console.log('\n=== Seeding Navigation ===')
  await seedNavigation(payload)

  console.log('\n=== Verifying ===')
  const [courseCount, faqCount, testimonialCount, userCount] = await Promise.all([
    payload.count({ collection: 'courses', overrideAccess: true }),
    payload.count({ collection: 'faqs', overrideAccess: true }),
    payload.count({ collection: 'testimonials', overrideAccess: true }),
    payload.count({ collection: 'users', overrideAccess: true }),
  ])
  console.log(`  Courses: ${courseCount.totalDocs} (expected 3)`)
  console.log(`  FAQs: ${faqCount.totalDocs} (expected 5)`)
  console.log(`  Testimonials: ${testimonialCount.totalDocs} (expected 0 — architecture only, never seeded)`)
  console.log(`  Users: ${userCount.totalDocs} (unaffected by this seed)`)

  console.log('\nSeed complete.')
  process.exit(0)
}

// Top-level await, not a floating `main().catch(...)`: `payload run` does
// a bare `await import(scriptPath)`, which only waits for *module
// evaluation* to finish. Without this await, evaluation completes the
// instant main() is called (before any of its internal awaits resolve),
// so the process can exit mid-seed with zero output — reproduced this
// exact failure (silent no-op, exit code 0) before adding it.
await main().catch((err) => {
  console.error(err)
  process.exit(1)
})

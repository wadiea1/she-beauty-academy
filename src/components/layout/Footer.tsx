import Link from 'next/link'
import { cn } from '@/lib/cn'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { Text } from '@/components/ui/Text'
import { Rule } from '@/components/ui/Rule'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { InstagramIcon } from '@/components/icons/InstagramIcon'
import { siteConfig, whatsappHref, instagramHref } from '@/config/site'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/types'

interface FooterProps {
  locale: Locale
  dict: Dictionary
}

const exploreKeys = ['courses', 'academy', 'faq'] as const
const exploreHashes: Record<(typeof exploreKeys)[number], string> = {
  courses: '#courses',
  academy: '#academy',
  faq: '#faq',
}

/** Server Component — nothing here needs client interactivity. WhatsApp
 * and Instagram links only render once real values land in
 * `src/config/site.ts`, so a placeholder can never masquerade as a real
 * contact channel. */
export function Footer({ locale, dict }: FooterProps) {
  const homeHref = `/${locale}`
  const whatsapp = whatsappHref()
  const instagram = instagramHref()
  const hasConnect = Boolean(whatsapp || instagram)
  const year = new Date().getFullYear()

  return (
    <Section as="footer" tone="ink" spacing="sm">
      <Container width="editorial">
        <div className={cn('grid gap-12', hasConnect ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
          <div>
            <Link href={homeHref} className="flex flex-col leading-none">
              <span className="font-display text-2xl tracking-wide text-porcelain">
                {dict.common.brandMark}
              </span>
              <span className="font-body text-[0.6875rem] text-champagne">
                {dict.common.brandSubtitle}
              </span>
            </Link>
            <Text size="sm" className="mt-4 max-w-xs text-blush">
              {dict.common.tagline}
            </Text>
          </div>

          <div>
            <Text size="sm" className="mb-4 font-medium text-champagne">
              {dict.footer.explore}
            </Text>
            <ul className="flex flex-col gap-3">
              {exploreKeys.map((key) => (
                <li key={key}>
                  <Link
                    href={`${homeHref}${exploreHashes[key]}`}
                    className="font-body text-sm text-porcelain/90 transition-colors hover:text-champagne"
                  >
                    {dict.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {hasConnect && (
            <div>
              <Text size="sm" className="mb-4 font-medium text-champagne">
                {dict.footer.connect}
              </Text>
              <ul className="flex flex-col gap-3">
                {whatsapp && (
                  <li>
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-body text-sm text-porcelain/90 transition-colors hover:text-champagne"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      {dict.footer.whatsapp}
                    </a>
                  </li>
                )}
                {instagram && (
                  <li>
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 font-body text-sm text-porcelain/90 transition-colors hover:text-champagne"
                    >
                      <InstagramIcon className="h-4 w-4" />
                      {dict.footer.instagram}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <Rule tone="champagne" className="my-10 opacity-30" />

        <Text size="xs" className="text-blush">
          © {year} {siteConfig.name}. {dict.footer.rightsReserved}
        </Text>
      </Container>
    </Section>
  )
}

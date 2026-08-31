'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { locales, localeMeta, type Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/types'
import type { NavItem } from '@/lib/payload/queries'

interface NavigationProps {
  locale: Locale
  dict: Dictionary
  navItems: NavItem[]
}

function itemHref(homeHref: string, item: NavItem) {
  return item.path === '/' ? homeHref : `${homeHref}${item.path}`
}

/**
 * Site header: desktop nav + language switcher + Apply CTA, collapsing
 * into an accessible full-screen drawer on mobile. Client Component
 * because the mobile toggle and language switcher both need interactivity
 * — the rest of the page stays server-rendered. `navItems` comes from
 * Payload's Navigation global, fetched server-side in the locale layout
 * and passed down — this component never talks to Payload itself.
 */
export function Navigation({ locale, dict, navItems }: NavigationProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const menuId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const toggleButtonRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.documentElement.style.overflow
    const triggerElement = toggleButtonRef.current
    document.documentElement.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.documentElement.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      triggerElement?.focus()
    }
  }, [open])

  function localizedPath(target: Locale) {
    const rest = pathname.replace(/^\/(ar|he|en)/, '')
    return `/${target}${rest}`
  }

  const homeHref = `/${locale}`

  return (
    // Fragment, not a single wrapper: `backdrop-blur` below applies a
    // `backdrop-filter`, which (like `transform`) makes its element a
    // containing block for `position: fixed` descendants. The drawer must
    // be a *sibling* of <header>, not nested inside it, or its `inset-0`
    // resolves against the header's own ~80px box instead of the viewport.
    <>
      <header className="sticky top-0 z-40 border-b border-champagne/60 bg-porcelain/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[var(--container-editorial)] items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
          <Link href={homeHref} className="group flex flex-col leading-none">
            <span className="font-display text-2xl tracking-wide text-ink transition-colors group-hover:text-rosewood-ink">
              {dict.common.brandMark}
            </span>
            <span className="font-body text-[0.6875rem] text-rosewood-ink">
              {dict.common.brandSubtitle}
            </span>
          </Link>

          <nav aria-label={dict.nav.primaryNav} className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={itemHref(homeHref, item)}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                className="group relative inline-block py-1 font-body text-sm text-cocoa transition-colors hover:text-rosewood-ink"
              >
                {item.label}
                {/* Symmetric center-out expansion, not a directional
                 * sweep — reads identically in RTL and LTR without
                 * needing a logical-property flip. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-0.5 h-px origin-center scale-x-0 bg-rosewood-ink transition-transform duration-300 group-hover:scale-x-100"
                />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            <LanguageSwitcher locale={locale} localizedPath={localizedPath} />
            <Button href={`${homeHref}#apply`} size="sm">
              {dict.nav.apply}
            </Button>
          </div>

          <button
            ref={toggleButtonRef}
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-[var(--radius-panel)] p-2 font-body text-sm text-cocoa md:hidden"
          >
            <span aria-hidden="true" className="flex flex-col gap-1.5">
              <span className="h-px w-6 bg-cocoa" />
              <span className="h-px w-6 bg-cocoa" />
            </span>
            {dict.nav.openMenu}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="dialog"
            aria-modal="true"
            aria-label={dict.nav.menuLabel}
            className="fixed inset-0 z-50 flex flex-col bg-porcelain md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <span className="font-display text-2xl text-ink">{dict.common.brandMark}</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-panel)] p-2 font-body text-sm text-cocoa"
              >
                {dict.nav.closeMenu}
              </button>
            </div>

            <nav
              aria-label={dict.nav.primaryNav}
              className="flex flex-1 flex-col items-start justify-center gap-6 px-8"
            >
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={itemHref(homeHref, item)}
                  target={item.openInNewTab ? '_blank' : undefined}
                  rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                  onClick={() => setOpen(false)}
                  className="font-display text-3xl text-ink transition-colors hover:text-rosewood-ink"
                >
                  {item.label}
                </Link>
              ))}
              <Button
                href={`${homeHref}#apply`}
                size="lg"
                className="mt-4"
                onClick={() => setOpen(false)}
              >
                {dict.nav.apply}
              </Button>
            </nav>

            <div className="flex justify-center gap-6 px-8 py-8">
              <LanguageSwitcher locale={locale} localizedPath={localizedPath} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function LanguageSwitcher({
  locale,
  localizedPath,
}: {
  locale: Locale
  localizedPath: (target: Locale) => string
}) {
  return (
    <div className="flex items-center gap-3 font-body text-sm">
      {locales.map((target) => (
        <Link
          key={target}
          href={localizedPath(target)}
          aria-current={target === locale ? 'true' : undefined}
          className={cn(
            'transition-colors',
            target === locale ? 'font-semibold text-ink' : 'text-rosewood-ink hover:text-cocoa',
          )}
        >
          {localeMeta[target].label}
        </Link>
      ))}
    </div>
  )
}

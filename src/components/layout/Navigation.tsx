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
  const headerRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.documentElement.style.overflow
    const triggerElement = toggleButtonRef.current
    document.documentElement.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    // Real focus trap: `inert` removes the header/main/footer from the
    // tab order (and from AT navigation) entirely while the dialog is
    // open, rather than just visually covering them. Verified this
    // was a genuine gap, not a theoretical one — before this fix,
    // Tab-ing through every focusable element inside the open drawer
    // (close button, nav links, Apply button, language switcher) then
    // continued straight into the Hero section's own "Book a
    // Consultation" button underneath, fully escaping the modal.
    // `<main>`/`<footer>` are siblings of this component (in the
    // locale layout, not local children), so they're reached via a
    // DOM query rather than a ref — there's exactly one of each on
    // every public page.
    const header = headerRef.current
    const main = document.querySelector('main')
    const footer = document.querySelector('footer')
    header?.setAttribute('inert', '')
    main?.setAttribute('inert', '')
    footer?.setAttribute('inert', '')

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      // Full Tab-cycling within the dialog, not just the inert-based
      // "can't reach hidden content" guarantee above — Shift+Tab from
      // the first element wraps to the last, and Tab from the last
      // wraps to the first, matching the WAI-ARIA APG dialog pattern.
      // With every other landmark inert, browsers already send
      // Tab-off-the-end to a benign, inert `document.body` rather
      // than anywhere interactive — this is the remaining UX polish
      // on top of that real security/usability fix, not a second
      // instance of the same bug.
      if (event.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.documentElement.style.overflow = previousOverflow
      header?.removeAttribute('inert')
      main?.removeAttribute('inert')
      footer?.removeAttribute('inert')
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
      <header ref={headerRef} className="sticky top-0 z-40 border-b border-champagne/60 bg-porcelain/90 backdrop-blur-sm">
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
            {/* A same-page anchor, not a locale-prefixed path — see
             * ApplyCTA.tsx (Milestone I). `/${locale}#apply` only
             * worked by coincidence from the homepage; from a course
             * page it would navigate away instead of scrolling to
             * that page's own form. */}
            <Button href="#apply" size="sm">
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
            ref={dialogRef}
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
              <Button href="#apply" size="lg" className="mt-4" onClick={() => setOpen(false)}>
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

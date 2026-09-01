'use client'

import { useId, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Heading } from '@/components/ui/Heading'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import type { Locale } from '@/i18n/config'
import type { Dictionary } from '@/i18n/dictionaries/types'

interface CourseOption {
  slug: string
  title: string
}

interface ApplicationFormProps {
  locale: Locale
  courses: CourseOption[]
  /** Set on a course page — preselects that course, still editable. */
  preselectedCourseSlug?: string | null
  dict: Dictionary['applyForm']
  /** The site's one recurring CTA action label ("Book a
   * Consultation") — reused as the submit button text rather than a
   * dedicated dictionary string, matching how Hero/Nav/CourseCard
   * already share it. */
  submitLabel: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

interface FieldErrors {
  name?: string
  phone?: string
  email?: string
  privacyConsent?: string
}

// Mirrors the server's Zod rules closely enough for immediate,
// localized feedback — not the security boundary itself (the server
// re-validates everything regardless), so it doesn't need to match
// byte-for-byte.
const hasLetter = /\p{L}/u
const phonePattern = /^[\d\s+\-().]+$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(input: {
  name: string
  phone: string
  email: string
  privacyConsentGiven: boolean
}): FieldErrors {
  const errors: FieldErrors = {}

  const name = input.name.trim()
  if (name.length < 2 || !hasLetter.test(name)) errors.name = 'name'

  const phone = input.phone.trim()
  const digitCount = (phone.match(/\d/g) ?? []).length
  if (phone.length < 6 || !phonePattern.test(phone) || digitCount < 6) errors.phone = 'phone'

  const email = input.email.trim()
  if (email && !emailPattern.test(email)) errors.email = 'email'

  if (!input.privacyConsentGiven) errors.privacyConsent = 'privacyConsent'

  return errors
}

/**
 * The one reusable lead form — rendered inside ApplyCTA on both the
 * homepage and every course page. Client Component because it's
 * genuinely interactive (form state, fetch, focus management); the
 * course list and any preselection are passed in as plain props from
 * the Server Component that renders it, not fetched here.
 */
export function ApplicationForm({ locale, courses, preselectedCourseSlug, dict, submitLabel }: ApplicationFormProps) {
  const idPrefix = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  // Every field that can be the "first error" (name, phone, email,
  // privacyConsent) is an <input> — the course select and message
  // textarea are never invalid, so this doesn't need a broader type.
  const firstErrorRef = useRef<HTMLInputElement>(null)
  // A plain div, not a ref on <Heading> — Heading isn't wrapped in
  // forwardRef, and while React 19 allows passing `ref` to a plain
  // function component directly, a native DOM element here is the
  // certain way to get a real, focusable, tabIndex-honoring node.
  const successRef = useRef<HTMLDivElement>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (status === 'submitting') return // guards against double-submit

    const form = event.currentTarget
    const data = new FormData(form)
    const input = {
      name: String(data.get('name') ?? ''),
      phone: String(data.get('phone') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      courseSlug: String(data.get('courseSlug') ?? ''),
      marketingConsent: data.get('marketingConsent') === 'on',
      privacyConsentGiven: data.get('privacyConsentGiven') === 'on',
      honeypot: String(data.get('company') ?? ''),
    }

    const errors = validate(input)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setStatus('error')
      // Focus the first invalid field so keyboard/screen-reader users
      // land directly on what needs fixing.
      requestAnimationFrame(() => firstErrorRef.current?.focus())
      return
    }

    setFieldErrors({})
    setStatus('submitting')

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, locale }),
      })

      if (res.ok) {
        setStatus('success')
        requestAnimationFrame(() => successRef.current?.focus())
        return
      }

      setStatus('error')
      setFieldErrors({})
    } catch {
      setStatus('error')
      setFieldErrors({})
    }
  }

  if (status === 'success') {
    return (
      <div ref={successRef} role="status" aria-live="polite" tabIndex={-1} className="text-center outline-none">
        <Heading as="h3" size="md" className="mb-3 text-champagne">
          {dict.successHeading}
        </Heading>
        <Text className="text-blush">{dict.successBody}</Text>
      </div>
    )
  }

  const fieldId = (name: string) => `${idPrefix}-${name}`
  const errorId = (name: string) => `${idPrefix}-${name}-error`
  // Computed once, in DOM order, rather than a chain of "has an error
  // AND none of the earlier fields do" conditions repeated at each
  // field — that pattern is easy to get subtly wrong (a later field
  // missing one clause in its chain silently steals the focus target
  // from an earlier, actually-first error).
  const firstErrorField = (['name', 'phone', 'email', 'privacyConsent'] as const).find(
    (key) => fieldErrors[key],
  )
  // Inlined as `name === firstErrorField ? firstErrorRef : undefined`
  // at each field below, not routed through a helper function — the
  // react-hooks/refs lint rule flags a ref value passed through a
  // plain function call during render (it can't statically prove the
  // function won't dereference `.current`), even though this one only
  // ever returns the ref object itself for JSX to consume.

  const inputClass =
    'w-full rounded-[var(--radius-panel)] border border-porcelain/30 bg-porcelain/5 px-4 py-3 font-body text-porcelain placeholder:text-porcelain/40 transition-colors focus-visible:outline-2 focus-visible:outline-champagne focus:border-champagne'
  const labelClass = 'mb-2 block font-body text-sm font-medium text-champagne'
  const errorClass = 'mt-1.5 text-sm text-blush'

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-lg text-start">
      {status === 'error' && Object.keys(fieldErrors).length === 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 rounded-[var(--radius-panel)] border border-porcelain/30 bg-porcelain/5 p-4"
        >
          <Text size="sm" className="mb-1 font-medium text-champagne">
            {dict.errorHeading}
          </Text>
          <Text size="sm" className="text-blush">
            {dict.errorBody}
          </Text>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId('name')} className={labelClass}>
            {dict.nameLabel}
          </label>
          <input
            ref={firstErrorField === 'name' ? firstErrorRef : undefined}
            id={fieldId('name')}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? errorId('name') : undefined}
            className={inputClass}
          />
          {fieldErrors.name && (
            <p id={errorId('name')} className={errorClass}>
              {dict.nameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('phone')} className={labelClass}>
            {dict.phoneLabel}
          </label>
          <input
            ref={firstErrorField === 'phone' ? firstErrorRef : undefined}
            id={fieldId('phone')}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={30}
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? errorId('phone') : undefined}
            className={inputClass}
          />
          {fieldErrors.phone && (
            <p id={errorId('phone')} className={errorClass}>
              {dict.phoneError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('email')} className={labelClass}>
            {dict.emailLabel} <span className="text-porcelain/50">({dict.emailOptionalNote})</span>
          </label>
          <input
            ref={firstErrorField === 'email' ? firstErrorRef : undefined}
            id={fieldId('email')}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={200}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? errorId('email') : undefined}
            className={inputClass}
          />
          {fieldErrors.email && (
            <p id={errorId('email')} className={errorClass}>
              {dict.emailError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={fieldId('course')} className={labelClass}>
            {dict.courseLabel}
          </label>
          <select
            id={fieldId('course')}
            name="courseSlug"
            defaultValue={preselectedCourseSlug ?? ''}
            className={inputClass}
          >
            <option value="">{dict.courseGeneralOption}</option>
            {courses.map((course) => (
              <option key={course.slug} value={course.slug}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor={fieldId('message')} className={labelClass}>
          {dict.messageLabel} <span className="text-porcelain/50">({dict.messageOptionalNote})</span>
        </label>
        <textarea id={fieldId('message')} name="message" rows={3} maxLength={2000} className={inputClass} />
      </div>

      {/* Honeypot: hidden from sighted and keyboard users (not just
       * visually — aria-hidden and out of tab order too), but present
       * in the DOM for a bot that fills every field it finds. A real
       * visitor never reaches or fills this. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={fieldId('company')}>Company</label>
        <input id={fieldId('company')} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <label className="flex items-start gap-3 font-body text-sm text-porcelain/90">
          <input
            ref={firstErrorField === 'privacyConsent' ? firstErrorRef : undefined}
            type="checkbox"
            name="privacyConsentGiven"
            required
            aria-invalid={Boolean(fieldErrors.privacyConsent)}
            aria-describedby={fieldErrors.privacyConsent ? errorId('privacyConsent') : undefined}
            className="mt-0.5 h-4 w-4 shrink-0 accent-champagne"
          />
          <span>{dict.privacyConsentLabel}</span>
        </label>
        {fieldErrors.privacyConsent && (
          <p id={errorId('privacyConsent')} className={errorClass}>
            {dict.privacyConsentError}
          </p>
        )}

        <label className="flex items-start gap-3 font-body text-sm text-porcelain/90">
          <input
            type="checkbox"
            name="marketingConsent"
            defaultChecked={false}
            className="mt-0.5 h-4 w-4 shrink-0 accent-champagne"
          />
          <span>{dict.marketingConsentLabel}</span>
        </label>
      </div>

      <Button type="submit" variant="inverse" size="lg" fullWidth disabled={status === 'submitting'} className="mt-8">
        {status === 'submitting' ? dict.submittingLabel : status === 'error' ? dict.tryAgain : submitLabel}
      </Button>
    </form>
  )
}

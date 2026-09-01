/** Shared shape every locale dictionary must satisfy. UI chrome only —
 * real content (courses, FAQs, homepage copy) belongs in Payload, not here. */
export interface Dictionary {
  common: {
    /** Kept as the Latin wordmark in every locale, like a proper noun. */
    brandMark: string
    brandSubtitle: string
    tagline: string
  }
  nav: {
    // home/courses/academy/faq link labels live in Payload's Navigation
    // global (Milestone G) — the actual link structure, not fixed
    // interface vocabulary. `apply` stays here: it's the site's one
    // recurring CTA action label, reused identically everywhere.
    apply: string
    openMenu: string
    closeMenu: string
    skipToContent: string
    primaryNav: string
    menuLabel: string
  }
  footer: {
    explore: string
    connect: string
    whatsapp: string
    instagram: string
    rightsReserved: string
  }
  // Fixed interface vocabulary for course detail pages — section
  // headings, status/pricing labels, and the one approved certification
  // sentence. Per-course editorial content (title, description,
  // curriculum, etc.) stays in Payload's Courses collection; this is
  // the recurring chrome around it, identical for all 3 courses.
  course: {
    breadcrumbNav: string
    breadcrumbHome: string
    breadcrumbCourses: string
    overviewHeading: string
    audienceHeading: string
    curriculumHeading: string
    outcomesHeading: string
    practicalInfoHeading: string
    durationLabel: string
    scheduleLabel: string
    priceLabel: string
    certificationLabel: string
    /** The one approved certification claim — see AGENTS.md and
     * docs/IMPLEMENTATION_PLAN.md, Milestone H: never implies licensing,
     * a legal right to open a business, employment, or income. */
    certificationText: string
    galleryHeading: string
    pricingOnRequest: string
    /** "From ₪X" for pricingType: 'startingFrom' — not used by any
     * current course (all are 'onRequest'), kept ready for when real
     * pricing is entered. */
    pricingStartingFrom: string
    enrollmentClosed: string
    enrollmentComingSoon: string
    enrollmentFull: string
    faqEyebrow: string
    faqHeading: string
    applyEyebrow: string
    applyHeading: string
    applyBody: string
    // Deliberately no notFound* here: not-found.tsx receives no props
    // (verified against Next's own docs) and can't import this
    // server-only dictionary from its Client Component — its 3 strings
    // are a small inline table in that file instead.
  }
  // The reusable lead/consultation form (Milestone I) — separate from
  // `course.apply*` above, which is the surrounding section's intro
  // copy (eyebrow/heading/body), not the form itself. Field-level
  // server validation errors are deliberately not surfaced verbatim
  // here for fields the client already validates itself (name/phone/
  // email/privacyConsent) — the client mirrors the server's rules for
  // immediate, localized feedback there, falling back to
  // `genericValidationError` only if a request the client itself
  // would have blocked somehow reaches the server anyway. `courseSlug`
  // is the one field the client genuinely *can't* pre-validate — the
  // dropdown only ever offers real courses, but the server can still
  // reject it (stale page, CMS content changed, a forged request), so
  // `courseUnavailable` is shown whenever the server specifically
  // reports that rejection.
  applyForm: {
    nameLabel: string
    phoneLabel: string
    emailLabel: string
    emailOptionalNote: string
    courseLabel: string
    courseGeneralOption: string
    messageLabel: string
    messageOptionalNote: string
    privacyConsentLabel: string
    marketingConsentLabel: string
    submittingLabel: string
    successHeading: string
    successBody: string
    errorHeading: string
    errorBody: string
    tryAgain: string
    nameError: string
    phoneError: string
    emailError: string
    privacyConsentError: string
    courseUnavailable: string
    genericValidationError: string
  }
}

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
}

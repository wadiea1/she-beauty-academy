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
    home: string
    courses: string
    academy: string
    faq: string
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

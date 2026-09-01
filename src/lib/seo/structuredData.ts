/**
 * Shared JSON-LD helpers. `jsonLdScriptProps` centralizes the
 * `<script type="application/ld+json">` safe-serialization pattern
 * already used by the course page since Milestone H (escaping `<` so
 * CMS-entered text — title, shortDescription, etc. — can't
 * prematurely close the tag with an embedded `</script>`-like
 * string) so every JSON-LD block on the site gets that same
 * protection, not just the one it was first written for.
 */
export function jsonLdScriptProps(data: unknown): { type: string; dangerouslySetInnerHTML: { __html: string } } {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return { type: 'application/ld+json', dangerouslySetInnerHTML: { __html: json } }
}

interface OrganizationInput {
  name: string
  url: string
  locale: string
  /** Real Instagram profile URL only — never fabricated. */
  instagramUrl?: string | null
  email?: string | null
  phone?: string | null
  /** Plain-text address — schema.org's `address` property accepts a
   * string directly; we don't have street/city/region broken into
   * separate fields, so a fabricated PostalAddress would overstate
   * what's actually known. */
  address?: string | null
}

/**
 * `EducationalOrganization` + `WebSite`, combined in one `@graph` —
 * emitted once per page from the root layout, using only currently
 * true facts. Every optional property is included only when the
 * corresponding SiteSettings field is actually set; today, none of
 * them are (see docs/IMPLEMENTATION_PLAN.md, Milestone K audit), so
 * this resolves to just name/url/inLanguage — not a placeholder,
 * exactly what's true right now.
 */
export function buildSiteJsonLd(input: OrganizationInput) {
  const sameAs = input.instagramUrl ? [input.instagramUrl] : undefined

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': `${input.url}#organization`,
        name: input.name,
        url: input.url,
        ...(sameAs ? { sameAs } : {}),
        ...(input.email ? { email: input.email } : {}),
        ...(input.phone ? { telephone: input.phone } : {}),
        ...(input.address ? { address: input.address } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${input.url}#website`,
        name: input.name,
        url: input.url,
        inLanguage: input.locale,
      },
    ],
  }
}

interface BreadcrumbItem {
  name: string
  url: string
}

/** A `BreadcrumbList` reflecting only real, distinct, navigable
 * pages — see CourseBreadcrumb.tsx / the Milestone K docs entry for
 * why a "Courses" listing step is deliberately not included: it
 * isn't a separate page, just an anchor on the homepage. */
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

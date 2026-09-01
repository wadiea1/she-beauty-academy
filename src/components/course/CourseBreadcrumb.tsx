import Link from 'next/link'

interface CourseBreadcrumbProps {
  locale: string
  navLabel: string
  homeLabel: string
  coursesLabel: string
  courseTitle: string
}

/**
 * Home → Courses → [title]. "Courses" links to the homepage's existing
 * Courses section (`#courses`) rather than a dedicated `/courses`
 * listing route — with only 3 courses, that section already *is* the
 * listing; a separate page would duplicate it without adding
 * information architecture value at this content volume.
 */
export function CourseBreadcrumb({ locale, navLabel, homeLabel, coursesLabel, courseTitle }: CourseBreadcrumbProps) {
  const homeHref = `/${locale}`

  return (
    <nav aria-label={navLabel} className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 font-body text-sm text-rosewood-ink">
        <li>
          <Link href={homeHref} className="transition-colors hover:text-cocoa">
            {homeLabel}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={`${homeHref}#courses`} className="transition-colors hover:text-cocoa">
            {coursesLabel}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li aria-current="page" className="font-medium text-cocoa">
          {courseTitle}
        </li>
      </ol>
    </nav>
  )
}

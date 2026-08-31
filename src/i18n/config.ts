export const locales = ['ar', 'he', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'ar'

interface LocaleMeta {
  dir: 'ltr' | 'rtl'
  /** Native-script label, e.g. for a language switcher. */
  label: string
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  ar: { dir: 'rtl', label: 'العربية' },
  he: { dir: 'rtl', label: 'עברית' },
  en: { dir: 'ltr', label: 'English' },
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

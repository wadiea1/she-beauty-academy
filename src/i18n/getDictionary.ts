import 'server-only'
import type { Locale } from './config'
import type { Dictionary } from './dictionaries/types'

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  ar: () => import('./dictionaries/ar').then((m) => m.default),
  he: () => import('./dictionaries/he').then((m) => m.default),
  en: () => import('./dictionaries/en').then((m) => m.default),
}

/** Server-only: dictionaries never ship to the client bundle. */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]()
}

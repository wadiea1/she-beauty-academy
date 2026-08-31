# Typography contract

Components reference two variables only:

- `--font-body` → prose, UI, forms
- `--font-display` → headings, hero, editorial pull-quotes

## Current state

Pre-i18n: system-font fallbacks from `globals.css`.

## Phase 4 locale mapping

- `/ar` → plexArabic + reemKufi
- `/he` → plexHebrew + frankRuhl
- `/en` → plexLatin + bodoniModa

## Hard rules

- Never rely on `text-transform: uppercase`
- Never add letter-spacing to Arabic
- Bodoni Moda is display-only, ≥28px
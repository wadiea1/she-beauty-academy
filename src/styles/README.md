# Typography contract

Components reference two variables only:

- `--font-body` → prose, UI, forms
- `--font-display` → headings, hero, editorial pull-quotes

## Locale mapping

| Locale | Body | Display |
| --- | --- | --- |
| `/ar` | IBM Plex Sans Arabic | **Amiri**, falling through to Bodoni Moda for Latin |
| `/he` | IBM Plex Sans Hebrew | Frank Ruhl Libre |
| `/en` | IBM Plex Sans | Bodoni Moda |

Amiri replaced Reem Kufi in the redesign milestone. Reem Kufi is a Kufi
face — monolinear and geometric, with kashida connectors that stretch
into flat bars at headline sizes. It was both harder to read and less
premium than the Bodoni the Latin locale was already getting.

## Script-aware metrics

Headings and body copy read their size and leading from custom
properties, retuned per script in the `:lang()` blocks of `globals.css`:

- `--heading-{display,xl,lg,md,sm}-size` / `-leading`
- `--heading-scale` — one optical-size knob per script
- `--body-leading`

Component code never branches on locale. Arabic gets 1.36 display
leading (harakat clearance) and a 1.06 optical scale; Hebrew sits
between; Latin stays tight at 1.08.

## Hard rules

- Never rely on `text-transform: uppercase` — Arabic and Hebrew have no
  case, so anything depending on it silently does nothing for two of
  three locales.
- **Never add letter-spacing to Arabic.** It is a connected script;
  tracking breaks the joins between letters. The only `tracking-*` in
  the codebase is on the `SHE` brandmark, which is the Latin string
  "SHE" in every locale's dictionary.
- Bodoni Moda is display-only, >=28px — its hairlines disappear below that.
- Amiri is display-only. Arabic body copy stays on IBM Plex Sans Arabic,
  which is far more comfortable at 14-18px.
- Load Amiri with the Arabic subset only. Its `unicode-range` is what
  lets Latin inside Arabic headings fall through to Bodoni, keeping the
  "SHE" logotype consistent across locales.

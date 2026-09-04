# Photography Brief — SHE Beauty Academy

Every shot below corresponds to a live `ImageFrame` placeholder on the
homepage today (`src/components/sections/*.tsx`, `src/content/homepage.ts`).
Drop a real file into the matching Payload media field once Milestone F/G
connects the CMS, and the placeholder disappears automatically — no layout
change needed.

## Direction

- Premium cosmetics campaign / fashion editorial, not stock-photo beauty
  salon. Natural light where possible, warm neutral tones that sit
  comfortably against the palette (porcelain, shell, blush, champagne,
  rosewood, cocoa, ink) — avoid cool blues/greens and anything neon.
- Real moments over posed smiles-to-camera. Hands doing the work, real
  focus, real texture.
- Both a horizontal *and* a vertical crop of anything used in the hero or
  instructor sections — mobile needs the vertical.

## Shot list

1. **Instructor portrait** (`InstructorCredibility`, portrait ratio)
   Confident, warm, environmental — at her station, not a studio headshot
   against a seamless backdrop.

2. **Instructor demonstrating technique, up close** (`InsideAcademy`)
   Hands + tool + product in frame, mid-technique. This is the shot that
   should read as "she clearly knows what she's doing."

3. **Close-up of tools and products** (`InsideAcademy`)
   Texture-forward: brushes, product textures, a clean station. No brand
   logos of third-party products prominently visible unless cleared.

4. **Students practicing at the station** (`InsideAcademy`)
   Real practice, not posed. Consent required for any recognizable face.

5. **Wide view of the academy studio** (`InsideAcademy`)
   Establishing shot — the room itself, empty or lightly populated.
   Horizontal, editorial composition (rule of thirds, not a real-estate
   listing photo).

6. **Hero supporting image** (`Hero`, portrait ratio)
   Can reuse the instructor portrait or a second signature image — needs
   to work cropped tightly on mobile.

## Slot inventory (added in the redesign milestone)

Every slot below currently renders an art-directed placeholder — a warm
gradient plate with brand line-art and a caption — rather than a blank
rectangle. Replacing one with a real photograph is only ever *passing
`src`*: the `ImageFrame` API, ratio, elevation and reveal animation all
stay exactly as they are, so nothing about the layout shifts when
photography arrives.

| Where | Component | Ratio | Source |
| --- | --- | --- | --- |
| Homepage hero | `sections/Hero` | `portrait` 4:5 | Payload `homepage.hero.image` |
| Inside the academy (mosaic) | `sections/InsideAcademy` | alternating `square` / `portrait` | Payload `homepage.insideAcademy.images[]` |
| Instructor portrait | `sections/InstructorCredibility` | `portrait` 4:5 | Payload `homepage.instructor.image` |
| Course card thumbnails | `ui/CourseCard` | `landscape` 3:2 | **No CMS field yet** — see below |
| Course page hero | `course/CourseHero` | `portrait` 4:5 | Payload course hero image |
| Course gallery | `course/CourseGallery` | `square` / `portrait` | Payload course gallery |
| Instagram strip | `sections/SocialProof` | `square` 1:1 | **No CMS field yet** — decorative |

Two of those have no Payload field behind them yet and would need one
adding before they can hold a real image. That is a deliberate note, not
an oversight: adding a field means a schema change and therefore a new
migration, which belongs in its own reviewed change rather than inside a
visual redesign.

### Shooting to these ratios

Shoot loose. Every slot uses `object-fit: cover`, so the frame crops to
its aspect ratio from the centre — a tightly-framed portrait will lose
the top of the head at 4:5. The mosaic alternates square and portrait in
the same row, so those images need to work at both.

### Placeholder motifs

Four line-art motifs (`arc`, `petal`, `bloom`, `contour`) are assigned
deterministically by index so a grid of empty slots varies rather than
repeating. `contour` is the quietest and is used behind portrait slots,
where a strong motif would compete with the face that eventually
replaces it. None of this survives once `src` is set.

## Not yet needed

Course-detail imagery (per-course galleries) is Milestone H — hold off
shooting that until the course pages exist, so shot selection matches the
actual page layout.

## Consent

Any student or client appearing recognizably needs a signed release before
publishing. Default to hands/tools/product detail shots when in doubt.

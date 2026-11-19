# Brand Wall Editor

A local-only visual editor for the home-page brand wall. It renders the **real**
`BrandWall` and `BrandMark` components against the live published JSON, so the
preview uses the same Cloudinary URLs, sizing algorithm and spacing as the site.

It is a standalone Vite page (`wall-editor.html`) and is **not** part of the
production bundle. It has no Airtable credentials and writes nothing.

## Run

```sh
npm run wall-editor
```

Open the URL Vite prints, normally:

```
http://localhost:3000/wall-editor.html
```

## What it edits

- Directing or Lemon Post (loads that site's live `portfolio-data.json`)
- Dark / light preview
- Total logo height
- Spacing multiplier (section padding + row/column gaps)
- Per-brand `Scale`
- Wall order by dragging directly in the wall:
  - drop **on a logo** to swap the two logos
  - drop **near the edge / between logos** to insert before or after
- Add/remove brands
- Label, layout and colour-on-hover

The selected logo gets a lime chrome; a dashed outline means “swap here”, and a
lime vertical line means “insert here”.

The wall automatically reduces logo size and gaps on tight widths, and packs
rows so the last row never contains a single logo.

The preview reads the published JSON from jsDelivr; use **Reload live** after a
sync to pick up new data.

## Export and apply

**Copy JSON** / **Download JSON** produces a plan containing the exact Airtable
record IDs and field values.

Apply it from the data repo:

```sh
npm run apply:wall -- --plan brand-wall-plan-postproduction.json
```

That is a dry run. Add `--apply` to write:

```sh
npm run apply:wall -- --plan brand-wall-plan-postproduction.json --apply
```

Then run the normal data sync. The plan updates only:

- Settings: `Show Brand Wall`, `Brand Wall Label`, `Brand Wall Layout`,
  `Brands Colour On Hover`, `Brand Wall Logo Height`, `Brand Wall Spacing`,
  `Home Brands`
- Brands: `Scale`

Every other field is left untouched. The script validates record IDs, layout,
numeric ranges and the `Home Brands` order before writing.

## Airtable fields

The editor maps the global controls to the Settings fields
`Brand Wall Logo Height` and `Brand Wall Spacing`; per-brand sizing maps to the
existing `Brand.Scale`. See `../gabriel-portfolio-data/docs/SCHEMA.md`.

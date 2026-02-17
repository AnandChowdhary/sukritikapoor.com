# Shared Task Notes

## Source of Truth

**The original WordPress site at https://sukritikapoor.com is now working again.** Always use the live site as the primary source of truth for all copy, content, and design. Fetch pages directly from sukritikapoor.com to get the correct text — do not paraphrase or rewrite. The Archive.org screenshots in `screenshots/` and saved HTML in `content/` can be used as secondary references.

## Current State

- Astro project scaffolded with Tailwind CSS v4 (`@tailwindcss/vite`) + Typography plugin, fonts loaded (Playfair Display + Inter)
- BaseLayout with fixed left sidebar (23% width), mobile hamburger menu, footer
- Homepage complete with real card images (bookshelf, pen/paper, globe from original site)
- Work listing page (`/work`) complete: 2-column grid of 6 categories
- Work detail pages (`/work/[slug]`) complete: all 6 pages with full content
  - SEO and Editing have content from original site
  - Editing page includes 7 book cover images in 4-column grid
  - Books, Short stories, Print journalism, Proofreading now have researched content
- Prose listing page (`/prose`) and detail page (`/prose/[slug]`) complete
  - "Rent" post with date (Aug 24, 2023), title, and full body text
- **Poetry section complete** - 28 poems now matching live site
  - Poetry listing page (`/poetry`) shows all poems sorted newest-first
  - Poetry detail pages (`/poetry/[slug]`) render each poem with date, title, and body
  - Poems span 2012–2024 (28 total, matching live site count)
- Content collections configured in `src/content.config.ts` (work, poetry, prose)
- All images downloaded from original WordPress server
- Build passes (39 pages), dev server works at localhost:4321
- Visual polish pass completed - all pages visually accurate to original
- GitHub Pages deployment configured (`.github/workflows/deploy.yml`)

### Copy Verification Status

- **Homepage**: Verified ✓ (hero, about, cards all match live site)
- **Work listing**: Verified ✓ (all 6 category titles and descriptions match)
- **Work detail — SEO**: Verified ✓ (body text and all links match)
- **Work detail — Editing**: Verified ✓ (body text matches)
- **Work detail — Books, Short stories, Print journalism, Proofreading**: Not yet verified against live site (these were researched, not copied from live site)
- **Poetry**: All 28 poems now present ✓ (4 added: Unfinished, Till Freedom Comes, Imbalance, Veneration; title fixed for "I am a writer, aren'ttt I?")
- **Prose**: Only "Rent" exists — **14 prose posts still missing** (see next section)

## What's Next (in priority order)

1. **Add 14 missing prose posts** — The live site has 15 prose posts but we only have "Rent". Missing posts (fetch each from live site):
   - "My happy place" (Mar 23, 2022)
   - "Anthill" (Apr 29, 2021)
   - "2020" (Jan 10, 2021)
   - "Day #47478266588267199577291…" (Jun 3, 2020)
   - "10 things I miss about you" (Apr 6, 2020)
   - "Day #7974" (Jul 15, 2019)
   - "Change of Seasons" (Mar 19, 2019)
   - "Forced Connections" (Feb 27, 2019)
   - "Parallel Universes" (Sep 28, 2018)
   - "Chicago" (Oct 25, 2017)
   - "Fitness 101" (May 18, 2017)
   - "Limits" (Apr 7, 2017)
   - "Words" (Mar 22, 2017)
   - "Hello world!" (Mar 20, 2017)
2. **Verify remaining work detail pages** — Fetch Books, Short stories, Print journalism, Proofreading from live site and verify/update copy.
3. **Deployment** — Push latest changes and verify GitHub Pages deployment.

## Key Files

- `src/content.config.ts` - Astro content collections definition
- `src/layouts/BaseLayout.astro` - shared layout (sidebar, header, footer)
- `src/pages/index.astro` - homepage (imports card images)
- `src/pages/work/index.astro` - work listing page
- `src/pages/work/[slug].astro` - work detail dynamic route (includes book cover gallery for editing page)
- `src/pages/prose/index.astro` - prose listing page
- `src/pages/prose/[slug].astro` - prose detail dynamic route
- `src/pages/poetry/index.astro` - poetry listing page
- `src/pages/poetry/[slug].astro` - poetry detail dynamic route
- `src/content/work/*.md` - work content (seo, editing, books, short-stories, print-journalism, proofreading)
- `src/content/prose/rent.md` - "Rent" prose post
- `src/content/poetry/*.md` - 28 poetry files
- `src/assets/images/card-*.png` - homepage card illustrations (512x512)
- `src/assets/images/books/book*.j*` - 7 book cover images for editing page
- `src/styles/global.css` - Tailwind v4 CSS-based config (design tokens via `@theme`, `@plugin` for typography)
- `astro.config.mjs` - Astro config (site, base URL, Tailwind vite plugin)
- `.github/workflows/deploy.yml` - GitHub Actions deployment workflow
- `content/seo.txt`, `content/editing.txt` - original saved HTML content for reference
- `screenshots/` - reference screenshots from Archive.org

## Notes

- Tailwind accent color: `#6244BB` (used for purple buttons)
- Fonts: Playfair Display (serif headings), Inter (sans body)
- Sidebar is `position: fixed` on desktop, hamburger menu on mobile
- Tailwind v4 uses CSS-based config (`src/styles/global.css`) with `@theme` for design tokens and `@plugin` for typography - no JS config file needed
- `@tailwindcss/vite` plugin used in `astro.config.mjs` (replaces old `@astrojs/tailwind` integration)
- Astro config: `site: 'https://AnandChowdhary.github.io'`, `base: '/sukritikapoor.com/'`
- All internal links use `import.meta.env.BASE_URL` to work correctly with the GitHub Pages subpath
- Card images source: `sukritikapoordotcom-wordpress.ams301.anandchowdhary.com/wp-content/uploads/2023/04/out-0*.png`
- Book cover images source: same WordPress domain, various upload paths (see `content/editing.txt`)
- Live site WordPress URL patterns: some poems use numeric slugs (e.g., `/poetry/514/` for Entangled, `/poetry/181/` for Womanhood, `/poetry/175/` for Happyness) — our Astro site uses text slugs instead

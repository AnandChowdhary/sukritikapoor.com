# Shared Task Notes

## Source of Truth

**The original WordPress site at https://sukritikapoor.com is now working again.** Always use the live site as the primary source of truth for all copy, content, and design. Fetch pages directly from sukritikapoor.com to get the correct text — do not paraphrase or rewrite.

## Current State

- Astro project scaffolded with Tailwind CSS v4 (`@tailwindcss/vite`) + Typography plugin, fonts loaded (Playfair Display + Inter)
- BaseLayout with fixed left sidebar (23% width), mobile hamburger menu, footer
- Homepage complete with real card images (bookshelf, pen/paper, globe from original site)
- Work listing page (`/work`) complete: 2-column grid of 6 categories
- Work detail pages (`/work/[slug]`) complete: all 6 pages with full content
  - SEO and Editing have content from original site
  - Editing page includes 7 book cover images in 4-column grid
  - Books, Short stories, Print journalism, Proofreading now have researched content
- **Prose section complete** — all 15 prose posts matching live site
  - Prose listing page (`/prose`) shows all posts sorted newest-first
  - Prose detail pages (`/prose/[slug]`) render each post with date, title, and body
  - Posts span 2017–2023 (15 total, matching live site count)
- **Poetry section complete** — 28 poems now matching live site
  - Poetry listing page (`/poetry`) shows all poems sorted newest-first
  - Poetry detail pages (`/poetry/[slug]`) render each poem with date, title, and body
  - Poems span 2012–2024 (28 total, matching live site count)
- Content collections configured in `src/content.config.ts` (work, poetry, prose)
- All images downloaded from original WordPress server
- Homepage card buttons now link to correct URLs (Goodreads, mailto:mail@sukritikapoor.com, Polarsteps) matching live site
- External card links open in new tabs with `target="_blank" rel="noopener noreferrer"`
- Build passes (54 pages), dev server works at localhost:4321
- Visual polish pass completed — all pages visually accurate to original
- GitHub Pages deployment configured (`.github/workflows/deploy.yml`)
- Sitemap added (`@astrojs/sitemap` integration) — generates `sitemap-index.xml` and `sitemap-0.xml` with all 54 pages
- `robots.txt` added in `public/` referencing the sitemap

### Copy Verification Status

- **Homepage**: Verified (hero, about, cards all match live site)
- **Work listing**: Verified (all 6 category titles and descriptions match)
- **Work detail — SEO**: Verified (body text and all links match)
- **Work detail — Editing**: Verified (body text matches)
- **Work detail — Short stories**: Verified (updated with verbatim copy from live site)
- **Work detail — Print journalism**: Verified (updated with verbatim copy from live site)
- **Work detail — Proofreading**: Verified (updated with verbatim copy from live site)
- **Work detail — Books**: Verified (live site has `/category/books/` listing page, not a work detail page; combined content from both book post pages — Crimson and Other Poems first and second edition)
- **Poetry**: All 28 poems verified
- **Prose**: All 15 posts verified (fetched verbatim from live site)

## What's Next (in priority order)

1. **Deployment** — Push latest changes and verify GitHub Pages deployment.
2. **Improvements** – Ideas for further improvements:
   - Add Open Graph image meta tags (generate or use a default OG image)
   - Add RSS feeds for poetry and prose
   - Improve mobile responsiveness testing (test at various viewport sizes)
   - Consider adding page transitions for smoother navigation
   - Add structured data (JSON-LD) for better SEO

## Done This Iteration
- Created `CLAUDE.md` with comprehensive project documentation (tech stack, commands, architecture, content collections, design tokens, conventions)
- Visual QA re-verified: homepage, work listing, and poetry listing all match reference screenshots
- All CI checks pass: build (54 pages), astro check (0 errors), prettier (all formatted)

## Visual QA Status (completed)

- Homepage: Hero, about, cards with images all match original site
- Work listing: 2-column grid with bold serif headings matches
- Work detail (editing): Book cover gallery loads correctly
- Prose listing: Date, title, excerpt layout matches
- Prose detail (rent): Date, title, body, blockquote styling matches
- Poetry listing: Date and title list matches
- Footer: Fixed to show "© 2023" matching live site
- All CI checks pass: build (54 pages), astro check (0 errors), prettier (all formatted)

## Key Files

- `src/content.config.ts` — Astro content collections definition
- `src/layouts/BaseLayout.astro` — shared layout (sidebar, header, footer)
- `src/pages/index.astro` — homepage (imports card images)
- `src/pages/work/index.astro` — work listing page
- `src/pages/work/[slug].astro` — work detail dynamic route (includes book cover gallery for editing page)
- `src/pages/prose/index.astro` — prose listing page
- `src/pages/prose/[slug].astro` — prose detail dynamic route
- `src/pages/poetry/index.astro` — poetry listing page
- `src/pages/poetry/[slug].astro` — poetry detail dynamic route
- `src/content/work/*.md` — work content (seo, editing, books, short-stories, print-journalism, proofreading)
- `src/content/prose/*.md` — 15 prose post files
- `src/content/poetry/*.md` — 28 poetry files
- `src/assets/images/card-*.png` — homepage card illustrations (512x512)
- `src/assets/images/books/book*.j*` — 7 book cover images for editing page
- `src/styles/global.css` — Tailwind v4 CSS-based config (design tokens via `@theme`, `@plugin` for typography)
- `astro.config.mjs` — Astro config (site, base URL, Tailwind vite plugin)
- `.github/workflows/deploy.yml` — GitHub Actions deployment workflow

## Notes

- Tailwind accent color: `#6244BB` (used for purple buttons)
- Fonts: Playfair Display (serif headings), Inter (sans body)
- Sidebar is `position: fixed` on desktop, hamburger menu on mobile
- Tailwind v4 uses CSS-based config (`src/styles/global.css`) with `@theme` for design tokens and `@plugin` for typography — no JS config file needed
- `@tailwindcss/vite` plugin used in `astro.config.mjs` (replaces old `@astrojs/tailwind` integration)
- Astro config: `site: 'https://AnandChowdhary.github.io'`, `base: '/sukritikapoor.com/'`
- All internal links use `import.meta.env.BASE_URL` to work correctly with the GitHub Pages subpath
- Live site WordPress URL patterns: some poems use numeric slugs (e.g., `/poetry/514/` for Entangled) — our Astro site uses text slugs instead
- Prose posts use text slugs matching live site (e.g., `/prose/anthill/`); "My happy place" uses `/prose/my-happy-place/` (live site uses `/prose/650/`)

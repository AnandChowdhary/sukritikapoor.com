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
- **Poetry section complete** - 24 poems recovered from Archive.org and added as markdown files
  - Poetry listing page (`/poetry`) shows all poems sorted newest-first
  - Poetry detail pages (`/poetry/[slug]`) render each poem with date, title, and body
  - Poems span 2012–2024: The Guardian Angel, Epochal Tales, My Immortal, I, Beginnings, Crimson, Little Sparrow, Red, Chasing Dreams, Happyness, Consent, Womanhood, The Thread, Days, Imagination, Idle, Nirvana, Of Pop Rocks and Gobstoppers, Fallacies, Speechless, Havana, Revival, Entangled, I Am a Writer Aren't I
- Content collections configured in `src/content.config.ts` (work, poetry, prose)
- All images downloaded from original WordPress server
- Build passes (35 pages), dev server works at localhost:4321
- Visual polish pass completed - all pages visually accurate to original
- GitHub Pages deployment configured (`.github/workflows/deploy.yml`)

## What's Next (in priority order)

1. **Verify copy against live site** — Now that sukritikapoor.com is back up, fetch each page from the live site and verify/update all copy in the Astro rebuild to match exactly. Pages to check:
   - Homepage (hero text, about section, card text)
   - Work listing page (category titles and descriptions)
   - All 6 work detail pages (SEO, Editing, Books, Short stories, Print journalism, Proofreading)
   - All poetry content (verify against live site poems)
   - All prose content (verify against live site posts)
2. **Check for missing content** — The live site may have content not yet in the rebuild (additional prose posts, updated work pages, etc.). Fetch listing pages to discover any missing entries.
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
- `src/content/poetry/*.md` - 24 poetry files
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

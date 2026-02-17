# Shared Task Notes

## Current State

- Astro project scaffolded with Tailwind CSS v4 (`@tailwindcss/vite`) + Typography plugin, fonts loaded (Playfair Display + Inter)
- BaseLayout with fixed left sidebar (23% width), mobile hamburger menu, footer
- Homepage complete with real card images (bookshelf, pen/paper, globe from original site)
- Work listing page (`/work`) complete: 2-column grid of 6 categories
- Work detail pages (`/work/[slug]`) complete: all 6 pages with content collections
  - SEO and Editing have full content from original site
  - Editing page includes 7 book cover images in 4-column grid
  - Books, Short stories, Print journalism, Proofreading have placeholder content
- Prose listing page (`/prose`) and detail page (`/prose/[slug]`) complete
  - "Rent" post with date (Aug 24, 2023), title, and full body text (5 elements: 3 paragraphs, 1 blockquote, 1 closing paragraph - recovered from Archive.org)
- Poetry listing page (`/poetry`) and detail page (`/poetry/[slug]`) created (empty, shows "Coming soon.")
- Content collections configured in `src/content.config.ts` (work, poetry, prose)
- All images downloaded from original WordPress server
- Build passes (11 pages), dev server works at localhost:4321
- **Visual polish pass completed** - compared homepage (hero, about, cards), work page, and prose/rent page against reference screenshots. All pages are visually accurate to the original. Hero heading adjusted to `text-[2.75rem]` with `max-w-3xl` to match reference 2-line wrapping.
- **Dependencies upgraded** - Migrated from Tailwind CSS v3 to v4.1.18. Removed `@astrojs/tailwind` integration and `tailwind.config.mjs`, replaced with `@tailwindcss/vite` plugin and CSS-based config (`src/styles/global.css`). Visually verified all pages are identical after upgrade.
- **Rent full text recovered** - Fetched complete text from Archive.org. Fixed paragraph 3 ending (was incorrectly transcribed), added blockquote and closing paragraph. Now has all 5 original content elements.

## What's Next (in priority order)

1. **Poetry content** - Poetry listing page is empty. Need to find poetry content from Archive.org.

2. **New content** - Use web search, LinkedIn, and similar sources to research and write new content for work detail pages (e.g. Books, Short stories, Print journalism, Proofreading), prose, or poetry where placeholders or gaps exist. See SPEC.md "Writing New Content".

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
- `src/assets/images/card-*.png` - homepage card illustrations (512x512)
- `src/assets/images/books/book*.j*` - 7 book cover images for editing page
- `src/styles/global.css` - Tailwind v4 CSS-based config (design tokens via `@theme`, `@plugin` for typography)
- `content/seo.txt`, `content/editing.txt` - original saved HTML content for reference
- `screenshots/` - reference screenshots from Archive.org

## Notes

- Tailwind accent color: `#6244BB` (used for purple buttons)
- Fonts: Playfair Display (serif headings), Inter (sans body)
- Sidebar is `position: fixed` on desktop, hamburger menu on mobile
- Tailwind v4 uses CSS-based config (`src/styles/global.css`) with `@theme` for design tokens and `@plugin` for typography - no JS config file needed
- `@tailwindcss/vite` plugin used in `astro.config.mjs` (replaces old `@astrojs/tailwind` integration)
- Card images source: `sukritikapoordotcom-wordpress.ams301.anandchowdhary.com/wp-content/uploads/2023/04/out-0*.png`
- Book cover images source: same WordPress domain, various upload paths (see `content/editing.txt`)
- **Tailwind dev server caching** (may be resolved with v4): When adding new pages with new Tailwind classes, restart the dev server (`pkill -f "astro dev"` then `npm run dev`) so Tailwind picks up the new classes.

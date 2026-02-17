# CLAUDE.md

## Project Overview

Personal portfolio website for Sukriti Kapoor (writer and editor). Rebuilt as a static site using Astro + Tailwind CSS, deployed to GitHub Pages.

**Live rebuild:** https://AnandChowdhary.github.io/sukritikapoor.com/
**Source of truth:** https://sukritikapoor.com (original WordPress site)

## Tech Stack

- **Astro 5** — static site generator (zero JS by default)
- **Tailwind CSS v4** — using `@tailwindcss/vite` plugin (CSS-based config, no JS config file)
- **TypeScript** — for content config and type checking
- **GitHub Pages** — deployment via GitHub Actions

## Commands

```bash
npm run dev       # Start dev server at localhost:4321
npm run build     # Build static site to dist/ (54 pages)
npm run check     # Run astro check (TypeScript/Astro diagnostics)
npm run format    # Format code with Prettier
npx prettier --check --plugin=prettier-plugin-astro "src/**/*.{astro,ts,css}"  # CI format check
```

## Architecture

### Content Collections (`src/content.config.ts`)

Three collections using `glob` loader with Markdown files:
- **work** — 6 work category pages (`src/content/work/*.md`), has `order` field for sorting
- **poetry** — 28 poems (`src/content/poetry/*.md`), sorted by date descending
- **prose** — 15 posts (`src/content/prose/*.md`), sorted by date descending

### Key Files

- `src/layouts/BaseLayout.astro` — shared layout: fixed left sidebar (23% width), mobile hamburger menu, footer
- `src/pages/index.astro` — homepage with hero, about section, three cards
- `src/pages/work/index.astro` — work listing (2-column grid)
- `src/pages/work/[slug].astro` — work detail (includes book cover gallery for editing page)
- `src/pages/poetry/index.astro` — poetry listing
- `src/pages/poetry/[slug].astro` — poetry detail
- `src/pages/prose/index.astro` — prose listing
- `src/pages/prose/[slug].astro` — prose detail
- `src/components/ContentListing.astro` — shared listing component for poetry/prose
- `src/components/ContentDetail.astro` — shared detail component for poetry/prose
- `src/components/HomepageCard.astro` — card component for homepage
- `src/styles/global.css` — Tailwind v4 config (design tokens via `@theme`, typography plugin)

### Design Tokens

Defined in `src/styles/global.css` using Tailwind v4 `@theme`:
- **Accent color:** `#6244BB` (purple, used as `text-accent`, `bg-accent`)
- **Fonts:** Playfair Display (serif headings), Inter (sans body)
- Loaded from Google Fonts in `BaseLayout.astro`

### Routing

- All internal links use `import.meta.env.BASE_URL` prefix for GitHub Pages subpath compatibility
- Astro config: `site: 'https://anandchowdhary.github.io'`, `base: '/sukritikapoor.com/'`

### Images

- `src/assets/images/card-*.png` — homepage card illustrations (512x512)
- `src/assets/images/books/book*.j*` — 7 book cover images for editing page
- Images are optimized by Astro's built-in image optimization (outputs WebP)

## Adding Content

### New poem or prose post

Create a Markdown file in the appropriate `src/content/` directory:

```markdown
---
title: "Poem Title"
date: 2024-01-15
---

Content here...
```

### New work category

1. Create `src/content/work/slug-name.md` with `title`, `description`, and `order` fields
2. The work listing and detail pages are auto-generated from the collection

## Conventions

- Content is copied verbatim from the live WordPress site — do not paraphrase
- Footer shows "© 2023" matching the live site
- Sidebar is `position: fixed` on desktop, collapses to hamburger on mobile
- External links use `target="_blank" rel="noopener noreferrer"`

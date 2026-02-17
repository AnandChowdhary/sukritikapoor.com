# Shared Task Notes

## Source of Truth

**The original WordPress site at https://sukritikapoor.com is now working again.** Always use the live site as the primary source of truth for all copy, content, and design. Fetch pages directly from sukritikapoor.com to get the correct text — do not paraphrase or rewrite.

## Current State

The site rebuild is **feature-complete**. All content, pages, and visual design match the original WordPress site.

- 54 pages built: homepage, 6 work pages, 28 poetry pages, 15 prose pages, work/poetry/prose listing pages, 404
- All copy verified against live site
- Visual QA completed using agent-browser (desktop 1440x900 and mobile 375x812)
- Mobile hamburger menu works correctly
- All CI checks pass: build (54 pages), astro check (0 errors), prettier (all formatted)
- GitHub Pages deployment configured (`.github/workflows/deploy.yml`)
- Sitemap and robots.txt in place
- OG meta tags (title, description, type) already in BaseLayout
- RSS feeds for poetry and prose (`/poetry/rss.xml`, `/prose/rss.xml`) with auto-discovery `<link>` tags in `<head>`

## What's Next (in priority order)

1. **Deployment** — Push latest changes and verify GitHub Pages deployment works end-to-end.
2. **Optional improvements** (nice-to-have, not blocking):
   - Add an OG image (generate or use a default image for social sharing)
   - Add structured data (JSON-LD) for better SEO

## Key Files

- `src/layouts/BaseLayout.astro` — shared layout (sidebar, header, footer, RSS link tags)
- `src/pages/index.astro` — homepage
- `src/pages/work/[slug].astro` — work detail (includes book cover gallery for editing page)
- `src/pages/poetry/rss.xml.ts` — poetry RSS feed endpoint
- `src/pages/prose/rss.xml.ts` — prose RSS feed endpoint
- `src/content.config.ts` — Astro content collections definition
- `src/styles/global.css` — Tailwind v4 CSS-based config
- `astro.config.mjs` — Astro config (site, base URL, Tailwind vite plugin)

## Notes

- Tailwind accent color: `#6244BB`
- Fonts: Playfair Display (serif headings), Inter (sans body)
- Astro config: `site: 'https://AnandChowdhary.github.io'`, `base: '/sukritikapoor.com/'`
- All internal links use `import.meta.env.BASE_URL` for GitHub Pages subpath compatibility
- Live site may be slow/unreachable at times — the rebuild is the canonical version now
- RSS feeds use `@astrojs/rss` package, sorted by date descending, with full content in `<content:encoded>`

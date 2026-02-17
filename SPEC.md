# sukritikapoor.com - Static Site Spec

Sukriti Kapoor's personal portfolio website (writer and editor) is being rebuilt as a pixel-accurate static site using Astro and Tailwind CSS, replacing the original WordPress site.

**Source of truth for copy and content:** The live WordPress site at https://sukritikapoor.com is now working again and should be used as the primary reference for all text, copy, page structure, and content. Fetch pages directly from sukritikapoor.com to get the correct copy. The Archive.org screenshots in `screenshots/` and saved HTML in `content/` can be used as secondary references.

**Rebuild (GitHub Pages):** https://AnandChowdhary.github.io/sukritikapoor.com/

## Tech Stack

- **Framework:** Astro (static site generation, zero JS by default)
- **Styling:** Tailwind CSS
- **Hosting:** GitHub Pages (static deploy)
- **Content:** Markdown files with frontmatter

Use the latest version of all the dependencies.

## Site Structure

### Layout

Every page shares a persistent layout:

- **Header:** "Sukriti Kapoor" in bold serif text, top-left
- **Left sidebar navigation** (desktop): vertical list of links — Work, Poetry, Prose
- **Footer:** LinkedIn icon (left) + "© 2025 Sukriti Kapoor" (centered)
- **Mobile:** Sidebar collapses; navigation moves to a hamburger menu or top bar

### Design Tokens

- **Typography:** Serif font for headings (large, bold), sans-serif for body text
- **Colors:** Black and white with purple (#6244BB approx) as the accent color (used for primary CTA buttons)
- **Spacing:** Generous whitespace; content area is ~77% width with sidebar taking ~23%

## Pages

### 1. Home (`/`)

**Hero section:**

- Small greeting: "Hi there!"
- Large heading: "I'm Sukriti, a writer and editor, and this is my little corner on the web."
- Two buttons:
  - "View my work" — purple filled button, links to `/work`
  - "About me" — outlined button, scrolls to about section or links to about

**About section:**

- Two-column text layout:
  - Left: "I'm Sukriti, a writer and editor who breathes, sleeps, and lives for the intricate world of words. I live in the land of windmills and stroopwafels, and love to travel to new countries, explore new cultures, and meet new people."
  - Right: "I'm currently working as a content writer at Eurail. I'm also a voracious reader, sometimes like to cook, and am always up for dancing to early 2000s, pop, or Bollywood music."

**Three cards section** (equal-width grid):
| Card | Title | Description | CTA |
|------|-------|-------------|-----|
| 1 | Reading list | "Isn't it nice to lose yourself in a story? Find out all the books I'm currently reading and the ones I've read." | "Read on" (black button) |
| 2 | Reach out | "Liked my work or want to have a chat? Send me an email and perhaps we can meet over a virtual cup of coffee." | "Contact me" (black button) |
| 3 | Travel with me | "After the written word, travel is my second love. Discover all the places I've been to and see the world through my 📷" | "See my experiences" (purple button) |

Each card has an illustration image at the top (bookshelf, pen/paper, globe).

### 2. Work (`/work`)

**Title:** "Work" (large heading)

**Grid of work categories** (2-column layout), each item has a bold large title and a short description:

| Category                       | Description                                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEO                            | "From technical tutorial guides to magazine blog articles, I edit and update content to follow optimal SEO practices with measurable results."              |
| Editing & publishing           | "I worked in non-fiction publishing where I edited 7 books from start to finish ranging from _Super Simple Physics_ to _American Civil War_."               |
| Books                          | "I self-published my collection of poems, Crimson and Other Poems. It's softbound, 91-page paperback available on Amazon."                                  |
| Short stories                  | "My short story 'The Seven-Legged Beast' was published in DK's _Birds and Beasts_ in 2020."                                                                 |
| Print journalism               | "At Hindustan Times, I published 11 news stories ranging from the struggles of homeless shelter residents to the success stories of student entrepreneurs." |
| Proofreading & feature writing | "I edited and proofread vocational training textbooks for Unifiers. I also worked on a book pitch and wrote feature articles for their magazine."           |

Each category title links to its own detail page.

### 3. Work Detail Pages (`/work/[slug]`)

Individual pages for each work category. Two content pages are already saved:

**SEO (`/work/seo`):**

- Title: "SEO"
- Body text about SEO experience at Eurail and Hyper Online
- Links to published articles (Interrail/Eurail magazine articles, Hyper Online guides)

**Editing & Publishing (`/work/editing`):**

- Title: "Editing & publishing"
- Body text about working at DK / Penguin Random House
- Gallery of 7 book cover images (4-column grid)

All six work detail pages have full content, including researched copy for Books, Short stories, Print journalism, and Proofreading & feature writing.

### 4. Poetry (`/poetry`)

A listing page for poetry posts, sorted newest-first. Individual poems are at `/poetry/[slug]`. 24 poems recovered from Archive.org spanning 2012-2024: The Guardian Angel, Epochal Tales, My Immortal, I, Beginnings, Crimson, Little Sparrow, Red, Chasing Dreams, Happyness, Consent, Womanhood, The Thread, Days, Imagination, Idle, Nirvana, Of Pop Rocks and Gobstoppers, Fallacies, Speechless, Havana, Revival, Entangled, I Am a Writer Aren't I.

### 5. Prose (`/prose`)

A listing page for prose posts. Individual pieces are at `/prose/[slug]`.

**Example post — "Rent":**

- Date: August 24, 2023
- Layout: date in purple on the left, title as large heading, body text as paragraphs

### 6. Contact / Reach Out

Either a dedicated page or a mailto link (email contact).

## Content Architecture

```
src/
  content/
    work/
      seo.md
      editing.md
      books.md
      short-stories.md
      print-journalism.md
      proofreading.md
    poetry/
      [poem-slug].md
    prose/
      rent.md
      [other-posts].md
  pages/
    index.astro          # Home
    work/
      index.astro        # Work listing
      [slug].astro       # Work detail (dynamic)
    poetry/
      index.astro        # Poetry listing
      [slug].astro       # Poetry detail
    prose/
      index.astro        # Prose listing
      [slug].astro       # Prose detail
  layouts/
    BaseLayout.astro     # Shared header + sidebar + footer
  components/
    Sidebar.astro
    Card.astro
    Footer.astro
  assets/
    images/              # Book covers, card illustrations
```

Markdown frontmatter format:

```yaml
---
title: "Editing & publishing"
date: 2023-01-01
description: "Short description for listing pages"
---
```

## Writing New Content

The live WordPress site at https://sukritikapoor.com is the authoritative source for all copy. When creating or expanding content:

1. **Always fetch the corresponding page from sukritikapoor.com first** to get the exact copy (e.g., fetch `https://sukritikapoor.com/work/seo/` for the SEO page content)
2. Copy the text exactly — do not paraphrase or rewrite
3. For pages not yet on the live site, you may use **web search**, **LinkedIn**, and similar sources to research the author's background, published work, and employers

## Images

All images have been downloaded from the original WordPress server and saved locally:

- **Card illustrations:** `src/assets/images/card-reading.png`, `card-reach-out.png`, `card-travel.png` (512x512 each)
- **Book covers:** 7 images in `src/assets/images/books/book*.j*` for the editing detail page (displayed in 4-column grid)

## Deployment

The site is deployed to GitHub Pages using GitHub Actions (`.github/workflows/deploy.yml`). It uses `withastro/action@v5` for build and `actions/deploy-pages@v4` for deployment. Deploys automatically on push to `main`.

- **Astro config** sets `site: 'https://AnandChowdhary.github.io'` and `base: '/sukritikapoor.com/'`
- All internal links use `import.meta.env.BASE_URL` to work correctly with the subpath
- Static assets (favicon, images) are resolved relative to the base URL

## Key Behaviors

- **Static output:** No server-side rendering; fully static HTML/CSS
- **Responsive:** Mobile-friendly; sidebar becomes top navigation on small screens
- **Minimal JS:** Astro's zero-JS default; only add JS if needed for mobile nav toggle
- **SEO:** Proper meta tags, Open Graph tags, semantic HTML
- **Performance:** Optimized images (Astro's built-in image optimization), minimal CSS
- **CLAUDE.md:** Keep creating the CLAUDE.md file to help future developers understand the codebase, and create Claude skills if need be. Aim to make the project Claude-friendly.

## Visual QA with `agent-browser`

The live site at https://sukritikapoor.com is the primary visual reference. The `screenshots/` folder also contains reference screenshots captured from Archive.org. During and after development, use the `agent-browser` CLI to visually compare the rebuild against the live site and these references.

### Reference Screenshots

| File                                                  | Content                                                                             |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `screenshots/CleanShot 2026-02-17 at 10.21.50@2x.png` | Homepage — hero section (greeting, tagline, CTA buttons)                            |
| `screenshots/CleanShot 2026-02-17 at 10.21.54@2x.png` | Homepage — about section + top of three cards                                       |
| `screenshots/CleanShot 2026-02-17 at 10.21.56@2x.png` | Homepage — three cards section + footer                                             |
| `screenshots/CleanShot 2026-02-17 at 10.22.49@2x.png` | Work page — top half (SEO, Editing & publishing, Books, Short stories)              |
| `screenshots/CleanShot 2026-02-17 at 10.22.51@2x.png` | Work page — bottom half (Print journalism, Proofreading & feature writing) + footer |
| `screenshots/CleanShot 2026-02-17 at 10.37.40@2x.png` | Prose post — "Rent" (date, title, body text layout)                                 |

### QA Workflow

After starting the dev server, use `agent-browser` to take screenshots of the rebuilt pages and visually compare them against the references above. The goal is to match the original layout, typography, spacing, and overall feel.

```bash
# Open the local dev server
agent-browser open http://localhost:4321

# Take a full-page screenshot of the homepage
agent-browser screenshot --full screenshots/qa-home.png

# Navigate to /work and screenshot
agent-browser open http://localhost:4321/work
agent-browser screenshot --full screenshots/qa-work.png

# Scroll to check specific sections
agent-browser scroll down 500
agent-browser screenshot screenshots/qa-work-bottom.png
```

Then read both the reference screenshot and the QA screenshot to compare them visually. Check for:

- **Layout:** Sidebar + content area proportions match (~23% / ~77%)
- **Typography:** Heading sizes, font weights, serif vs sans-serif usage
- **Spacing:** Whitespace between sections, padding within cards
- **Colors:** Purple accent (#6244BB), black text on white background
- **Components:** Button styles (filled purple vs outlined), card layout, image gallery grid

Iterate until the rebuilt pages closely match the original screenshots.

## Out of Scope (for now)

- Reading list page (would need a data source for books) https://www.goodreads.com/user/show/13884498-sukriti-kapoor
- Travel page (would need photo content)
- Analytics
- CMS integration
- Search functionality

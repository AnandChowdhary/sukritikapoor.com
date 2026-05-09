# Sukriti Kapoor Static Site

This is a static HTML/CSS version of `sukritikapoor.com`.

## Edit content

- Site-wide settings and homepage copy live in `content/site.json`.
- Pages live in `content/pages/`.
- Posts live in `content/posts/`.
- Category metadata lives in `content/categories.json`.
- Images and fonts live in `assets/`.
- Generated files are written to `dist/`.

Each Markdown file uses JSON frontmatter:

```md
---
{
  "type": "post",
  "title": "Example",
  "route": "/prose/example/",
  "date": "2026-01-01T00:00:00",
  "categories": ["prose"]
}
---

Post body goes here.
```

## Commands

```sh
npm run import:wordpress
npm run build
npm run dev
```

`import:wordpress` re-imports the current WordPress content into Markdown and downloads referenced assets. Use it only when you want to refresh from WordPress, because it will overwrite generated `content/` files.

`build` renders the Markdown source into plain static files in `dist/`.

`dev` serves the built site at `http://localhost:4173/`.

## Deploy

Pushes to `main` deploy automatically through GitHub Pages using `.github/workflows/pages.yml`.

The workflow installs dependencies, runs `npm run build`, and publishes `dist/` as the Pages artifact. `dist/` is generated output and is intentionally not committed.

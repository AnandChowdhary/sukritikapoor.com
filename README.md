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

Use Node.js 24 LTS, matching the build and Substack sync workflows.

```sh
npm ci
npm run import:substack
npm run import:wordpress
npm test
npm run build
npm run dev
```

`import:wordpress` re-imports the current WordPress content into Markdown and downloads referenced assets. Use it only when you want to refresh from WordPress, because it will overwrite generated `content/` files.

`build` renders the Markdown source into plain static files in `dist/`.

`dev` serves the built site at `http://localhost:4173/`.

## Substack cross-posts

`npm run import:substack` imports the public article bodies from
[Sukriti's RSS feed](https://sukritikapoor15.substack.com/feed). Imported Markdown
lives in `content/posts/substack/`, images in `assets/substack/`, and articles
appear under Prose at `/prose/<substack-slug>/`.

Posts retain their original titles and publication dates, link back to Substack,
and use the original article URL as their canonical URL. The importer identifies
posts by their feed GUID or source URL and updates existing imports when the feed
changes. Edit imported articles on Substack; local changes to their generated
Markdown will be overwritten on the next sync. Images are cached by their source
URL, so only new images are downloaded.

Substack sometimes serves a Cloudflare challenge to GitHub-hosted runners. On an
HTTP 403, the importer falls back to [Jina Reader](https://r.jina.ai/) to read the
public feed's article URLs and dates, then each article's visible HTML and metadata.
This fallback uses no API key, spaces requests to stay within the public reader's
rate limit, and fails without changing content if the reader cannot fetch an
article. It introduces a dependency on that public reader's availability when
direct access to Substack is blocked.

The RSS feed contains recent posts, not the entire archive. Once imported, posts
are kept even after they leave the feed or are removed from Substack. Edits to
posts outside the feed window are not synced; a future archive backfill would be
needed to recover articles missed during a long interruption. Only the content
publicly exposed in the feed is imported, including any previews Substack serves.

`.github/workflows/sync-substack.yml` runs daily at **05:17 UTC**, with a manual
**Run workflow** option on `main`. It imports, tests, builds, and commits only
changed posts and images using the built-in `GITHUB_TOKEN`. If an import or build
fails, it does not commit. If nothing changes, it skips committing and deploying.
If `main` has branch protection that prevents bot pushes, its rules must allow
this workflow to push for the automatic sync to work.

## Deploy

Pushes to `main` deploy automatically through GitHub Pages using `.github/workflows/pages.yml`.

The workflow installs dependencies, runs `npm run build`, and publishes `dist/` as the Pages artifact. `dist/` is generated output and is intentionally not committed.

The Pages workflow is also reusable. After pushing an import commit, the Substack
workflow calls it with that exact commit, because pushes made using `GITHUB_TOKEN`
do not trigger other push-based workflows. No personal access token is needed.

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE = "https://sukritikapoor.com";
const OUT = "dist";

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripMarkdown(value = "") {
  return value
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFrontmatter(source, file) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`Missing JSON frontmatter in ${file}`);
  return {
    data: JSON.parse(match[1]),
    body: match[2].trim(),
    file,
  };
}

async function readContentFiles(dir) {
  const items = [];
  async function walk(current) {
    let entries = [];
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(file);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        items.push(parseFrontmatter(await readFile(file, "utf8"), file));
      }
    }
  }
  await walk(dir);
  return items;
}

function routeToFile(route) {
  if (route === "/") return "index.html";
  return `${route.replace(/^\/|\/$/g, "")}/index.html`;
}

function routeDir(route) {
  return path.posix.dirname(routeToFile(route));
}

function relativeRoute(fromRoute, toRoute) {
  const fromDir = routeDir(fromRoute);
  const toDir = path.posix.dirname(routeToFile(toRoute));
  const rel = path.posix.relative(fromDir, toDir);
  return rel ? `${rel}/` : "./";
}

function relativeFile(fromRoute, targetFile) {
  const rel = path.posix.relative(routeDir(fromRoute), targetFile.replace(/^\//, ""));
  return rel.startsWith(".") ? rel : rel || ".";
}

function href(fromRoute, value) {
  if (!value || value.startsWith("#") || value.startsWith("mailto:") || value.startsWith("tel:")) {
    return value;
  }

  if (value.startsWith("/assets/")) {
    return relativeFile(fromRoute, value);
  }

  if (value.startsWith("/")) {
    const route = value.endsWith("/") ? value : `${value}/`;
    return relativeRoute(fromRoute, route);
  }

  try {
    const url = new URL(value);
    if (url.hostname === "sukritikapoor.com") {
      let route = url.pathname;
      if (!route.endsWith("/")) route += "/";
      return relativeRoute(fromRoute, route) + url.hash;
    }
    return value;
  } catch {
    return value;
  }
}

function renderInline(fromRoute, value) {
  const renderText = (text) =>
    escapeHtml(text)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/  \n/g, "<br>");

  let html = "";
  let lastIndex = 0;
  const tokens = /!\[([^\]]*)]\(([^)]+)\)|\[([^\]]+)]\(([^)]+)\)/g;

  for (const match of value.matchAll(tokens)) {
    html += renderText(value.slice(lastIndex, match.index));
    if (match[2]) {
      html += `<img src="${escapeHtml(href(fromRoute, match[2]))}" alt="${escapeHtml(match[1])}">`;
    } else {
      html += `<a href="${escapeHtml(href(fromRoute, match[4]))}">${renderText(match[3])}</a>`;
    }
    lastIndex = match.index + match[0].length;
  }

  html += renderText(value.slice(lastIndex));
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/  \n/g, "<br>");
  return html;
}

function imageFromLine(fromRoute, line) {
  const match = line.match(/^!\[([^\]]*)]\(([^)]+)\)$/);
  if (!match) return null;
  return `<figure><img src="${escapeHtml(href(fromRoute, match[2]))}" alt="${escapeHtml(match[1])}"></figure>`;
}

function imagesFromBlock(fromRoute, block) {
  const lines = block.split("\n").map((line) => line.trim());
  const images = lines.map((line) => imageFromLine(fromRoute, line));
  return images.every(Boolean) ? images : null;
}

function galleryClassName(fromRoute) {
  const columns = fromRoute === "/work/editing-publishing/" ? 4 : 3;
  return `image-grid columns-${columns}`;
}

function markdownToHtml(fromRoute, markdown = "") {
  const blocks = markdown
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const html = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const firstImages = imagesFromBlock(fromRoute, block);
    if (firstImages) {
      const images = [...firstImages];
      while (index + 1 < blocks.length) {
        const nextImages = imagesFromBlock(fromRoute, blocks[index + 1]);
        if (!nextImages) break;
        images.push(...nextImages);
        index += 1;
      }
      const className = images.length > 1 ? galleryClassName(fromRoute) : "image-block";
      html.push(`<div class="${className}">${images.join("")}</div>`);
      continue;
    }

    const heading = block.match(/^(#{1,6})\s+(.+)$/s);
    if (heading) {
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(fromRoute, heading[2].trim())}</h${level}>`);
      continue;
    }

    const lines = block.split("\n").map((line) => line.trim());
    if (lines.every((line) => line.startsWith("- "))) {
      html.push(`<ul>${lines.map((line) => `<li>${renderInline(fromRoute, line.slice(2))}</li>`).join("")}</ul>`);
      continue;
    }

    if (lines.every((line) => line.startsWith("> "))) {
      html.push(`<blockquote>${lines.map((line) => `<p>${renderInline(fromRoute, line.slice(2))}</p>`).join("")}</blockquote>`);
      continue;
    }

    html.push(`<p>${renderInline(fromRoute, block).replace(/\n/g, "<br>")}</p>`);
  }

  return html.join("\n");
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function nav(site, route) {
  return site.nav
    .map((item) => {
      const active =
        route === item.route ||
        (item.route !== "/" && route.startsWith(item.route)) ||
        (item.route === "/work/" && route.startsWith("/category/work/"));
      return `<a ${active ? 'aria-current="page" ' : ""}href="${relativeRoute(route, item.route)}">${escapeHtml(item.label)}</a>`;
    })
    .join("");
}

function linkedInIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19.7,3H4.3C3.582,3,3,4.3v15.4C3,20.418,3.582,21,4.3,21h15.4c.718,0,1.3-.582,1.3-1.3V4.3C21,3.582,20.418,3,19.7,3zM8.339,18.338H5.667v-8.59h2.672v8.59zM7.004,8.574c-.857,0-1.549-.694-1.549-1.548s.691-1.548,1.549-1.548c.854,0,1.547.694,1.547,1.548s-.693,1.548-1.547,1.548zM18.339,18.338H15.67v-4.177c0-.996-.017-2.278-1.387-2.278-1.389,0-1.601,1.086-1.601,2.206v4.249h-2.667v-8.59h2.559v1.174h.037c.356-.675,1.227-1.387,2.526-1.387,2.703,0,3.203,1.779,3.203,4.092v4.711z"/></svg>`;
}

function layout({ site, route, title, description, bodyClass = "", main }) {
  const pageTitle = title === site.title ? title : `${title} - ${site.title}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(description || site.description)}">
  <link rel="stylesheet" href="${relativeFile(route, "assets/styles.css")}">
</head>
<body class="${bodyClass}">
  <a class="skip-link" href="#content">Skip to content</a>
  <div class="site-shell">
    <aside class="sidebar" aria-label="Site navigation">
      <a class="brand" href="${relativeRoute(route, "/")}">${escapeHtml(site.title)}</a>
      <nav class="site-nav">${nav(site, route)}</nav>
      <div class="social-links">
        ${site.social.map((item) => `<a class="social-link" href="${escapeHtml(item.url)}" aria-label="${escapeHtml(item.label)}">${item.label === "LinkedIn" ? linkedInIcon() : escapeHtml(item.label)}</a>`).join("")}
      </div>
    </aside>
    <div class="page">
      <header class="mobile-header">
        <a class="brand" href="${relativeRoute(route, "/")}">${escapeHtml(site.title)}</a>
        <details class="mobile-menu">
          <summary aria-label="Open menu"><span></span><span></span></summary>
          <nav class="site-nav">${nav(site, route)}</nav>
        </details>
      </header>
      <main id="content">
${main}
      </main>
      <footer class="footer">
        <p>&copy; 2023 ${escapeHtml(site.title)}</p>
      </footer>
    </div>
  </div>
</body>
</html>
`;
}

function homePage(site) {
  const route = "/";
  return layout({
    site,
    route,
    title: site.title,
    description: site.description,
    bodyClass: "home",
    main: `        <section class="hero">
          <div class="hero-copy">
            <p class="eyebrow">${escapeHtml(site.home.eyebrow)}</p>
            <h1>${escapeHtml(site.home.title)}</h1>
            <div class="actions">
              <a class="button" href="${relativeRoute(route, "/work/")}">View my work</a>
              <a class="button secondary" href="${relativeRoute(route, "/about/")}">About me</a>
            </div>
          </div>
        </section>
        <section class="intro-grid">
${site.home.intro.map((text) => `          <p>${escapeHtml(text)}</p>`).join("\n")}
        </section>
        <section class="feature-grid">
${site.home.cards
  .map(
    (card) => `          <article class="feature-card">
            <img src="${relativeFile(route, card.image)}" alt="">
            <div>
              <h2>${escapeHtml(card.title)}</h2>
              <p>${escapeHtml(card.text)}</p>
              <a class="text-link" href="${escapeHtml(href(route, card.url))}">${escapeHtml(card.cta)}</a>
            </div>
          </article>`,
  )
  .join("\n")}
        </section>`,
  });
}

function contentPage(site, page) {
  const route = page.data.route;
  const title = page.data.title;
  if (route === "/work/") return workPage(site, page);
  return layout({
    site,
    route,
    title,
    description: stripMarkdown(page.body).slice(0, 160),
    main: `        <article class="content-page">
          <header class="page-header">
            <h1>${escapeHtml(title)}</h1>
          </header>
          <div class="rich-text">
${markdownToHtml(route, page.body)}
          </div>
        </article>`,
  });
}

function workPage(site, page) {
  const route = page.data.route;
  const pairs = [];
  const blocks = page.body.split(/\n\n+/).map((block) => block.trim()).filter(Boolean);
  for (let index = 0; index < blocks.length; index += 2) {
    pairs.push({ heading: blocks[index] ?? "", text: blocks[index + 1] ?? "" });
  }

  return layout({
    site,
    route,
    title: page.data.title,
    description: stripMarkdown(page.body).slice(0, 160),
    bodyClass: "work-page",
    main: `        <article class="content-page work-index">
          <header class="page-header">
            <h1>${escapeHtml(page.data.title)}</h1>
          </header>
          <div class="work-grid">
${pairs
  .map(
    (item) => `            <section class="work-item">
              ${markdownToHtml(route, item.heading)}
              ${markdownToHtml(route, item.text)}
            </section>`,
  )
  .join("\n")}
          </div>
        </article>`,
  });
}

function postPage(site, post, postsByCategory, categoriesBySlug) {
  const route = post.data.route;
  const title = post.data.title;
  const primarySlug = post.data.categories?.[0];
  const category = categoriesBySlug.get(primarySlug);
  const related = primarySlug ? postsByCategory.get(primarySlug) ?? [] : [];
  const currentIndex = related.findIndex((item) => item.data.route === route);
  const previous = currentIndex >= 0 ? related[currentIndex + 1] : null;
  const next = currentIndex > 0 ? related[currentIndex - 1] : null;

  return layout({
    site,
    route,
    title,
    description: post.data.excerpt || stripMarkdown(post.body).slice(0, 160),
    main: `        <article class="content-page article">
          <header class="page-header">
            <p class="eyebrow">${category ? `<a href="${relativeRoute(route, category.route)}">${escapeHtml(category.name)}</a>` : "Post"}</p>
            <h1>${escapeHtml(title)}</h1>
            <time datetime="${escapeHtml(post.data.date)}">${formatDate(post.data.date)}</time>
          </header>
          <div class="rich-text">
${markdownToHtml(route, post.body)}
          </div>
          <nav class="post-nav" aria-label="Post navigation">
            ${previous ? `<a href="${relativeRoute(route, previous.data.route)}">Previous: ${escapeHtml(previous.data.title)}</a>` : "<span></span>"}
            ${next ? `<a href="${relativeRoute(route, next.data.route)}">Next: ${escapeHtml(next.data.title)}</a>` : "<span></span>"}
          </nav>
        </article>`,
  });
}

function categoryPage(site, category, posts, route = category.route) {
  return layout({
    site,
    route,
    title: category.name,
    description: `${category.name} by ${site.title}.`,
    main: `        <section class="listing-page">
          <header class="page-header">
            <h1>Category: <span>${escapeHtml(category.name)}</span></h1>
          </header>
          <div class="post-list">
${posts
  .map(
    (post) => `            <article class="post-card">
              ${post.data.featuredImage ? `<a class="post-card-image" href="${relativeRoute(route, post.data.route)}"><img src="${relativeFile(route, post.data.featuredImage)}" alt="${escapeHtml(post.data.title)}"></a>` : ""}
              <time datetime="${escapeHtml(post.data.date)}">${formatDate(post.data.date)}</time>
              <h2><a href="${relativeRoute(route, post.data.route)}">${escapeHtml(post.data.title)}</a></h2>
            </article>`,
  )
  .join("\n")}
          </div>
        </section>`,
  });
}

async function writeRoute(route, html) {
  const file = path.join(OUT, routeToFile(route));
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
}

async function writeSitemap(routes) {
  const body = [...routes]
    .sort()
    .map((route) => `  <url><loc>${SOURCE}${route}</loc></url>`)
    .join("\n");
  await writeFile(
    path.join(OUT, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
  );
}

async function copyAssets() {
  await mkdir(path.join(OUT, "assets"), { recursive: true });
  if (await exists("assets")) {
    await cp("assets", path.join(OUT, "assets"), { recursive: true });
  }
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const [site, categories, pages, posts] = await Promise.all([
    readFile("content/site.json", "utf8").then(JSON.parse),
    readFile("content/categories.json", "utf8").then(JSON.parse),
    readContentFiles("content/pages"),
    readContentFiles("content/posts"),
  ]);

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await copyAssets();

  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const postsByCategory = new Map(categories.map((category) => [category.slug, []]));
  for (const post of posts) {
    for (const slug of post.data.categories ?? []) {
      postsByCategory.get(slug)?.push(post);
    }
  }
  for (const bucket of postsByCategory.values()) {
    bucket.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  }

  const routes = new Set();
  await writeRoute("/", homePage(site));
  routes.add("/");

  for (const page of pages) {
    await writeRoute(page.data.route, contentPage(site, page));
    routes.add(page.data.route);
  }

  for (const post of posts) {
    await writeRoute(post.data.route, postPage(site, post, postsByCategory, categoriesBySlug));
    routes.add(post.data.route);
  }

  for (const category of categories) {
    const categoryPosts = postsByCategory.get(category.slug) ?? [];
    await writeRoute(category.route, categoryPage(site, category, categoryPosts));
    routes.add(category.route);
    if (category.legacyRoute && category.legacyRoute !== category.route) {
      await writeRoute(category.legacyRoute, categoryPage(site, category, categoryPosts, category.legacyRoute));
      routes.add(category.legacyRoute);
    }
  }

  await writeRoute(
    "/404/",
    notFoundPage(site),
  );
  await writeFile(path.join(OUT, "404.html"), notFoundPage(site, "/"));
  routes.add("/404/");

  await writeSitemap(routes);
  await writeFile(path.join(OUT, ".nojekyll"), "");
  await writeFile(path.join(OUT, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://sukritikapoor.com/sitemap.xml\n");

  console.log(`Built ${routes.size} routes into ${OUT}/.`);
}

function notFoundPage(site, route = "/404/") {
  return layout({
    site,
    route,
    title: "Page not found",
    description: "Page not found.",
    main: `        <section class="content-page">
          <header class="page-header">
            <p class="eyebrow">404</p>
            <h1>Page not found</h1>
            <p>The page you are looking for is not part of this static export.</p>
          </header>
        </section>`,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE = "https://sukritikapoor.com";
const WORDPRESS_HOSTS = new Set([
  "sukritikapoor.com",
  "sukritikapoordotcom-wordpress.ams301.anandchowdhary.com",
]);

const categoryRoutes = {
  books: "/books/",
  poetry: "/poetry/",
  prose: "/prose/",
  work: "/category/work/",
};

const entityMap = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "'",
  lsquo: "'",
  rdquo: '"',
  ldquo: '"',
  ndash: "-",
  mdash: "-",
  hellip: "...",
};

const assetUrls = new Set([
  `${SOURCE}/wp-content/themes/bjork/assets/fonts/AlbertSans-VariableFont_wght.woff2`,
  `${SOURCE}/wp-content/themes/bjork/assets/fonts/AlbertSans-Italic-VariableFont_wght.woff2`,
]);

function decodeEntities(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(parseInt(code, 16)),
    )
    .replace(/&([a-z]+);/gi, (match, name) => entityMap[name] ?? match);
}

function stripHtml(value = "") {
  return decodeEntities(value)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getAttr(tag, attr) {
  const match = tag.match(new RegExp(`${attr}=["']([^"']*)["']`, "i"));
  return match?.[1] ?? "";
}

function normalizeRouteFromLink(link) {
  const url = new URL(link, SOURCE);
  let route = url.pathname;
  if (!route.endsWith("/")) route += "/";
  return route;
}

function pageRoute(page) {
  if (page.slug === "home") return "/";
  return normalizeRouteFromLink(page.link);
}

function postRoute(post) {
  return normalizeRouteFromLink(post.link);
}

function routeForCategory(category) {
  return categoryRoutes[category.slug] ?? `/category/${category.slug}/`;
}

function isWordPressUrl(value) {
  try {
    const url = new URL(value, SOURCE);
    return WORDPRESS_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function assetFileForUrl(value) {
  const url = new URL(value, SOURCE);
  if (url.pathname.includes("/themes/bjork/assets/fonts/")) {
    return `/assets/fonts/${path.posix.basename(url.pathname)}`;
  }
  const uploadsPrefix = "/wp-content/uploads/";
  if (url.pathname.startsWith(uploadsPrefix)) {
    return `/assets/uploads/${decodeURI(url.pathname.slice(uploadsPrefix.length))}`;
  }
  return `/assets/${path.posix.basename(url.pathname)}`;
}

function rewriteUrl(value, routeMap, categoriesBySlug) {
  if (!value || value.startsWith("#") || value.startsWith("mailto:") || value.startsWith("tel:")) {
    return value;
  }

  try {
    const url = new URL(value, SOURCE);
    if (
      WORDPRESS_HOSTS.has(url.hostname) &&
      (url.pathname.startsWith("/wp-content/uploads/") ||
        url.pathname.includes("/themes/bjork/assets/fonts/"))
    ) {
      assetUrls.add(url.toString());
      return assetFileForUrl(url.toString());
    }

    if (!WORDPRESS_HOSTS.has(url.hostname)) return value;

    let route = url.pathname;
    if (!route.endsWith("/")) route += "/";
    if (routeMap.has(route)) return `${routeMap.get(route)}${url.hash}`;

    if (route.startsWith("/category/")) {
      const slug = route.replace(/^\/category\/|\/$/g, "");
      const category = categoriesBySlug.get(slug);
      if (category) return `${routeForCategory(category)}${url.hash}`;
    }

    return `${route}${url.hash}`;
  } catch {
    return value;
  }
}

function inlineMarkdown(html, routeMap, categoriesBySlug) {
  return decodeEntities(html)
    .replace(/<br\s*\/?>/gi, "  \n")
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, text) => `**${inlineMarkdown(text, routeMap, categoriesBySlug)}**`)
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_, _tag, text) => `*${inlineMarkdown(text, routeMap, categoriesBySlug)}*`)
    .replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_, attrs, text) => {
      const href = rewriteUrl(getAttr(attrs, "href"), routeMap, categoriesBySlug);
      const label = inlineMarkdown(text, routeMap, categoriesBySlug).replace(/\s+/g, " ").trim();
      return label ? `[${label}](${href})` : href;
    })
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function htmlToMarkdown(html = "", routeMap, categoriesBySlug) {
  let next = html;

  next = next.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = rewriteUrl(getAttr(tag, "src"), routeMap, categoriesBySlug);
    const alt = decodeEntities(getAttr(tag, "alt"));
    return `\n\n![${alt}](${src})\n\n`;
  });

  next = next.replace(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, text) => {
    return `\n\n${"#".repeat(Number(level))} ${inlineMarkdown(text, routeMap, categoriesBySlug)}\n\n`;
  });

  next = next.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (_, text) => {
    return `\n\n${inlineMarkdown(text, routeMap, categoriesBySlug)}\n\n`;
  });

  next = next.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, text) => {
    return `\n- ${inlineMarkdown(text, routeMap, categoriesBySlug)}`;
  });

  next = next.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, text) => {
    return `\n\n> ${inlineMarkdown(text, routeMap, categoriesBySlug).replace(/\n/g, "\n> ")}\n\n`;
  });

  next = next
    .replace(/<\/?(?:div|figure|figcaption|ul|ol|main|section|article)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return `${next}\n`;
}

function sourceFileForRoute(route, type) {
  const clean = route === "/" ? "home" : route.replace(/^\/|\/$/g, "");
  const parts = clean.split("/");
  const file = `${parts.pop()}.md`;
  return path.join("content", type, ...parts, file);
}

function frontmatter(data, markdown) {
  return `---\n${JSON.stringify(data, null, 2)}\n---\n\n${markdown}`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function fetchPaged(type, fields) {
  const items = [];
  let page = 1;
  while (true) {
    const url = `${SOURCE}/wp-json/wp/v2/${type}?per_page=100&page=${page}&_fields=${fields}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    items.push(...(await response.json()));
    const totalPages = Number(response.headers.get("x-wp-totalpages") || "1");
    if (page >= totalPages) break;
    page += 1;
  }
  return items;
}

async function fetchMedia(ids) {
  const mediaById = new Map();
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  for (let index = 0; index < uniqueIds.length; index += 100) {
    const chunk = uniqueIds.slice(index, index + 100).join(",");
    const media = await fetchJson(`${SOURCE}/wp-json/wp/v2/media?include=${chunk}&per_page=100&_fields=id,source_url`);
    for (const item of media) {
      mediaById.set(item.id, item);
    }
  }
  return mediaById;
}

async function writeSource(file, contents) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents);
}

async function downloadAsset(url) {
  const target = path.join(process.cwd(), assetFileForUrl(url).replace(/^\//, ""));
  await mkdir(path.dirname(target), { recursive: true });

  try {
    let response = await fetch(url);
    if (!response.ok && new URL(url).hostname !== "sukritikapoor.com") {
      const fallback = new URL(url);
      fallback.hostname = "sukritikapoor.com";
      response = await fetch(fallback);
    }
    if (!response.ok) {
      console.warn(`Skipping ${url}: ${response.status}`);
      return;
    }
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.warn(`Skipping ${url}: ${error.message}`);
  }
}

async function main() {
  const [pages, posts, categories] = await Promise.all([
    fetchPaged("pages", "id,slug,link,title,content,date,modified,menu_order,parent"),
    fetchPaged("posts", "id,slug,link,title,date,categories,excerpt,content,featured_media"),
    fetchJson(`${SOURCE}/wp-json/wp/v2/categories?per_page=100&_fields=id,slug,name,count,link`),
  ]);

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
  const routeMap = new Map();

  for (const page of pages) routeMap.set(normalizeRouteFromLink(page.link), pageRoute(page));
  routeMap.set("/", "/");
  for (const post of posts) routeMap.set(normalizeRouteFromLink(post.link), postRoute(post));
  for (const category of categories) {
    routeMap.set(normalizeRouteFromLink(category.link), routeForCategory(category));
    routeMap.set(`/category/${category.slug}/`, routeForCategory(category));
  }
  const featuredMediaById = await fetchMedia(posts.map((post) => post.featured_media));

  await mkdir("content", { recursive: true });
  await writeFile(
    "content/categories.json",
    `${JSON.stringify(
      categories
        .filter((category) => category.count > 0)
        .map((category) => ({
          id: category.id,
          slug: category.slug,
          name: category.name,
          count: category.count,
          route: routeForCategory(category),
          legacyRoute: `/category/${category.slug}/`,
        })),
      null,
      2,
    )}\n`,
  );

  const homeImage = rewriteUrl(
    `${SOURCE}/wp-content/uploads/2023/03/IMG_2638-1-768x1024.jpg`,
    routeMap,
    categoriesBySlug,
  );

  await writeFile(
    "content/site.json",
    `${JSON.stringify(
      {
        title: "Sukriti Kapoor",
        description:
          "Sukriti Kapoor is a writer and editor sharing selected work, poetry, prose, books, and travel.",
        nav: [
          { label: "Work", route: "/work/" },
          { label: "Poetry", route: "/poetry/" },
          { label: "Prose", route: "/prose/" },
          { label: "About", route: "/about/" },
        ],
        social: [
          { label: "LinkedIn", url: "https://www.linkedin.com/in/sukritikapoor/" },
          { label: "Email", url: "mailto:mail@sukritikapoor.com" },
        ],
        home: {
          eyebrow: "Hi there!",
          title: "I'm Sukriti, a writer and editor, and this is my little corner on the web.",
          image: homeImage,
          intro: [
            "I'm Sukriti, a writer and editor who breathes, sleeps, and lives for the intricate world of words. I live in the land of windmills and stroopwafels, and love to travel to new countries, explore new cultures, and meet new people.",
            "I'm currently working as a content writer at Eurail. I'm also a voracious reader, sometimes like to cook, and am always up for dancing to early 2000s, pop, or Bollywood music.",
          ],
          cards: [
            {
              title: "Reading list",
              text: "Isn't it nice to lose yourself in a story? Find out all the books I'm currently reading and the ones I've read.",
              image: rewriteUrl(`${SOURCE}/wp-content/uploads/2023/04/out-0.png`, routeMap, categoriesBySlug),
              cta: "Read on",
              url: "https://www.goodreads.com/user/show/13884498-sukriti-kapoor",
            },
            {
              title: "Reach out",
              text: "Liked my work or want to have a chat? Send me an email and perhaps we can meet over a virtual cup of coffee.",
              image: rewriteUrl(`${SOURCE}/wp-content/uploads/2023/04/out-0-4.png`, routeMap, categoriesBySlug),
              cta: "Contact me",
              url: "mailto:mail@sukritikapoor.com",
            },
            {
              title: "Travel with me",
              text: "After the written word, travel is my second love. Discover all the places I've been to and see the world through my camera.",
              image: rewriteUrl(`${SOURCE}/wp-content/uploads/2023/04/out-0-1.png`, routeMap, categoriesBySlug),
              cta: "See my experiences",
              url: "https://www.polarsteps.com/SukritiKapoor",
            },
          ],
        },
      },
      null,
      2,
    )}\n`,
  );

  for (const page of pages.filter((item) => item.slug !== "home")) {
    const route = pageRoute(page);
    const title = stripHtml(page.title.rendered);
    await writeSource(
      sourceFileForRoute(route, "pages"),
      frontmatter(
        {
          type: "page",
          title,
          route,
          date: page.date,
          modified: page.modified,
          wordpressId: page.id,
          parent: page.parent,
        },
        htmlToMarkdown(page.content.rendered, routeMap, categoriesBySlug),
      ),
    );
  }

  for (const post of posts) {
    const route = postRoute(post);
    const title = stripHtml(post.title.rendered);
    const postCategories = post.categories
      .map((id) => categoriesById.get(id))
      .filter(Boolean)
      .map((category) => category.slug);
    const featuredMedia = featuredMediaById.get(post.featured_media);
    const featuredImage = featuredMedia?.source_url
      ? rewriteUrl(featuredMedia.source_url, routeMap, categoriesBySlug)
      : undefined;
    const data = {
      type: "post",
      title,
      route,
      date: post.date,
      wordpressId: post.id,
      categories: postCategories,
      excerpt: stripHtml(post.excerpt.rendered || post.content.rendered),
    };
    if (featuredImage) data.featuredImage = featuredImage;
    await writeSource(
      sourceFileForRoute(route, "posts"),
      frontmatter(
        data,
        htmlToMarkdown(post.content.rendered, routeMap, categoriesBySlug),
      ),
    );
  }

  await Promise.all([...assetUrls].map(downloadAsset));

  console.log(`Imported ${pages.length} pages, ${posts.length} posts, and ${assetUrls.size} assets.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

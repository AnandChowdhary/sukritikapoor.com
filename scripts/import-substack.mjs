import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { parseHTML } from "linkedom";
import Parser from "rss-parser";
import TurndownService from "turndown";

export const FEED_URL = "https://sukritikapoor15.substack.com/feed";
export const READER_URL = "https://r.jina.ai/";
const IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
]);

function documentFor(html) {
  return parseHTML(`<html><body>${html}</body></html>`).document;
}

function plainText(html) {
  const document = documentFor(html);
  document.querySelectorAll("script, style").forEach((node) => node.remove());
  return document.body.textContent.replace(/\s+/g, " ").trim();
}

async function fetchResponse(url, fetchImpl, headers = {}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(30_000),
        headers: { "User-Agent": "sukritikapoor.com Substack importer", ...headers },
      });
      if (response.ok) return response;
      if (attempt < 2 && (response.status === 429 || response.status >= 500)) {
        await response.body?.cancel();
      } else {
        const error = new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
    } catch (error) {
      if (attempt === 2 || error.message.startsWith("Failed to fetch")) throw error;
    }
    await setTimeout(1_000 * (attempt + 1));
  }
}

async function readFeed(fetchImpl, readerIntervalMs) {
  try {
    const response = await fetchResponse(FEED_URL, fetchImpl);
    return await new Parser().parseString(await response.text());
  } catch (error) {
    if (error.status !== 403) throw error;
    console.warn("Substack returned HTTP 403; fetching its public pages through Jina Reader.");
  }

  // Substack challenges GitHub-hosted runners. The public reader provides the
  // feed's URLs/dates and the visible article HTML without a login or API key.
  let lastRequest = 0;
  const readPage = async (url) => {
    await setTimeout(Math.max(0, readerIntervalMs - (Date.now() - lastRequest)));
    lastRequest = Date.now();
    const response = await fetchResponse(`${READER_URL}${url}`, fetchImpl, { "X-Return-Format": "html" });
    return parseHTML(await response.text()).document;
  };
  const index = await readPage(FEED_URL);
  const containers = [...index.querySelectorAll("body > div")];
  const items = [];
  for (const container of containers) {
    const link = container.querySelector("a[href]")?.getAttribute("href");
    const pubDate = container.querySelector("time")?.textContent;
    if (!link || !pubDate) continue;
    const url = new URL(link);
    if (url.origin !== new URL(FEED_URL).origin || !/^\/p\/[a-z0-9][a-z0-9_-]*\/?$/i.test(url.pathname)) {
      throw new Error(`Unexpected article URL from reader: ${link}`);
    }
    const article = await readPage(url.href);
    const body = article.querySelector(".available-content .body.markup");
    const title = article.querySelector('meta[property="og:title"]')?.getAttribute("content");
    const canonical = article.querySelector('link[rel="canonical"]')?.getAttribute("href");
    if (!body || !title || canonical !== url.href) {
      throw new Error(`Reader did not return the public article: ${link}`);
    }
    items.push({
      title,
      link: url.href,
      guid: url.href,
      pubDate,
      content: article.querySelector('meta[property="og:description"]')?.getAttribute("content") || "",
      "content:encoded": body.innerHTML,
    });
  }
  if (!items.length) throw new Error("Reader returned no valid feed entries");
  return { items };
}

async function entries(dir) {
  try {
    return await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function readPosts(root) {
  const posts = [];
  async function walk(dir) {
    for (const entry of await entries(path.join(root, dir))) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(file);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const contents = await readFile(path.join(root, file), "utf8");
        const match = contents.match(/^---\n([\s\S]*?)\n---\n/);
        if (!match) throw new Error(`Missing JSON frontmatter in ${file}`);
        posts.push({ file, contents, data: JSON.parse(match[1]) });
      }
    }
  }
  await walk("content/posts");
  return posts;
}

// The enclosure and inline image often use different CDN transformations of
// the same original. Give them one filename, and cache it across imports.
function imageIdentity(url) {
  const parsed = new URL(url);
  if (parsed.hostname === "substackcdn.com") {
    const match = parsed.pathname.match(/^\/image\/fetch\/[^/]+\/(.+)$/);
    if (match) return decodeURIComponent(match[1]);
  }
  parsed.hash = "";
  return parsed.href;
}

async function imageDownloader(root, fetchImpl, pending) {
  const cached = new Map();
  for (const entry of await entries(path.join(root, "assets/substack"))) {
    if (entry.isFile() && /^[a-f0-9]{24}\.(jpg|png|webp|gif|avif)$/.test(entry.name)) {
      cached.set(entry.name.split(".")[0], `/assets/substack/${entry.name}`);
    }
  }

  return async (source) => {
    const url = new URL(source);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error(`Unsupported image URL: ${source}`);
    }
    const key = createHash("sha256").update(imageIdentity(source)).digest("hex").slice(0, 24);
    if (cached.has(key)) return cached.get(key);

    const response = await fetchResponse(url.href, fetchImpl);
    const type = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
    const extension = IMAGE_TYPES.get(type);
    if (!extension) throw new Error(`Expected an image from ${source}, received ${type}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 20 * 1024 * 1024) {
      throw new Error(`Image is empty or larger than 20 MiB: ${source}`);
    }
    const local = `/assets/substack/${key}${extension}`;
    pending.set(local.slice(1), bytes);
    cached.set(key, local);
    return local;
  };
}

async function convertBody(html, sourceUrl, downloadImage) {
  const document = documentFor(html);
  document.querySelectorAll(
    "script, style, button, svg, form, .subscription-widget-wrap, .subscribe-widget, .paywall, .paywall-container",
  ).forEach((node) => node.remove());

  // Preserve a useful link for embeds without importing Substack's scripts.
  for (const embed of document.querySelectorAll("iframe, video, audio")) {
    const source = embed.getAttribute("src") || embed.querySelector("source")?.getAttribute("src");
    if (source) {
      const link = document.createElement("a");
      link.setAttribute("href", source);
      link.textContent = "View embedded media";
      embed.replaceWith(link);
    } else {
      embed.remove();
    }
  }

  for (const link of document.querySelectorAll("a[href]")) {
    if (link.classList.contains("image-link")) {
      link.replaceWith(...link.childNodes);
      continue;
    }
    const value = link.getAttribute("href");
    const url = new URL(value, sourceUrl);
    if (["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) {
      link.setAttribute("href", value.startsWith("#") ? value : url.href);
    } else {
      link.removeAttribute("href");
    }
  }

  let firstImage;
  for (const image of document.querySelectorAll("img")) {
    const source = image.getAttribute("src");
    if (!source) {
      image.remove();
      continue;
    }
    const local = await downloadImage(new URL(source, sourceUrl).href);
    image.setAttribute("src", local);
    firstImage ??= local;
  }

  const turndown = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    emDelimiter: "*",
    codeBlockStyle: "fenced",
  });
  const markdown = turndown.turndown(document.body.innerHTML).trim();
  if (!markdown) throw new Error(`Post has no importable body: ${sourceUrl}`);
  return { markdown, firstImage };
}

export async function importSubstack({ root = process.cwd(), fetchImpl = fetch, readerIntervalMs = 3_200 } = {}) {
  const feed = await readFeed(fetchImpl, readerIntervalMs);
  const posts = await readPosts(root);
  const pending = new Map();
  const downloadImage = await imageDownloader(root, fetchImpl, pending);
  const seen = new Set();
  const seenUrls = new Set();
  let changedPosts = 0;

  for (const item of feed.items) {
    const sourceUrl = new URL(item.link);
    const slug = sourceUrl.pathname.match(/^\/p\/([a-z0-9][a-z0-9_-]*)\/?$/i)?.[1];
    const title = item.title?.trim();
    const date = new Date(item.isoDate || item.pubDate);
    const html = item["content:encoded"];
    if (sourceUrl.origin !== new URL(FEED_URL).origin || !slug || !title || !Number.isFinite(date.getTime()) || !html?.trim()) {
      throw new Error(`Incomplete or unexpected feed item: ${item.link}`);
    }
    sourceUrl.search = "";
    sourceUrl.hash = "";
    const sourceId = item.guid || sourceUrl.href;
    if (seen.has(sourceId) || seenUrls.has(sourceUrl.href)) {
      throw new Error(`Duplicate feed item: ${sourceId}`);
    }
    seen.add(sourceId);
    seenUrls.add(sourceUrl.href);

    const existing = posts.find((post) => post.data.source === "substack" &&
      (post.data.sourceId === sourceId || post.data.sourceUrl === sourceUrl.href));
    const file = existing?.file || `content/posts/substack/${slug}.md`;
    const route = existing?.data.route || `/prose/${slug}/`;
    const collision = posts.find((post) => post.file !== existing?.file &&
      (post.file === file || post.data.route === route));
    if (collision) throw new Error(`Substack post would overwrite ${collision.file}: ${route}`);

    const { markdown, firstImage } = await convertBody(html, sourceUrl.href, downloadImage);
    const featuredImage = item.enclosure?.type?.startsWith("image/")
      ? await downloadImage(new URL(item.enclosure.url, sourceUrl).href)
      : firstImage;
    const data = {
      type: "post",
      title,
      route,
      date: date.toISOString(),
      categories: ["prose"],
      excerpt: plainText(item.content || item["content:encodedSnippet"] || "").slice(0, 300),
      source: "substack",
      sourceId,
      sourceUrl: sourceUrl.href,
      canonicalUrl: sourceUrl.href,
      ...(featuredImage ? { featuredImage } : {}),
    };
    const contents = `---\n${JSON.stringify(data, null, 2)}\n---\n\n${markdown}\n`;
    if (existing?.contents !== contents) {
      pending.set(file, contents);
      changedPosts += 1;
    }
    posts.push({ file, data, contents });
  }

  // Fetch and validate the whole feed before changing files. A failed image
  // download must not leave articles pointing at missing assets.
  const downloadedImages = [...pending.keys()].filter((file) => file.startsWith("assets/")).length;
  for (const [file, contents] of pending) {
    const target = path.join(root, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, contents);
  }
  return { posts: feed.items.length, changedPosts, downloadedImages };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  importSubstack().then(({ posts, changedPosts, downloadedImages }) => {
    console.log(`Checked ${posts} Substack posts; updated ${changedPosts} posts and downloaded ${downloadedImages} images.`);
  }).catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

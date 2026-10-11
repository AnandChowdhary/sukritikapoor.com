import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { parseHTML } from "linkedom";
import { FEED_URL, importSubstack } from "../scripts/import-substack.mjs";

const exec = promisify(execFile);
const repo = fileURLToPath(new URL("../", import.meta.url));
const imageUrl = "https://substack-post-media.s3.amazonaws.com/public/images/example.png";
// A real 1x1 PNG keeps the asset checks independent of live Substack requests.
const imageBytes = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1cAAAAASUVORK5CYII=", "base64");

function item({ slug = "first-post", title = "First post", date = "Fri, 09 Oct 2026 23:23:32 GMT", body, enclosure = imageUrl } = {}) {
  const article = body ?? `<h2>A heading</h2><p>A *literal* and <em>emphasis</em>, with <strong>bold</strong> text and a <a href="/about">relative link</a>.</p>
    <div class="captioned-image-container"><figure><a class="image-link" href="${imageUrl}"><img src="${imageUrl}" alt="A picture"></a><figcaption>Picture caption</figcaption></figure></div>
    <ol><li>First item</li><li>Second item</li></ol><blockquote><p>A quoted paragraph</p></blockquote>
    <p>Line one<br>Line two</p><pre><code>const answer = 42;</code></pre>
    <button>Enlarge image</button><svg><text>Toolbar icon</text></svg>
    <script>alert('unwanted')</script><div class="subscription-widget-wrap">Subscribe now</div>`;
  return `<item><title><![CDATA[${title}]]></title><link>https://sukritikapoor15.substack.com/p/${slug}</link>
    <guid isPermaLink="false">https://sukritikapoor15.substack.com/p/${slug}</guid><pubDate>${date}</pubDate>
    <description><![CDATA[A short &amp; useful description]]></description>
    ${enclosure ? `<enclosure url="${enclosure}" type="image/png" length="0"/>` : ""}
    <content:encoded><![CDATA[${article}]]></content:encoded></item>`;
}

function feed(items) {
  return `<?xml version="1.0"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel>
    <title>Sukriti Kapoor</title><link>https://sukritikapoor15.substack.com</link>${items.join("")}</channel></rss>`;
}

function fetcher(xml, { failImage = false } = {}) {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url === FEED_URL) return new Response(xml, { headers: { "content-type": "application/rss+xml" } });
    if (failImage) return new Response("Not found", { status: 404 });
    return new Response(imageBytes, { headers: { "content-type": "image/png" } });
  };
  return { calls, fetchImpl };
}

async function temporaryRepo(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "substack-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "content/posts/prose"), { recursive: true });
  await cp(path.join(repo, "content/site.json"), path.join(root, "content/site.json"));
  await cp(path.join(repo, "content/categories.json"), path.join(root, "content/categories.json"));
  await cp(path.join(repo, "content/posts/prose/2020.md"), path.join(root, "content/posts/prose/2020.md"));
  return root;
}

async function imported(root, slug = "first-post") {
  const contents = await readFile(path.join(root, `content/posts/substack/${slug}.md`), "utf8");
  const match = contents.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  return { data: JSON.parse(match[1]), body: match[2], contents };
}

async function snapshot(root) {
  const files = {};
  async function walk(dir) {
    for (const entry of await readdir(path.join(root, dir), { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(file);
      else files[file] = createHash("sha256").update(await readFile(path.join(root, file))).digest("hex");
    }
  }
  await walk("");
  return files;
}

test("imports articles and renders formatting, local images, attribution, and canonical URLs", async (t) => {
  const root = await temporaryRepo(t);
  const legacy = await readFile(path.join(root, "content/posts/prose/2020.md"), "utf8");
  const { calls, fetchImpl } = fetcher(feed([item()]));
  assert.deepEqual(await importSubstack({ root, fetchImpl }), { posts: 1, changedPosts: 1, downloadedImages: 1 });
  assert.equal(calls.length, 2, "the inline and featured image share one download");
  const { data, body } = await imported(root);
  assert.equal(data.date, "2026-10-09T23:23:32.000Z");
  assert.deepEqual(data.categories, ["prose"]);
  assert.equal(data.excerpt, "A short & useful description");
  assert.equal(data.canonicalUrl, "https://sukritikapoor15.substack.com/p/first-post");
  assert.match(data.featuredImage, /^\/assets\/substack\/[a-f0-9]{24}\.png$/);
  assert.match(body, /Picture caption/);
  assert.doesNotMatch(body, /Enlarge image|Toolbar icon|Subscribe now|unwanted/);
  assert.equal(await readFile(path.join(root, "content/posts/prose/2020.md"), "utf8"), legacy);

  await exec(process.execPath, [path.join(repo, "scripts/build.mjs")], { cwd: root });
  const html = await readFile(path.join(root, "dist/prose/first-post/index.html"), "utf8");
  const document = parseHTML(html).document;
  assert.equal(document.querySelector('link[rel="canonical"]').getAttribute("href"), data.sourceUrl);
  assert.equal(document.querySelector(".source-attribution a").getAttribute("href"), data.sourceUrl);
  assert.equal(document.querySelector(".rich-text h2").textContent, "A heading");
  assert.equal(document.querySelector(".rich-text em").textContent, "emphasis");
  assert.equal(document.querySelector(".rich-text strong").textContent, "bold");
  assert.match(document.querySelector(".rich-text p").textContent, /A \*literal\*/);
  assert.equal(document.querySelector(".rich-text a").getAttribute("href"), "https://sukritikapoor15.substack.com/about");
  assert.equal(document.querySelectorAll(".rich-text ol li").length, 2);
  assert.equal(document.querySelector(".rich-text blockquote p").textContent, "A quoted paragraph");
  assert.equal(document.querySelectorAll(".rich-text br").length, 1);
  assert.match(document.querySelector(".rich-text pre code").textContent, /const answer = 42/);
  const image = document.querySelector(".rich-text img").getAttribute("src");
  assert.deepEqual(await readFile(path.resolve(root, "dist/prose/first-post", image)), imageBytes);
  const listing = await readFile(path.join(root, "dist/prose/index.html"), "utf8");
  assert.match(listing, /first-post\//);
  assert.match(listing, /2020\//);
  assert.match(await readFile(path.join(root, "dist/sitemap.xml"), "utf8"), /\/prose\/first-post\//);
});

test("identical runs make no file changes or image requests; source edits update only the article", async (t) => {
  const root = await temporaryRepo(t);
  await importSubstack({ root, ...fetcher(feed([item()])) });
  const before = await snapshot(root);
  const second = fetcher(feed([item()]));
  assert.deepEqual(await importSubstack({ root, fetchImpl: second.fetchImpl }), { posts: 1, changedPosts: 0, downloadedImages: 0 });
  assert.deepEqual(second.calls, [FEED_URL]);
  assert.deepEqual(await snapshot(root), before);
  const edited = fetcher(feed([item({ title: "Updated title", body: `<p>Edited body</p><img src="${imageUrl}">` })]));
  assert.equal((await importSubstack({ root, fetchImpl: edited.fetchImpl })).changedPosts, 1);
  const article = await imported(root);
  assert.equal(article.data.title, "Updated title");
  assert.match(article.body, /Edited body/);
  assert.deepEqual(edited.calls, [FEED_URL]);
});

test("posts that leave the feed are retained, including when the feed is empty", async (t) => {
  const root = await temporaryRepo(t);
  await importSubstack({ root, ...fetcher(feed([item(), item({ slug: "second-post" })])) });
  const original = await imported(root);
  await importSubstack({ root, ...fetcher(feed([item({ slug: "second-post" })])) });
  assert.equal((await imported(root)).contents, original.contents);
  const before = await snapshot(root);
  assert.deepEqual(await importSubstack({ root, ...fetcher(feed([])) }), { posts: 0, changedPosts: 0, downloadedImages: 0 });
  assert.deepEqual(await snapshot(root), before);
});

test("a CDN enclosure and inline transformation share a stable cached image", async (t) => {
  const root = await temporaryRepo(t);
  const encoded = encodeURIComponent(imageUrl);
  const inline = `https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto/${encoded}`;
  const enclosure = `https://substackcdn.com/image/fetch/f_auto/${encoded}`;
  const source = fetcher(feed([item({ body: `<p>Body</p><img src="${inline}">`, enclosure })]));
  assert.equal((await importSubstack({ root, fetchImpl: source.fetchImpl })).downloadedImages, 1);
  assert.deepEqual(source.calls, [FEED_URL, inline]);
  const article = await imported(root);
  assert.ok(article.body.includes(article.data.featuredImage));
});

test("failed downloads and invalid items leave the existing content untouched", async (t) => {
  const root = await temporaryRepo(t);
  await importSubstack({ root, ...fetcher(feed([item()])) });
  const before = await snapshot(root);
  const broken = fetcher(feed([
    item({ title: "An edit that must not be saved" }),
    item({ slug: "broken-image", body: '<p>Body</p><img src="https://example.com/missing.png">', enclosure: null }),
  ]), { failImage: true });
  await assert.rejects(importSubstack({ root, fetchImpl: broken.fetchImpl }), /HTTP 404/);
  assert.deepEqual(await snapshot(root), before);

  for (const xml of [
    "not XML",
    feed([item({ date: "not a date" })]),
    feed([item({ body: "" })]),
    feed([item(), item()]),
    feed([item(), item().replace(/<guid[^>]*>[^<]+<\/guid>/, "<guid>different-guid</guid>")]),
  ]) {
    await assert.rejects(importSubstack({ root, ...fetcher(xml) }));
    assert.deepEqual(await snapshot(root), before);
  }
});

test("missing local images are downloaded again without changing article content", async (t) => {
  const root = await temporaryRepo(t);
  await importSubstack({ root, ...fetcher(feed([item()])) });
  const article = await imported(root);
  await rm(path.join(root, article.data.featuredImage.slice(1)));
  const source = fetcher(feed([item()]));
  assert.deepEqual(await importSubstack({ root, fetchImpl: source.fetchImpl }), { posts: 1, changedPosts: 0, downloadedImages: 1 });
  assert.equal((await imported(root)).contents, article.contents);
  assert.deepEqual(await readFile(path.join(root, article.data.featuredImage.slice(1))), imageBytes);
});

test("route collisions cannot overwrite legacy articles", async (t) => {
  const root = await temporaryRepo(t);
  const before = await snapshot(root);
  await assert.rejects(importSubstack({ root, ...fetcher(feed([item({ slug: "2020" })])) }), /would overwrite content\/posts\/prose\/2020.md/);
  assert.deepEqual(await snapshot(root), before);
});

test("unsafe links are removed and embedded media becomes a link", async (t) => {
  const root = await temporaryRepo(t);
  await importSubstack({ root, ...fetcher(feed([item({
    body: '<p>A <a href="javascript:alert(1)">bad link</a> and <a href="mailto:hello@example.com">email</a>.</p><iframe src="https://www.youtube.com/embed/example"></iframe>',
    enclosure: null,
  })])) });
  const { body } = await imported(root);
  assert.doesNotMatch(body, /javascript:|iframe/);
  assert.match(body, /bad link/);
  assert.match(body, /mailto:hello@example.com/);
  assert.match(body, /\[View embedded media\]\(https:\/\/www.youtube.com\/embed\/example\)/);
});

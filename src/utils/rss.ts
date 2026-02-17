import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import type { CollectionEntry } from "astro:content";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const markdownToHtml = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStringify);

const base = import.meta.env.BASE_URL;

export async function generateRssFeed(
  context: APIContext,
  collection: CollectionEntry<"poetry" | "prose">[],
  options: { title: string; description: string; basePath: string },
) {
  const sorted = [...collection].sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );

  const items = await Promise.all(
    sorted.map(async (entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: `${base}${options.basePath}/${entry.id}/`,
      content: entry.body
        ? String(await markdownToHtml.process(entry.body))
        : undefined,
    })),
  );

  return rss({
    title: options.title,
    description: options.description,
    site: context.site!,
    items,
  });
}

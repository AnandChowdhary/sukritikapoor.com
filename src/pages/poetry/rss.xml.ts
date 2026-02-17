import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const base = import.meta.env.BASE_URL;

const markdownToHtml = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStringify);

export async function GET(context: APIContext) {
  const poetry = await getCollection("poetry");
  const sorted = [...poetry].sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );

  const items = await Promise.all(
    sorted.map(async (poem) => ({
      title: poem.data.title,
      pubDate: poem.data.date,
      link: `${base}poetry/${poem.id}/`,
      content: poem.body
        ? String(await markdownToHtml.process(poem.body))
        : undefined,
    })),
  );

  return rss({
    title: "Poetry — Sukriti Kapoor",
    description: "Poetry by Sukriti Kapoor.",
    site: context.site!,
    items,
  });
}

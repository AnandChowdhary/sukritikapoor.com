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
  const prose = await getCollection("prose");
  const sorted = [...prose].sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );

  const items = await Promise.all(
    sorted.map(async (post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `${base}prose/${post.id}/`,
      content: post.body
        ? String(await markdownToHtml.process(post.body))
        : undefined,
    })),
  );

  return rss({
    title: "Prose — Sukriti Kapoor",
    description: "Prose by Sukriti Kapoor.",
    site: context.site!,
    items,
  });
}

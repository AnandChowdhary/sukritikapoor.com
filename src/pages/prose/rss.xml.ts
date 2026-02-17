import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

const base = import.meta.env.BASE_URL;

export async function GET(context: APIContext) {
  const prose = await getCollection("prose");
  const sorted = prose.sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );

  return rss({
    title: "Prose — Sukriti Kapoor",
    description: "Prose by Sukriti Kapoor.",
    site: context.site!,
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `${base}prose/${post.id}/`,
      content: post.body,
    })),
  });
}

import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

const base = import.meta.env.BASE_URL;

export async function GET(context: APIContext) {
  const poetry = await getCollection("poetry");
  const sorted = poetry.sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0),
  );

  return rss({
    title: "Poetry — Sukriti Kapoor",
    description: "Poetry by Sukriti Kapoor.",
    site: context.site!,
    items: sorted.map((poem) => ({
      title: poem.data.title,
      pubDate: poem.data.date,
      link: `${base}poetry/${poem.id}/`,
      content: poem.body,
    })),
  });
}

import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { generateRssFeed } from "../../utils/rss";

export async function GET(context: APIContext) {
  const poetry = await getCollection("poetry");
  return generateRssFeed(context, poetry, {
    title: "Poetry — Sukriti Kapoor",
    description: "Poetry by Sukriti Kapoor.",
    basePath: "poetry",
  });
}

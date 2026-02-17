import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { generateRssFeed } from "../../utils/rss";

export async function GET(context: APIContext) {
  const prose = await getCollection("prose");
  return generateRssFeed(context, prose, {
    title: "Prose — Sukriti Kapoor",
    description: "Prose by Sukriti Kapoor.",
    basePath: "prose",
  });
}

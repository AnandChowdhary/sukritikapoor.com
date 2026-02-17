import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const poetry = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/poetry" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
  }),
});

const prose = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/prose" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    description: z.string().optional(),
  }),
});

export const collections = { work, poetry, prose };

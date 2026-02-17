export function buildContentJsonLd(options: {
  type: "CreativeWork" | "Article";
  title: string;
  url: string;
  date?: Date;
  description?: string;
}): Record<string, unknown> {
  const titleKey = options.type === "Article" ? "headline" : "name";
  return {
    "@context": "https://schema.org",
    "@type": options.type,
    [titleKey]: options.title,
    author: { "@type": "Person", name: "Sukriti Kapoor" },
    ...(options.date && { datePublished: options.date.toISOString() }),
    ...(options.description && { description: options.description }),
    url: options.url,
  };
}

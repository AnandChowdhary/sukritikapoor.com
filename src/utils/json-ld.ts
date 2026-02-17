export function buildDefaultJsonLd(siteUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Sukriti Kapoor",
        url: siteUrl,
        description: "Sukriti Kapoor is a writer and editor.",
      },
      {
        "@type": "Person",
        name: "Sukriti Kapoor",
        url: siteUrl,
        jobTitle: "Writer and Editor",
        sameAs: [
          "https://www.linkedin.com/in/sukritikapoor/",
          "https://www.goodreads.com/user/show/13884498-sukriti-kapoor",
        ],
      },
    ],
  };
}

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

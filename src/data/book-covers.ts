export const bookCoverAltText: Record<string, string> = {
  book1: "The Civil War Visual Encyclopedia by DK Smithsonian",
  book2: "Super Simple Physics by DK",
  book3: "Eyewitness Forensic Science by DK",
  book4: "Picturepedia by DK Smithsonian",
  book5: "Mega Bites Dinosaurs by DK",
  book6: "1000 Inventions and Discoveries by DK",
  book7: "Super Simple Biology by DK",
};

const bookImages = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/images/books/*",
  { eager: true },
);

export const bookCovers = Object.entries(bookImages)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, mod]) => {
    const filename =
      path
        .split("/")
        .pop()
        ?.replace(/\.\w+$/, "") ?? "";
    return {
      src: mod.default,
      alt: bookCoverAltText[filename] ?? `Book cover: ${filename}`,
    };
  });

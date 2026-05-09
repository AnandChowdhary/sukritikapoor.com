import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve("dist");
const port = Number(process.env.PORT || 4173);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function fileForUrl(url) {
  const requestPath = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const cleanPath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  let file = path.join(root, cleanPath);
  if (requestPath.endsWith("/")) file = path.join(file, "index.html");
  return file;
}

createServer(async (request, response) => {
  let file = fileForUrl(request.url);
  try {
    const info = await stat(file);
    if (info.isDirectory()) file = path.join(file, "index.html");
    response.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    createReadStream(file).pipe(response);
  } catch {
    response.statusCode = 404;
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    createReadStream(path.join(root, "404", "index.html")).pipe(response);
  }
}).listen(port, () => {
  console.log(`Static site available at http://localhost:${port}/`);
});

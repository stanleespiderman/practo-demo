import "./build-preview.mjs";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, relative, extname, isAbsolute } from "node:path";
import { pathFromRoot } from "./paths.mjs";
const root = pathFromRoot("dist");
const port = Number(process.env.PREVIEW_PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw Error("Invalid PREVIEW_PORT");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};
const server = createServer(async (req, res) => {
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405);
    res.end();
    return;
  }
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const file = resolve(
      root,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    const inside = relative(root, file);
    if (inside.startsWith("..") || isAbsolute(inside)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (!(await stat(file)).isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const bytes = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(req.method === "HEAD" ? undefined : bytes);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Browser review: http://127.0.0.1:${port}/\nUse /doctor-mobile.html for doctor layouts. Ctrl+C stops the server.`,
  ),
);

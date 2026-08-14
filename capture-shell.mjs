import { writeFile } from "node:fs/promises";
import server from "./.output/server/index.mjs";

const res = await server.fetch(
  new Request("http://local.invalid/", { headers: { "accept": "text/html" } }),
  {},
  { waitUntil: () => {} },
);

const html = await res.text();
if (!html.includes("<!DOCTYPE html>")) {
  console.error("Unexpected response:", res.status, html.slice(0, 500));
  process.exit(1);
}
await writeFile("./.output/public/index.html", html, "utf8");
console.log("Captured index.html:", html.length, "bytes, status", res.status);
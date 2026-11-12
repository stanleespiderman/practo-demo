import { cpSync, copyFileSync, existsSync, rmSync } from "node:fs";
import { pathFromRoot } from "./paths.mjs";
// dist/ contains generated static output only. Never place source files there.
const input = pathFromRoot("web");
const output = pathFromRoot("dist");
if (!existsSync(pathFromRoot("web/index.html")))
  throw Error("web/index.html is missing");
rmSync(output, { recursive: true, force: true });
cpSync(input, output, { recursive: true });
copyFileSync(
  pathFromRoot("data/demo-seed.json"),
  pathFromRoot("dist/seed-data.json"),
);
console.log(
  "Built the separate browser review into dist/ (no Android packaging).",
);
